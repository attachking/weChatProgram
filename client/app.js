import event, {EVENT_TYPES} from './utils/event'
import {STORAGE_TYPE, post} from './utils/util'

App({
  onLaunch: function () {
    event.$on(EVENT_TYPES.currentProject, (project) => {
      this.globalData.currentProject = project
      wx.setStorageSync(STORAGE_TYPE.project, project)
    })
    event.$on(EVENT_TYPES.getDictionary, () => {
      this.getDeviceType()
    })
  },
  getDeviceType() {
    post('/service/sys/iccParameter/iccParameter/getConditionList.xf', {
      tabStr: '5,6'
    }).then(res => {
      this.globalData.deviceType = res.data.result[6].map(item => {
        return {
          name: item.parameterOption,
          code: item.parameterId,
          codeCode: item.parameterCode
        }
      })
      this.globalData.issues = res.data.result[5].map(item => {
        return {
          name: item.parameterOption,
          code: item.parameterId,
          codeCode: item.parameterCode
        }
      })
    })
  },
  globalData: {
    userInfo: null,
    currentProject: {},
    deviceType: [],
    issues: []
  }
})