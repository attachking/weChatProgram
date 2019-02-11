import {post, dateFormat, STORAGE_TYPE} from '../../utils/util'

let searchData = {
  rowsNum: 20,
  currentPage: 1,
  startTime: '',
  endTime: '',
  deviceCode: ''
}
let pageBean = {}
function handleDay(n) {
  n--
  let timeStamp = new Date().getTime() - 1000 * 60 * 60 * 24 * n
  searchData.endTime = dateFormat.call(new Date(), 'yyyy-MM-dd')
  searchData.startTime = dateFormat.call(new Date(timeStamp), 'yyyy-MM-dd')
}

Page({
  data: {
    cycle: '',
    recordType: '',
    recordTypeCode: 'first',
    loading: false,
    list: [],
    type: '',
    time: '',
    code: '',
    position: '',
    machine: '',
    status: '',
    editable: 0
  },
  handleCycleChange() {
    let _this = this
    let itemList = this.data.recordTypeCode === 'first' ? ['1天', '3天', '7天'] : ['1天']
    wx.showActionSheet({
      itemList: itemList,
      success(index) {
        _this.setData({
          cycle: itemList[index.tapIndex]
        })
        if (index.tapIndex === 0) {
          handleDay(1)
        } else if (index.tapIndex === 1) {
          handleDay(3)
        } else {
          handleDay(7)
        }
        searchData.currentPage = 1
        _this.getList()
      }
    })
  },
  handleTypeChange() {
    let _this = this
    let itemList = ['开机记录', '运行记录']
    wx.showActionSheet({
      itemList: itemList,
      success(index) {
        let recordTypeCode
        if (index.tapIndex === 0) {
          recordTypeCode = 'first'
        } else {
          // 选择运行记录时，只能选择一天
          _this.setData({
            cycle: '1天'
          })
          handleDay(1)
          _this.getList()
          recordTypeCode = 'second'
        }
        _this.setData({
          recordType: itemList[index.tapIndex],
          recordTypeCode
        })
      }
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
      res.data.result.forEach(item => {
        item.deviceLastRunStatus = Number(item.deviceLastRunStatus)
        item.openCounts = Number(item.openCounts)
      })
      pageBean = res.data.pageBean
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
  initAll() {
    this.setData({
      cycle: '统计周期',
      recordType: '记录类型'
    })
  },
  handleAdd() {
    if (this.data.editable === 0) return
    wx.navigateTo({
      url: `../repairForm/repairForm?deviceid=${searchData.deviceId}`
    })
  },
  getDetail(id) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    post('/service/business/college/iccDevice/iccDevice/editDeviceInfo.xf', {
      userId: wx.getStorageSync(STORAGE_TYPE.uid),
      deviceId: id,
      rowsNum: 1,
      currentPage: 1
    }).then(res => {
      wx.hideLoading()
      const data = res.data.result.iccDevice
      data.deviceInstallTime = typeof data.deviceInstallTime === 'string' ? data.deviceInstallTime.replace(/-/g, '/') : data.deviceInstallTime
      this.setData({
        type: data.parameterOption || '--',
        time: data.deviceInstallTime ? dateFormat.call(new Date(data.deviceInstallTime), 'yyyy-MM-dd') : '--',
        code: data.deviceCode || '--',
        customerCode: data.deviceRegisteCode || '--',
        position: data.devicePosition || '--',
        machine: data.deviceMachineCode || '--',
        // status: Number(data.deviceOpenCounts) === 0 ? 1 : Number(data.deviceLastRunStatus) === 0 ? 2 : 3
        status: Number(data.deviceLastRunStatus) === 0 ? 2 : 3,
        editable: Number(res.data.result.forwardFlag)
      })
    }).catch(() => {
      wx.hideLoading()
    })
  },
  handleRecord() {
    wx.navigateTo({
      url: `../repairList-self/repairList-self?deviceCode=${this.data.code}`
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    searchData.currentPage = 1
    searchData.deviceCode = options.code || ''
    searchData.deviceId = options.id || ''
    this.getDetail(options.id)
    this.initAll()
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
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    searchData.currentPage = 1
    searchData.startTime = ''
    searchData.endTime = ''
    this.getDetail(searchData.deviceId)
    this.initAll()
    this.getList(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    })
  },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {
    if (this.data.loading) return
    if (pageBean.hasNextPage) {
      searchData.currentPage ++
      this.getList()
    }
  },
  // 用户点击右上角分享
  onShareAppMessage: function () {

  }
})