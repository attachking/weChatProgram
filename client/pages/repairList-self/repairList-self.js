import {post, STORAGE_TYPE, dateFormat, uploadFile} from '../../utils/util'

let searchData = {
  rowsNum: 20,
  currentPage: 1,
  userId: '',
  deviceCode: '' // 设备编码
}
let pageBean = {}
const app = getApp()

Page({
  data: {
    list: [],
    loading: false
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
    post('/service/business/college/iccDevice/iccRepairRecord/getRepairRecordList.xf', searchData).then(res => {
      wx.hideLoading()
      this.setData({
        loading: false
      })
      pageBean = res.data.pageBean
      res.data.result.forEach(item => {
        item.repairRecordCreatetime = typeof item.repairRecordCreatetime === 'string' ? item.repairRecordCreatetime.replace(/-/g, '/') : item.repairRecordCreatetime
        item.year = dateFormat.call(new Date(item.repairRecordCreatetime), 'yyyy')
        item.month = dateFormat.call(new Date(item.repairRecordCreatetime), 'MM-dd')
        item.result = item.repairProcesseResults === 1 ? '已处理' : '待处理'
        item.resultCode = item.repairProcesseResults === 1
        item.isUpload = !!item.isHasFile
        item.isUploadStr = item.isHasFile ? '已上传' : '未上传'
        item.editable = item.repairRecordModifier ? 'no' : 'yes'
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
  handleTap(e) {
    let _this = this
    let data = e.currentTarget.dataset
    let itemList
    if (data.uid === wx.getStorageSync(STORAGE_TYPE.uid) && data.editable === 'yes') {
      itemList = ['查看内容', '编辑维修记录']
    } else {
      itemList = ['查看内容']
    }
    if (!data.upload && data.uid === wx.getStorageSync(STORAGE_TYPE.uid)) {
      itemList.push('上传派工单')
    }
    wx.showActionSheet({
      itemList: itemList,
      success(index) {
        if (index.tapIndex === 0) {
          wx.navigateTo({
            url: `../repairDetail/repairDetail?id=${data.recordid}`
          })
        } else if (itemList[index.tapIndex] === '编辑维修记录') {
          wx.navigateTo({
            url: `../repairForm/repairForm?id=${data.recordid}&deviceid=${data.devicecode}`
          })
        } else {
          wx.chooseImage({
            count: 1,
            success(e) {
              wx.showLoading({
                title: '提交中',
                mask: true
              })
              uploadFile({
                url: '/service/business/college/iccKnowledge/iccDeviceFile/uploadAttachment.xf',
                filePath: e.tempFiles[0].path,
                name: 'img',
                formData: {
                  fileSize: 10000
                }
              }).then(res => {
                if (res.data.error.result === 1) {
                  return post('/service/business/college/iccDevice/iccRepairRecord/saveRepairRecordInfo.xf', {
                    workOrderFileUrl: res.data.result,
                    workOrderFileName: 'img',
                    repairRecordId: data.recordid,
                    deviceId: data.devicecode,
                    repairProcesseId: wx.getStorageSync(STORAGE_TYPE.uid),
                    userId: wx.getStorageSync(STORAGE_TYPE.uid)
                  })
                } else {
                  wx.showToast({
                    title: res.data.error.message,
                    icon: 'none'
                  })
                  return Promise.reject(new Error(res.data.error.message))
                }
              }).then(res => {
                wx.hideLoading()
                if (res.data.error.result === 1) {
                  wx.showToast({
                    title: res.data.error.message,
                    icon: 'success'
                  })
                  searchData.currentPage = 1
                  _this.getList()
                } else {
                  wx.showToast({
                    title: res.data.error.message,
                    icon: 'none'
                  })
                }
              }).catch(err => {
                wx.hideLoading()
                wx.showToast({
                  title: err.message,
                  icon: 'none'
                })
              })
            }
          })
        }
      }
    })
  },
  onPullDownRefresh() {
    searchData.currentPage = 1
    if (searchData.projectId) {
      searchData.projectId = app.globalData.currentProject.projectId
    }
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
    if (options.deviceCode) {
      searchData.deviceCode = options.deviceCode
      wx.setNavigationBarTitle({
        title: '维修记录'
      })
    } else {
      searchData.projectId = app.globalData.currentProject.projectId
      searchData.userId = wx.getStorageSync(STORAGE_TYPE.uid)
      wx.setNavigationBarTitle({
        title: '我的维修记录'
      })
    }
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {

  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    searchData.currentPage = 1
    this.getList()
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