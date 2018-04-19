import {post, STORAGE_TYPE} from '../../utils/util'

const app = getApp()
let searchData = {
  rowsNum: 9999,
  currentPage: 1,
  projectId: app.globalData.currentProject.projectId
}
let loading = false
const radius = 200 / 2
const lineWidth = 5

Page({
  data: {
    pixelRatio: 2,
    list: [],
    total: '',
    normal: '',
    abnormal: ''
  },
  // 事件处理函数
  bindViewTap: function () {

  },
  getList(cb) {
    if (searchData.currentPage === 1) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    loading = true
    post('/service/business/college/iccDevice/iccDevice/getDeviceRecordByProject.xf', searchData).then(res => {
      wx.hideLoading()
      res.data.result.forEach(item => {
        item.total = item.deviceRunCount + item.deviceNotRunCount
        item.rate = item.total === 0 ? 0 : item.deviceNotRunCount / item.total
      })
      let list = searchData.currentPage === 1 ? res.data.result : res.data.result.concat(this.data.list)
      this.setData({
        list: list
      }, () => {
        if (typeof cb === 'function') cb()
      })
    }).catch(() => {
      wx.hideLoading()
      loading = false
    })
  },
  handleTap(e) {
    const data = e.currentTarget.dataset
    wx.navigateTo({
      url: `../deviceList/deviceList?id=${data.id}&title=${data.title}`
    })
  },
  onPullDownRefresh() {
    searchData.currentPage = 1
    searchData.projectId = app.globalData.currentProject.projectId
    this.renderList(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    })
  },
  onReachBottom() {},
  drawCircle(id, start, total) {
    const pixelRatio = this.data.pixelRatio
    let context = wx.createCanvasContext(id)
    context.clearRect(0, 0, radius * 2, radius * 2)
    context.setStrokeStyle('#f9c139')
    context.setLineWidth(lineWidth * pixelRatio)
    context.beginPath()
    context.arc(radius / pixelRatio, radius / pixelRatio, radius / pixelRatio - lineWidth * pixelRatio, 0, start * Math.PI * 2)
    context.stroke()
    context.setStrokeStyle('#579cff')
    context.setLineWidth(lineWidth * pixelRatio)
    context.beginPath()
    context.arc(radius / pixelRatio, radius / pixelRatio, radius / pixelRatio - lineWidth * pixelRatio, start * Math.PI * 2, 2 * Math.PI)
    context.stroke()
    context.setFontSize(14)
    context.setTextAlign('center')
    context.setFillStyle('#ff0000')
    context.fillText(`${start * 100}%`, radius / pixelRatio, radius / pixelRatio - 5)
    context.setFillStyle('#000000')
    context.fillText(`共${total}台`, radius / pixelRatio, radius / pixelRatio + 15)
    context.draw()
  },
  repeatDraw(id, start, total) {
    this.drawCircle(id, start, total)
  },
  renderList(cb) {
    let total = 0
    let normal = 0
    let abnormal = 0
    this.getList(() => {
      this.data.list.forEach((item, index) => {
        this.repeatDraw(`xf${index}`, item.rate, item.total)
        normal += item.deviceRunCount
        abnormal += item.deviceNotRunCount
      })
      total = normal + abnormal
      this.setData({total, normal, abnormal})
      if (typeof cb === 'function') cb()
    })
  },
  onLoad: function () {
    searchData.currentPage = 1
    searchData.projectId = app.globalData.currentProject.projectId
    this.renderList()
  },
  onShow() {
    wx.setStorage({
      key: STORAGE_TYPE.currentTab,
      data: '../monitor/monitor'
    })
  }
})
