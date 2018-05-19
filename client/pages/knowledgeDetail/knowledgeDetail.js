import {post, BASE_URL} from '../../utils/util'

Page({
  data: {
    files: [],
    detail: {}
  },
  handleImg(e) {
    let index = e.currentTarget.dataset.idx
    let images = []
    for (let i = 0; i < this.data.files.length; i++) {
      if (this.data.files[i].type === 0) {
        images.push(this.data.files[i].url)
      }
    }
    wx.previewImage({
      current: this.data.files[index].url,
      urls: images
    })
  },
  handleFile(e) {
    let url = e.currentTarget.dataset.url.replace(/^http(s)?:\/\/(.*?)\//g, BASE_URL + '/')
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.downloadFile({
      url: url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          success: function (res) {

          }
        })
      },
      fail(err) {},
      complete() {
        wx.hideLoading()
      }
    })
  },
	getDetail(iccKnowledgeId) {
    post('/service/business/college/iccKnowledge/iccKnowledge/editKnowledgeInfo.xf', {iccKnowledgeId}).then(res => {
      let files = res.data.result.iccDeviceFileList.map(item => {
        let type = /\.(png|jpe?g|gif|svg)(\?.*)?$/.test(item.deviceFileUrl) ? 0 : 1
        return {
          type,
          url: item.deviceFileUrl,
          name: item.deviceFileName
        }
      })
      this.setData({
        detail: res.data.result.iccKnowledgeInfo,
        files
      })
      wx.setNavigationBarTitle({
        title: res.data.result.iccKnowledgeInfo.knowledgeHead || '--'
      })
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