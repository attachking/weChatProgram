import {STORAGE_TYPE, queryParse, post} from '../../utils/util'

let status = false

Page({
  data: {},
  scanCode() {
    status = true
    let _this = this
    wx.scanCode({
      success(res) {
        if (res.errMsg === 'scanCode:ok') {
          if (res.result.indexOf('.xf') !== -1) {
            let query = queryParse(res.result)
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            post('/service/business/college/iccDevice/iccDevice/editDeviceInfo.xf', {
              deviceId: query.deviceId,
              rowsNum: 1,
              currentPage: 1
            }).then(res => {
              wx.hideLoading()
              if (!res.data.result.iccDevice.deviceLicenseKey) {
                wx.navigateTo({
                  url: `../binding/binding?deviceCode=${query.deviceCode}&deviceId=${query.deviceId}&deviceType=${query.deviceType || ''}`
                })
              } else {
                wx.navigateTo({
                  url: `../deviceDetail/deviceDetail?id=${query.deviceId}`
                })
              }
              setTimeout(() => {
                status = false
              }, 1000)
            }).catch(() => {
              wx.hideLoading()
              wx.switchTab({
                url: wx.getStorageSync(STORAGE_TYPE.currentTab)
              })
            })
          } else {
            wx.switchTab({
              url: wx.getStorageSync(STORAGE_TYPE.currentTab)
            })
          }
        } else {
          wx.switchTab({
            url: wx.getStorageSync(STORAGE_TYPE.currentTab)
          })
        }
      },
      fail(err) {
        wx.switchTab({
          url: wx.getStorageSync(STORAGE_TYPE.currentTab)
        })
      }
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {

  },
  onTabItemTap() {
    this.scanCode()
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {

  },
  // 生命周期函数--监听页面显示
  onShow() {
    setTimeout(() => {
      if (!status) {
        wx.switchTab({
          url: wx.getStorageSync(STORAGE_TYPE.currentTab)
        })
      }
    }, 300)
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