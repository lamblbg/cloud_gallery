const SparkMD5 = require('./spark-md5.js');
import http from './http.js';


// 传入一个待上传的allTempFiles文件数组，每个元素要有url、size属性  
export async function uploadHandler(allTempFiles, userName, progressCallback, chunkSize = 1024 * 1024 * 1) { // 1MB  
    let newAllTempFiles = []
    allTempFiles = await compress(allTempFiles)
    let totalFileSize = allTempFiles.reduce((prev, cur) => prev += cur.size, 0)
    let uploadedProgressArr = []

    function handleUploadProgress(progressCallback, index) {
        return (res) => {
            if (progressCallback && typeof progressCallback === 'function') {
                uploadedProgressArr[index] = res.totalBytesSent
                let curProgress = Math.floor(uploadedProgressArr.reduce((prev, cur) => prev += cur, 0) / totalFileSize * 100)
                progressCallback(curProgress)
            }
        }
    }

    for (let item of allTempFiles) {

        if (item.size <= chunkSize) {
            newAllTempFiles.push(item)
        }
        else {
            // 读大文件  
            let fileArrayBuffer = await readBigFile(item);
            let fileMD5 = SparkMD5.hashBinary(fileArrayBuffer.data);
            let fileExtension = item.url.match(/(\.[^.]+)$/)[1];
            // 分片  
            let fileChunks = await _sharding(fileArrayBuffer, chunkSize, fileMD5, fileExtension)
            newAllTempFiles.push(...fileChunks)
        }
    }
    
    let uploadTasks = newAllTempFiles.map((item, index) => {
        if (item.size) {
            console.log('小文件');
            let task = _upload(false, item.url, userName, handleUploadProgress(progressCallback, index));
            task.type = 'small file'
            return task
        }
        else {
            console.log('大文件的分片');
            let task = _upload(true, item, userName, handleUploadProgress(progressCallback, index));
            task.type = 'big file'
            task.fileHash = item.fileHash
            task.fileExt = item.fileExtension
            return task
        }
    })
    return uploadTasks;
}

// 压缩
async function compress(fileList) {
    for (let item of fileList) {
        // 更新上传的文件为压缩后的文件
        let res = await wx.compressImage({
            src: item.url,
            quality: 12
        })
        item.url = res.tempFilePath

        // 更新文件大小为压缩后的文件的大小
        let fileInfo = await new Promise(resolve => {
            wx.getFileSystemManager().getFileInfo({
                filePath: item.url,
                success: resolve
            })
        })
        item.size = fileInfo.size
    }
    return fileList
}

// 读大文件
async function readBigFile(TempFiles) {
    return new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
            filePath: TempFiles.url,
            encoding: 'binary', // 读取为ArrayBuffer    
            success: res => resolve(res),
            fail: err => reject(err)
        });
    });
}

// 分片
async function _sharding(fileArrayBuffer, chunkSize, fileMD5, fileExtension) {
    let fileData = fileArrayBuffer.data;
    let fileLength = fileData.length;
    let startOffset = 0;
    let chunkQuantity = Math.ceil(fileLength / chunkSize);

    async function writeChunkToTempFile(arrayBuffer, fileMD5Hash, chunkIndex) {
        return new Promise((resolve, reject) => {
            const fs = wx.getFileSystemManager();
            fs.mkdir({ dirPath: `${wx.env.USER_DATA_PATH}/${fileMD5Hash}` });
            const chunkPath = `${wx.env.USER_DATA_PATH}/${fileMD5Hash}/${chunkIndex}`;
            fs.writeFile({
                filePath: chunkPath,
                data: arrayBuffer,
                encoding: 'binary',
                success: res => {
                    let chunkInfo = {
                        fileHash: fileMD5Hash,
                        chunkHash: chunkIndex,
                        chunkPath: chunkPath,
                        fileExtension: fileExtension
                    };
                    resolve(chunkInfo);
                },
                fail: err => {
                    reject(err);
                }
            });
        });
    }

    async function handleChunk(index) {
        if (index >= chunkQuantity) return;

        let chunk = fileData.slice(startOffset, startOffset + chunkSize);
        startOffset += chunkSize;
        if (startOffset > fileLength) {
            // 处理最后一个分片可能不足chunkSize的情况    
            chunk = fileData.slice(startOffset - chunkSize, fileLength);
        }
        // 将分片保存到本地临时目录   
        return await writeChunkToTempFile(chunk, fileMD5, index);
    }

    let shardingTask = new Array(chunkQuantity).fill(0).map((_, index) => handleChunk(index))
    return await Promise.all(shardingTask);
}

// 上传文件   
function _upload(isLargeFile, filePathOrChunkInfo, userName, onProgressUpdate) {
    if (!isLargeFile) {
        return http.upload('/upload/single', filePathOrChunkInfo, 'album', {
            user: userName
        }, null, onProgressUpdate);
    }
    else {
        return http.upload('/upload/largefile', filePathOrChunkInfo.chunkPath, 'chunk', {
            fileHash: filePathOrChunkInfo.fileHash,
            chunkHash: filePathOrChunkInfo.chunkHash,
            user: userName
        }, null, onProgressUpdate);
    }
}

// 大文件合并  
export async function merge(fileHash, fileExt, userName) {
    let mergeResult = await http.request({
        url: '/upload/merge',
        method: 'POST',
        data: {
            fileHash,
            ext: fileExt,
            user: userName
        }
    });
    return mergeResult.data;
}