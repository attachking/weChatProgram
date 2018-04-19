import {post} from '../../utils/util'

Page({
  data: {
    detail: {},
    tel: '18236698270',
    imgArr: []
  },
  handleTel() {
    let _this = this
    wx.showActionSheet({
      itemList: ['拨号'],
      success() {
        wx.makePhoneCall({
          phoneNumber: _this.data.tel
        })
      }
    })
  },
  handleImg(e) {
    let index = e.currentTarget.dataset.idx
    wx.previewImage({
      current: this.data.imgArr[index],
      urls: this.data.imgArr
    })
  },
  handleImg2(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: [e.currentTarget.dataset.url]
    })
  },
  getDetail(repairRecordId) {
    post('/service/business/college/iccDevice/iccRepairRecord/editRepairRecordInfo.xf', {repairRecordId}).then(res => {
      this.setData({
        detail: res.data.result.iccRepairRecord,
        imgArr: res.data.result.fileList.map(item => item.deviceFileUrl)
      })
    })
  },
  handlePosition(e) {
    const data = e.currentTarget.dataset
    wx.openLocation({
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lng),
      name: data.name
    })
  },
  handlePhone(e) {
    const data = e.currentTarget.dataset
    wx.showActionSheet({
      itemList: ['拨号'],
      success() {
        wx.makePhoneCall({
          phoneNumber: data.tel
        })
      }
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    this.getDetail(options.id)
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