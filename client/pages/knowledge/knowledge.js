import {STORAGE_TYPE, post} from '../../utils/util'

const app = getApp()
let searchData = {
  rowsNum: 20,
  currentPage: 1,
  knowledgeDesc: '',
  knowledgeType: ''
}
let pageBean = {}

Page({
  data: {
    selections: [],
    selectedName: '全部',
    keywords: '',
    loading: true
  },
	handleChange(e) {
    const value = e.detail.value
    this.setData({
			selectedName: this.data.selections[value].name
    })
    searchData.knowledgeType = this.data.selections[value].code
    searchData.currentPage = 1
    this.getList()
  },
	handleInput(e) {
    const value = e.detail.value
    if (value.length > 20) return this.data.keywords
    this.setData({
      keywords: value
    })
  },
	handleConfirm() {
    searchData.knowledgeDesc = this.data.keywords
    searchData.currentPage = 1
    this.getList()
  },
  getList(cb) {
    this.setData({
      loading: true
    })
    if (searchData.currentPage === 1) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    post('/service/business/college/iccKnowledge/iccKnowledge/getKnowledgeList.xf', searchData).then(res => {
      wx.hideLoading()
      this.setData({
        loading: false
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
	handleDetail(e) {
    const data = e.currentTarget.dataset
		wx.navigateTo({
      url: `../knowledgeDetail/knowledgeDetail?id=${data.id}`
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    this.initPage()
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {

  },
  initPage(cb) {
    searchData = {
      rowsNum: 20,
      currentPage: 1,
      knowledgeDesc: '',
      knowledgeType: ''
    }
    this.setData({
      selectedName: '全部',
      keywords: ''
    })
    this.getList(cb)
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    this.setData({
      selections: app.globalData.issues
    })
    wx.setStorage({
      key: STORAGE_TYPE.currentTab,
      data: '../knowledge/knowledge'
    })
  },
  // 生命周期函数--监听页面隐藏
  onHide: function () {
  
  },
  // 生命周期函数--监听页面卸载
  onUnload: function () {

  },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    this.initPage(() => {
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