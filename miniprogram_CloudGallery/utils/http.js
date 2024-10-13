class Request {
    defaultOptions = {
        baseURL: 'http://127.0.0.1:3001',
        url: '',
        method: 'GET',
        data: null,
        header: {
            'Content-Type': 'application/json'
        },
        timeout: 1000 * 60
    }

    interceptors = {
        request(config) {
            // 可以在这里修改 config
            return config;
        },

        response(res) {
            return res;
        }
    }

    request(customOptions) {
        // 创建一个新的配置对象，避免修改 defaultOptions
        const options = { ...this.defaultOptions, ...customOptions };
        options.url = options.baseURL + options.url;
        let interceptedOptions = this.interceptors.request(options);

        if (interceptedOptions.method === 'UPLOAD') {
            let uploadTask = null;
            let uploadPromise = new Promise((resolve, reject) => {
                uploadTask = wx.uploadFile({
                    ...interceptedOptions,
                    success: (data) => {
                        Object.assign(data, { config: interceptedOptions });
                        resolve(this.interceptors.response(data));
                    },
                    fail: (error) => {
                        Object.assign(error, { config: interceptedOptions });
                        reject(this.interceptors.response(error));
                    }
                });

                // 如果传入了 onProgressUpdate 回调，立即绑定
                if (interceptedOptions.onProgressUpdate && typeof interceptedOptions.onProgressUpdate === 'function') {
                    uploadTask.onProgressUpdate(interceptedOptions.onProgressUpdate);
                }
            });

            return { uploadPromise, uploadTask };
        } else {
            return new Promise((resolve, reject) => {
                wx.request({
                    ...interceptedOptions,
                    success: (data) => {
                        Object.assign(data, { config: interceptedOptions });
                        resolve(this.interceptors.response(data));
                    },
                    fail: (error) => {
                        Object.assign(error, { config: interceptedOptions });
                        reject(this.interceptors.response(error));
                    }
                });
            });
        }
    }

    // 其他方法保持不变
    get(url, data = {}, config = {}) {
        return this.request({ url, data, method: 'GET', ...config });
    }

    delete(url, data = {}, config = {}) {
        return this.request({ url, data, method: 'DELETE', ...config });
    }

    post(url, data = {}, config = {}) {
        return this.request({ url, data, method: 'POST', ...config });
    }

    put(url, data = {}, config = {}) {
        return this.request({ url, data, method: 'PUT', ...config });
    }

    upload(url, filePath, name, formData, header, onProgressUpdate) {
        return this.request({
            url, filePath, name, formData, header, method: 'UPLOAD', onProgressUpdate // 传入 onProgressUpdate 回调
        });
    }
}

let instance = new Request();
export default instance;
