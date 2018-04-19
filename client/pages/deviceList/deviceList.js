import {post, dateFormat} from '../../utils/util'

const app = getApp()
let timeStamp = new Date().getTime()
let startTime = new Date()
let endTime = new Date()
let searchData = {
  rowsNum: 20,
  currentPage: 1,
  deviceType: '',
  projectId: '',
  startTime: dateFormat.call(startTime, 'yyyy-MM-dd'),
  endTime: dateFormat.call(endTime, 'yyyy-MM-dd')
}
let pageBean = {}

Page({
  data: {
    list: [],
    loading: false
  },
  handleTap(e) {
    const data = e.currentTarget.dataset
    wx.navigateTo({
      url: `../deviceDetail/deviceDetail?id=${data.id || ''}&type=${data.type || ''}&time=${data.time ? dateFormat.call(new Date(data.time), 'yyyy-MM-dd') : ''}&position=${data.position || ''}&code=${data.code || ''}&machine=${data.machine || ''}&status=${data.status || ''}`
    })
  },
  getList(cb) {
    if (searchData.currentPage === 1) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    this.setData({
      loading: true
    })
    post('/service/business/college/iccDevice/iccDevice/editDeviceRecordList.xf', searchData).then(res => {
      wx.hideLoading()
      this.setData({
        loading: false
      })
      pageBean = res.data.pageBean
      res.data.result.forEach(item => {
        // 1为未开机、 2为异常、 3为正常
        // item.status = Number(item.openCounts) === 0 ? 1 : Number(item.deviceLastRunStatus) === 0 ? 2 : 3
        item.status = Number(item.deviceLastRunStatus) === 0 ? 2 : 3
        item.statusStr = item.status === 1 ? '未开机' : item.status === 2 ? '运行异常' : '运行正常'
      })
      let list = searchData.currentPage === 1 ? res.data.result : res.data.result.concat(this.data.list)
      this.setData({
        list: list
      }, () => {
        if (typeof cb === 'function') cb()
      })
    }).catch(() => {
      wx.hideLoading()
      this.setData({
        loading: false
      })
    })
  },
  onPullDownRefresh() {
    searchData.currentPage = 1
    this.getList(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    })
  },
  onReachBottom() {
    if (this.data.loading) return
    if (pageBean.hasNextPage) {
      searchData.currentPage ++
      this.getList()
    }
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    searchData.deviceType = options.id
    searchData.projectId = app.globalData.currentProject.projectId
    wx.setNavigationBarTitle({
      title: options.title || ''
    })
    this.getList()
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
  // 用户点击右上角分享
  onShareAppMessage: function () {

  }
})