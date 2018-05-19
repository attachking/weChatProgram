import {post, STORAGE_TYPE} from '../../utils/util'
import event, {EVENT_TYPES} from '../../utils/event'

const app = getApp()

Page({
  data: {
    loginStatus: 1,
    username: '',
    password: '',
    showForm: false,
    // 用于清空用户名密码
    showUsername: '',
    showPassword: ''
  },
  handleUsername(e) {
    const val = e.detail.value
    if (val.length > 25) return this.data.username
    this.setData({
      username: val
    })
  },
  handlePassword(e) {
    const val = e.detail.value
    if (val.length > 25) return this.data.password
    this.setData({
      password: val
    })
  },
  clear1() {
    this.setData({
      username: '',
      showUsername: ''
    })
  },
  clear2() {
    this.setData({
      password: '',
      showPassword: ''
    })
  },
  handleLogin() {
    if (!this.data.username || !this.data.username) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    post('/service/business/college/iccWechat/iccWechat/wechatLogin.xf', {
      userAccount: this.data.username,
      userPassword: this.data.password,
      openId: this.openid
    }).then(res => {
      if (res.data.error.result === 1) {
        wx.hideLoading()
        this.saveStorage(res.data.result)
        wx.showToast({
          title: '登陆成功！',
          icon: 'success',
          complete() {
            wx.switchTab({
              url: '../monitor/monitor'
            })
          }
        })
        this.getProjectList()
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
  getWeixinUserInfo() {
    wx.getUserInfo({
      lang: 'zh_CN',
      success(res) {
        app.globalData.userInfo = res.userInfo
      },
      fail() {
        wx.showToast({
          title: '获取用户基本信息失败',
          icon: 'none'
        })
      },
      complete() {}
    })
  },
	getUserInfo() {
    let _this = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.login({
      success(res) {
        post('/service/business/college/iccWechat/iccWechat/getWechatOpenId.xf', {
          jsCode: res.code
        }).then(res => {
          _this.openid = res.data.result.openid
          wx.setStorageSync(STORAGE_TYPE.openid, res.data.result.openid)
          if (res.data.result.openid) {
            return post('/service/business/college/iccWechat/iccWechat/checkIsBindWechat.xf', {
              openId: res.data.result.openid
            })
          } else {
            return Promise.reject(new Error('未获取到openid'))
          }
        }).then(res => {
          wx.hideLoading()
          if (res.data.error.result === 1) {
            _this.saveStorage(res.data.result)
            wx.switchTab({
              url: '../monitor/monitor'
            })
            _this.getProjectList()
          } else {
            _this.setData({
              showForm: true
            })
          }
        }).catch(() => {
          wx.hideLoading()
        })
      },
      fail() {
        wx.showToast({
          title: '获取用户基本信息失败',
          icon: 'none'
        })
        wx.hideLoading()
      }
    })
  },
  saveStorage(result) {
    wx.setStorageSync(STORAGE_TYPE.account, result.userAccount)
    wx.setStorageSync(STORAGE_TYPE.name, result.userName)
    wx.setStorageSync(STORAGE_TYPE.uid, result.userId)
  },
  getProjectList() {
    let st = wx.getStorageSync(STORAGE_TYPE.project)
    if (st) {
      event.$emit(EVENT_TYPES.currentProject, st)
    }/* else {
      post('/service/business/college/iccProject/iccProject/getProjectList.xf', {
        rowsNum: 9999,
        currentPage: 1,
        implementId: wx.getStorageSync(STORAGE_TYPE.uid)
      }).then(res => {
        if (res.data.result) {
          event.$emit(EVENT_TYPES.currentProject, res.data.result[0])
        }
      })
    }*/
  },
  initIndex() {
    this.getUserInfo()
    this.getWeixinUserInfo()
    event.$emit(EVENT_TYPES.getDictionary)
  },
  onPullDownRefresh() {
    this.initIndex()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  onLoad: function () {},
  onShow() {
    this.initIndex()
  }
})
