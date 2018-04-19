const app = getApp()

let form = {
  userId: '', // 用户ID
  knowledgeId: '', // 知识ID
  knowledgeHead: '', // 标题
  knowledgeKeyword: '', // 关键字
  knowledgeType: '', // 问题类型
  knowledgeDesc: '', // 问题描述
  knowledgeMethod: '', // 解决方法
  deviceFileUrl: '', //
  deviceFileType: 2,
  deviceFileName: ''
}

Page({
  data: {
    issues: [],
    issueTitle: '', // 标题
    keywords: '', // 关键字
    issue: '', // 问题类型ID
    issueName: '请选择问题类型',
    desc: '', // 问题描述
    solution: '' // 解决方法
  },
  handleIssueTitle(e) {
    const value = e.detail.value
    if (value.length > 50) return form.knowledgeHead
    form.knowledgeHead = value
  },
  handleKeywords(e) {
    const value = e.detail.value
    if (value.length > 50) return form.knowledgeKeyword
    form.knowledgeKeyword = value
  },
  handleIssue(e) {
    this.setData({
      issue: this.data.issues[e.detail.value].code,
      issueName: this.data.issues[e.detail.value].name
    })
    form.knowledgeType = this.data.issues[e.detail.value].code
  },
  handleDesc(e) {
    form.knowledgeDesc = e.detail.value
  },
  handleSolution(e) {
    form.knowledgeMethod = e.detail.value
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
  
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {
  
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    this.setData({
      issues: app.globalData.issues
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
  
  },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {
  
  },
  // 用户点击右上角分享
  onShareAppMessage: function () {

  }
})