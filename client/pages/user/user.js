import event, {EVENT_TYPES} from '../../utils/event'
import {post, STORAGE_TYPE} from '../../utils/util'

const app = getApp()

Page({
  data: {
    showSelect: false,
    currentProject: {},
    avatarUrl: '',
    username: ''
  },
  bindViewTap(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.path
    })
  },
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定注销？',
      success(e) {
        if (e.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          post('/service/business/college/iccWechat/iccWechat/relieveBindWechat.xf', {
            userId: wx.getStorageSync(STORAGE_TYPE.uid)
          }).then(res => {
            wx.hideLoading()
            if (res.data.error.result === 1) {
              wx.showToast({
                title: res.data.error.message,
                icon: 'success',
                complete() {
                  wx.reLaunch({
                    url: '../index/index'
                  })
                }
              })
            }
          }).catch(() => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  bindChangeProject() {
    this.setData({
      showSelect: true
    })
  },
  handleCloseMask() {
    this.setData({
      showSelect: false
    })
  },
  handleProject(project) {
    this.setData({
      currentProject: project
    })
  },
  onLoad: function () {
    this.setData({
      currentProject: app.globalData.currentProject,
      username: wx.getStorageSync(STORAGE_TYPE.name)
    })
    this.eventIndex = event.$on(EVENT_TYPES.currentProject, (project) => {
      this.handleProject(project)
    })
    if (app.globalData.userInfo) {
      this.setData({
        avatarUrl: app.globalData.userInfo.avatarUrl
      })
    }
  },
  onUnload() {
    event.$off(EVENT_TYPES.currentProject, this.eventIndex)
  },
  onShow() {
    wx.setStorage({
      key: STORAGE_TYPE.currentTab,
      data: '../user/user'
    })
  }
})
