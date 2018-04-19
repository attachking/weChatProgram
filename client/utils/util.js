export const BASE_URL = 'https://661973658.chenjiyuan.club' // https://661973658.chenjiyuan.club
export const STORAGE_TYPE = {
  account: '__account__',
  name: '__name__',
  uid: '__uid__',
  project: '__project__',
	currentTab: '__currentTab__'
}

// 时间格式化方法:dateFormat.call(Date, 'yyyy-MM-dd')
export function dateFormat(fmt) {
  let o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  }
  return fmt
}

export function post(url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      dataType: 'json',
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

export function uploadFile({url, filePath, name, formData}) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + url,
      filePath,
      name,
      formData,
      header: {
        'content-type': 'multipart/form-data'
      },
      success(res) {
        try {
          res.data = JSON.parse(res.data)
        } catch (err) {}
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

export function queryParse(str) {
  let index = str.indexOf('?')
  str = index === -1 ? str : str.substring(index + 1)
  let arr = str.split('&')
  let o = {}
  arr.forEach(item => {
    let i = item.indexOf('=')
    if (i !== -1) {
      o[item.substring(0, i)] = item.substring(i + 1)
    }
  })
  return o
}