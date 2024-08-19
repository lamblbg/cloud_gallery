// pages/register/register.js
import Toast from '@vant/weapp/toast/toast';

Page({
    data: {
        checked: false,
    },

    onChange(event) {
        this.setData({
            checked: event.detail,
        });
    },

    onSubmit(event) {
        const { account, password } = event.detail.value
        wx.request({
            url: 'http://127.0.0.1:3001/user/login/jwt',
            method: 'POST',
            data: {
                "phone": account,
                "password": password
            },
            success: (res) => {
                if (res.data.code === 0) {
                    const { userInfo, token } = res.data.data
                    wx.setStorage({
                        key: 'userInfo',
                        data: userInfo
                    })
                    wx.setStorage({
                        key: 'token',
                        data: token
                    })
                    wx.redirectTo({
                        url: '/pages/index/index',
                    })
                }
                else {
                    Toast.fail('密码错误')
                    console.log('aa')
                }
            },
            fail: (err) => {
                console.log(err)
            }
        })
    }
})