import {post, uploadFile, STORAGE_TYPE} from '../../utils/util'

const app = getApp()
let form = {
  repairRecordId: '', // 维修记录id，修改时传
  deviceId: '', // 设备ID
  repairProblemDesc: '', // 问题描述
  repairRecordKeyword: '', // 关键字
  repairProcesseMethod: '', // 处理方法
  repairProcesseResults: '', // 处理结果 0待处理 1已处理
  repairCustomerContact: '', // 客户联系人id
  repairProcesseId: '', // 实施人员id
  repairProcessePlace: '', // 实施地址
  repairProcesseLat: '', // 维度
  repairProcesseLng: '' // 经度
}

Page({
  data: {
    contact: '',
    address: '',
    deviceType: '',
    desc: '',
    keywords: '',
    solution: '',
    contacts: [],
    contactName: '请选择客户联系人',
    result: '',
    resultName: '请选择处理结果',
    resultList: [{
      name: '待处理',
      code: 0
    }, {
      name: '已处理',
      code: 1
    }],
    latitude: '', // 纬度
    longitude: '', // 经度
    imgArr: [],
    imgArr2: [], // 派工单
    isHasFile: false
  },
  handleContact(e) {
    this.setData({
      contact: this.data.contacts[e.detail.value].code,
      contactName: this.data.contacts[e.detail.value].name
    })
    form.repairCustomerContact = this.data.contacts[e.detail.value].code
  },
  getGPS() {
    let _this = this
    wx.chooseLocation({
      success(e) {
        _this.setData({
          address: e.address,
          latitude: e.latitude,
          longitude: e.longitude
        })
        form.repairProcessePlace = e.address
        form.repairProcesseLat = e.latitude
        form.repairProcesseLng = e.longitude
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
  },
  handleDesc(e) {
    const value = e.detail.value
    /*this.setData({
      desc: value
    })*/
    form.repairProblemDesc = value
  },
  handleKeywords(e) {
    const value = e.detail.value
    if (value.length > 50) {
      return form.repairRecordKeyword
    }
    /*this.setData({
      keywords: value
    })*/
    form.repairRecordKeyword = value
  },
  handleSolution(e) {
    const value = e.detail.value
    /*this.setData({
      solution: value
    })*/
    form.repairProcesseMethod = value
  },
  handleResult(e) {
    this.setData({
      result: this.data.resultList[e.detail.value].code,
      resultName: this.data.resultList[e.detail.value].name
    })
    form.repairProcesseResults = this.data.resultList[e.detail.value].code
  },
  chooseImg() {
    let _this = this
    wx.chooseImage({
      count: 3,
      success(e) {
        _this.setData({
          imgArr: e.tempFiles.map(item => item.path)
        })
      }
    })
  },
  chooseImg2() {
    if (this.data.isHasFile) return
    let _this = this
    wx.chooseImage({
      count: 1,
      success(e) {
        _this.setData({
          imgArr2: e.tempFiles.map(item => item.path)
        })
      }
    })
  },
  onSubmit() {
    let _this = this
    if (!form.repairProblemDesc) {
      wx.showToast({
        title: '请输入问题描述',
        icon: 'none'
      })
      return
    }
    if (!form.repairRecordKeyword) {
      wx.showToast({
        title: '请输入关键字',
        icon: 'none'
      })
      return
    }
    if (!form.repairProcesseMethod) {
      wx.showToast({
        title: '请输入处理方法',
        icon: 'none'
      })
      return
    }
    if (form.repairProcesseResults === '') {
      wx.showToast({
        title: '请选择处理结果',
        icon: 'none'
      })
      return
    }
    if (!form.repairCustomerContact) {
      wx.showToast({
        title: '请选择客户联系人',
        icon: 'none'
      })
      return
    }
    if (!form.repairProcessePlace) {
      wx.showToast({
        title: '请选择实施地点',
        icon: 'none'
      })
      return
    }
    let uploadPromise = this.data.imgArr.map(item => {
      return uploadFile({
        url: '/service/business/college/iccKnowledge/iccDeviceFile/uploadAttachment.xf',
        filePath: item,
        name: 'img',
        formData: {
          fileSize: 10000
        }
      })
    })
    let uploadPromise2 = this.data.imgArr2.map(item => {
      return uploadFile({
        url: '/service/business/college/iccKnowledge/iccDeviceFile/uploadAttachment.xf',
        filePath: item,
        name: 'img',
        formData: {
          fileSize: 10000
        }
      })
    })
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    let imgArr = []
    let imgArrName = []
    let fileArr = []
    let fileArrName = []
    Promise.all(uploadPromise).then(res => {
      for (let i = 0; i < res.length; i++) {
        if (res[i].data.error.result !== 1) {
          return Promise.reject(new Error(res[i].data.error.message))
        } else {
          imgArr.push(res[i].data.result)
          imgArrName.push(`image-${i}`)
        }
      }
      return Promise.all(uploadPromise2)
    }).then(res => {
      for (let i = 0; i < res.length; i++) {
        if (res[i].data.error.result !== 1) {
          return Promise.reject(new Error(res[i].data.error.message))
        } else {
          fileArr.push(res[i].data.result)
          fileArrName.push(`image-${i}`)
        }
      }
      form.fileUrlStr = imgArr.length ? JSON.stringify(imgArr).replace(/\\+/g, '\\') : ''
      form.fileNameStr = imgArrName.length ? JSON.stringify(imgArrName) : ''
      form.workOrderFileUrl = fileArr.length ? fileArr[0] : ''
      form.workOrderFileName = fileArrName.length ? fileArrName[0] : ''
      return post('/service/business/college/iccDevice/iccRepairRecord/saveRepairRecordInfo.xf', form)
    }).then(res => {
      wx.hideLoading()
      if (res.data.error.result === 1) {
        wx.showToast({
          title: res.data.error.message,
          icon: 'success',
          success() {
            _this.onCancel()
          }
        })
      } else {
        wx.showToast({
          title: res.data.error.message,
          icon: 'none'
        })
      }
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  onCancel() {
    wx.navigateBack()
  },
  getContacts() {
    post('/service/business/college/iccUser/iccAddressBooks/getAddressBooksList.xf', {
      rowsNum: 99999,
      currentPage: 1,
      customerId: app.globalData.currentProject.customerId
    }).then(res => {
      let list = res.data.result.map(item => {
        return {
          code: item.addressBooksId,
          name: item.addressBooksContacts,
          duty: item.addressBooksContactsDuty,
          org: item.addressBooksContactsOrg,
          tel: item.addressBooksContactsPhone
        }
      })
      this.setData({
        contacts: list
      })
    })
  },
  getDetail(repairRecordId) {
    post('/service/business/college/iccDevice/iccRepairRecord/editRepairRecordInfo.xf', {repairRecordId}).then(res => {
      this.setData({
        isHasFile: !!res.data.result.iccRepairRecord.isHasFile,
        contactName: res.data.result.iccRepairRecord.addressBooksContacts,
        desc: res.data.result.iccRepairRecord.repairProblemDesc,
        solution: res.data.result.iccRepairRecord.repairProcesseMethod,
        resultName: !!res.data.result.iccRepairRecord.repairProcesseResults ? '已处理' : '待处理',
        address: res.data.result.iccRepairRecord.repairProcessePlace,
        keywords: res.data.result.iccRepairRecord.repairRecordKeyword
      })
      form.repairProblemDesc = res.data.result.iccRepairRecord.repairProblemDesc
      form.repairRecordKeyword = res.data.result.iccRepairRecord.repairRecordKeyword
      form.repairProcesseMethod = res.data.result.iccRepairRecord.repairProcesseMethod
      form.repairProcesseResults = res.data.result.iccRepairRecord.repairProcesseResults
      form.repairCustomerContact = res.data.result.iccRepairRecord.repairCustomerContact
      form.repairProcessePlace = res.data.result.iccRepairRecord.repairProcessePlace
      form.repairProcesseLat = res.data.result.iccRepairRecord.repairProcesseLat
      form.repairProcesseLng = res.data.result.iccRepairRecord.repairProcesseLng
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    if (options.id) {
      this.getDetail(options.id)
    }
    form.repairRecordId = options.id || ''
    form.deviceId = options.deviceid
    form.repairProcesseId = wx.getStorageSync(STORAGE_TYPE.uid)
    form.userId = wx.getStorageSync(STORAGE_TYPE.uid)
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {

  },
  // 生命周期函数--监听页面显示
  onShow() {
    this.getContacts()
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