import code from '../../utils/characters-letter'
import {post} from '../../utils/util'

// 以下参数最好为2的倍数
const TIT_HEIGHT = 60 // 每组标题的高度rpx
const ITEM_HEIGHT = 100  // 联系人view的高度rpx
const SHORTCUT_HEIGHT = 36 // 右侧快捷导航每项的高度rpx
const SHORTCUT_PADDING = 10 // 右侧快捷导航的padding  rpx
const app = getApp()

Page({
  data: {
    list: [],
    totalRpx: 0,
    currentTitle: '',
    currentPosition: 0,
    scrollInto: ''
  },
  // 通过页面滚动获取 物理像素/逻辑像素比
  translateRpx(d) {
    return d.scrollTop / d.scrollHeight * this.data.totalRpx
  },
  // 页面滚动捕获
  handleScroll(e) {
    let scrollTop = this.translateRpx(e.detail)
    this.calculateFixed(scrollTop)
  },
  // 处理固定的title效果
  calculateFixed(scrollTop) {
    let list = this.data.list
    let remark = true
    list.forEach((item, index) => {
      if (scrollTop >= item.height && scrollTop < list[index + 1].height) {
        this.setData({
          currentTitle: item.title
        })
      }
      if (scrollTop < item.height && scrollTop > item.height - TIT_HEIGHT) {
        this.setData({
          currentPosition: item.height - TIT_HEIGHT - scrollTop
        })
        remark = false
      }
    })
    if (remark) {
      this.setData({
        currentPosition: 0
      })
    }
  },
  // 通过快捷导航滚动计算 物理像素/逻辑像素比
  calculateShortCut(target) {
    const list = this.data.list
    const offsetTop = target.offsetTop
    if (target.dataset.current) {
      let index
      for (let i = 0; i < list.length; i++) {
        if (list[i].title === target.dataset.current) {
          index = i
        }
      }
      if (typeof index === 'number') {
        return (SHORTCUT_PADDING + SHORTCUT_HEIGHT * index) / offsetTop
      } else {
        return false
      }
    } else {
      return false
    }
  },
  // 处理通讯录排序
  handleList(list) {
    let map = {}
    let totalRpx = 0
    list.forEach(item => {
      let key = code(item.name.charAt(0)).toUpperCase()
      if (!map[key]) {
        map[key] = {
          title: key,
          items: []
        }
      }
      map[key].items.push({
        id: item.id,
        name: item.name
      })
      totalRpx += ITEM_HEIGHT
    })
    let ret = []
    for (let i in map) {
      ret.push(map[i])
      totalRpx += TIT_HEIGHT
    }
    ret.sort((a, b) => {
      return a.title.charCodeAt(0) - b.title.charCodeAt(0)
    })
    ret.forEach((item, index) => {
      if (index === 0) {
        item.height = 0
      } else {
        item.height = ret[index - 1].height + ret[index - 1].items.length * ITEM_HEIGHT + TIT_HEIGHT
      }
    })
    this.setData({
      list: ret,
      totalRpx: totalRpx
    }, () => {
      if (!this.data.currentTitle) {
        this.calculateFixed(1)
      }
    })
  },
  scrollIntoMethod(title) {
    this.setData({
      scrollInto: title
    })
  },
  handleTouchStart(e) {
    const list = this.data.list
    if (e.target.dataset && e.target.dataset.current) {
      this.touchY = e.touches[0].clientY
      this.targetStartTitleIndex = list.findIndex(item => item.title === e.target.dataset.current)
      this.scrollIntoMethod(e.target.dataset.current)
    }
  },
  handleTouchEnd(e) {
    this.touchY = 0
  },
  handleTouchMove(e) {
    const k = this.calculateShortCut(e.target)
    const clientY = e.touches[0].clientY
    const list = this.data.list
    if (this.touchY && k !== false) {
      const title = list[Math.round((clientY - this.touchY) * k / SHORTCUT_HEIGHT) + this.targetStartTitleIndex].title
      this.scrollIntoMethod(title)
    }
  },
  handleTap(e) {
    let list = this.defaultList
    let contact = list[list.findIndex(item => item.id === e.currentTarget.dataset.uid)]
    wx.navigateTo({
      url: `../contactDetail/contactDetail?name=${contact.name}&tel=${contact.tel}&department=${contact.org}&duty=${contact.duty}`
    })
  },
  getList() {
    post('/service/business/college/iccUser/iccAddressBooks/getAddressBooksList.xf', {
      rowsNum: 99999,
      currentPage: 1,
      customerId: app.globalData.currentProject.customerId
    }).then(res => {
      this.defaultList = res.data.result.map(item => {
        return {
          id: item.addressBooksId,
          name: item.addressBooksContacts,
          duty: item.addressBooksContactsDuty,
          org: item.addressBooksContactsOrg,
          tel: item.addressBooksContactsPhone
        }
      })
      this.handleList(this.defaultList)
    })
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {

  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    this.getList()
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