Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: '云相册'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        // onBack(){
        //     wx.navigateBack()
        // }
    },
    // 允许多个插槽
    options: {
        multipleSlots: true,
        styleIsolation: 'shared',
    }

})