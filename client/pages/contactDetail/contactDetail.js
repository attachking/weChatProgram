Page({
  data: {
    contact: '',
    tel: '',
    department: '',
    duty: ''
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    this.setData({
			contact: options.name,
			tel: options.tel,
			department: options.department,
			duty: options.duty
    })
		wx.setNavigationBarTitle({
      title: options.name
    })
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