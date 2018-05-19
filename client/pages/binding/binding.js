import {post, STORAGE_TYPE, getAuthen} from '../../utils/util'

const app = getApp()

Page({
  data: {
    validDay: '', // 有效期（天）
    machine: '', // 机器码
    address: '', // 地址
    deviceType: '', // 设备类型
    deviceId: '', // 本地设备ID
    deviceCode: '', // 设备ID(设备屏幕)
    xfCode: '', // 本地设备编码
    range1: [],
    deviceTypeName: '请选择设备类型',
    latitude: '', // 纬度
    longitude: '', // 经度
    isFocus: false,
    isDisabled:true
  },
  handleAddress(e) {
    const value = e.detail.value
    this.setData({
      address: value
    })
  },
  handleBlur() {
    this.setData({
      isDisabled:true
    })
  },
  getGPS() {
    let _this = this
    if (this.data.latitude) {
      wx.showActionSheet({
        itemList: ['编辑详细位置', '重新定位'],
        success(index) {
          if (index.tapIndex === 0) {
            _this.setData({
              isFocus:true,
              isDisabled: false
            })
          } else if (index.tapIndex === 1) {
            _this.choosePos()
          }
        }
      })
    } else {
      this.choosePos()
    }
  },
  choosePos() {
    let _this = this
    getAuthen('scope.userLocation').then(() => {
      wx.chooseLocation({
        success(e) {
          _this.setData({
            address: e.address,
            latitude: e.latitude,
            longitude: e.longitude
          })
        },
        fail(err) {
          if (err.errMsg === 'chooseLocation:fail auth deny') {
            wx.showModal({
              title: '提示',
              content: '此功能需用户授权',
              showCancel: false
            })
          }
        }
      })
    }).catch(() => {
      wx.showModal({
        title: '提示',
        content: '请允许使用我的地理位置',
        success({confirm}) {
          if (confirm) {
            wx.openSetting()
          }
        }
      })
    })
  },
  handleType(e) {
    this.setData({
      deviceType: this.data.range1[e.detail.value].code,
      deviceTypeName: this.data.range1[e.detail.value].name
    })
  },
  handleScanCode() {
    // 机器码|设备ID
    let _this = this
    wx.scanCode({
      success(res) {
        if (res.errMsg === 'scanCode:ok') {
          let index = res.result.indexOf('|')
          if (index === -1) return
          let machine = res.result.substring(0, index)
          let deviceCode = res.result.substring(index + 1)
          _this.setData({
            machine: machine,
            deviceCode: deviceCode
          })
        }
      }
    })
  },
  handleValidDay(e) {
    let value = e.detail.value
    if (!/^[1-9][0-9]{0,5}$/.test(value) && value !== '') return this.data.validDay
    this.setData({
      validDay: value
    })
  },
  onSubmit() {
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    if (!this.data.machine) {
      wx.showToast({
        title: '请输入机器码',
        icon: 'none'
      })
      return
    }
    if (!this.data.deviceType) {
      wx.showToast({
        title: '请选择设备类型',
        icon: 'none'
      })
      return
    }
    if (!this.data.deviceId) {
      wx.showToast({
        title: '请输入设备ID',
        icon: 'none'
      })
      return
    }
    if (!this.data.deviceCode) {
      wx.showToast({
        title: '请输入设备编码',
        icon: 'none'
      })
      return
    }
    if (!this.data.address) {
      wx.showToast({
        title: '请选择摆放位置',
        icon: 'none'
      })
      return
    }
    post('/service/business/college/iccDevice/iccDevice/gantLicense.xf', {
      deviceMachineCode: this.data.machine,
      deviceCode: this.data.deviceCode,
      deviceTypeCode: this.data.deviceType,
      validDay: this.data.validDay || 0,
      deviceId: this.data.deviceId,
      devicePosition: this.data.address,
      deviceLat: this.data.latitude,
      deviceLng: this.data.longitude,
      userId: wx.getStorageSync(STORAGE_TYPE.uid)
    }).then(res => {
      wx.hideLoading()
      if (res.data.error.result === 1) {
        wx.showToast({
          title: res.data.error.message,
          icon: 'success',
          success() {
            wx.switchTab({
              url: wx.getStorageSync(STORAGE_TYPE.currentTab)
            })
          }
        })
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
  onCancel() {
    wx.switchTab({
      url: wx.getStorageSync(STORAGE_TYPE.currentTab)
    })
  },
  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.setData({
      xfCode: options.deviceCode,
      deviceId: options.deviceId
    })
    if (options.deviceType) {
      for (let i = 0; i < app.globalData.deviceType.length; i++) {
        if (app.globalData.deviceType[i].code + '' === options.deviceType + '') {
          this.setData({
            deviceType: app.globalData.deviceType[i].code,
            deviceTypeName: app.globalData.deviceType[i].name
          })
          break
        }
      }
    }
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {

  },
  // 生命周期函数--监听页面显示
  onShow() {
    this.setData({
      range1: app.globalData.deviceType
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