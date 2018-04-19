import {post, STORAGE_TYPE} from '../../utils/util'

Page({
  data: {
    password: '',
    newPassword: '',
    newPassword2: ''
  },
  bindSubmit() {
    if (!/^[a-zA-Z0-9]{1,15}$/.test(this.data.newPassword)) {
      wx.showToast({
        title: '密码规则为数字或字母，长度6-15位',
        icon: 'none'
      })
      return
    }
    if (this.data.newPassword !== this.data.newPassword2) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    post('/service/business/college/iccUser/iccUser/savePwd.xf', {
      userId: wx.getStorageSync(STORAGE_TYPE.uid),
      oldPassword: this.data.password,
      newPassword: this.data.newPassword,
      newPassword2: this.data.newPassword2,
      userType: 2
    }).then(res => {
      wx.hideLoading()
      if (res.data.error.result === 1) {
        wx.showToast({
          title: res.data.error.message,
          icon: 'success'
        })
        wx.navigateBack()
      } else {
        wx.showToast({
          title: res.data.error.message,
          icon: 'none'
        })
      }
    }).catch(() => {
      wx.hideLoading()
    })
  },
  handlePassword(e) {
    if (!/^[a-zA-Z0-9]{1,15}$/.test(e.detail.value)) return this.data.password
    this.setData({
      password: e.detail.value
    })
  },
  handleNewPassword(e) {
    if (!/^[a-zA-Z0-9]{1,15}$/.test(e.detail.value)) return this.data.newPassword
    this.setData({
      newPassword: e.detail.value
    })
  },
  handleNewPassword2(e) {
    if (!/^[a-zA-Z0-9]{1,15}$/.test(e.detail.value)) return this.data.newPassword2
    this.setData({
      newPassword2: e.detail.value
    })
  },
  bindCancel() {
    wx.navigateBack()
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {

  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {

  },
  // 生命周期函数--监听页面显示
  onShow: function () {

  },
  // 生命周期函数--监听页面隐藏
  onHide: function () {

  },
  // 生命周期函数--监听页面卸载
  onUnload: function () {

  },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {

  },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {

  },
  // 用户点击右上角分享
  onShareAppMessage: function () {

  }
})