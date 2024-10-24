// app.js
import http from '@/utils/http.js'


App({
    async login() {
        let { code } = await wx.login()
        let res = await http.post('/user/login/wxcode', { code })
        let { userInfo, session } = res.data.data
        wx.setStorage({
            key: 'userInfo',
            data: userInfo
        })
        wx.setStorage({
            key: 'session',
            data: session
        })
    },
    onLaunch() {
        this.login()
        
    },
    globalData: {

    }
})
