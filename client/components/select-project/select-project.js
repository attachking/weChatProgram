import event, {EVENT_TYPES} from '../../utils/event'
import {post, STORAGE_TYPE} from '../../utils/util'

const app = getApp()

Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        if (newVal) {
          this.getProjectList()
        }
      }
    }
  },
  data: {
    selections: [],
    currentVal: 0
  },
  methods: {
    closeMask() {
      this.triggerEvent('closemask', false, {})
    },
    selectChange(e) {
      event.$emit(EVENT_TYPES.currentProject, this.data.selections[e.detail.value])
      this.closeMask()
    },
    handleCatch() {},
    handleProject(project) {
      let index = this.data.selections.findIndex(item => item.projectId === project.projectId)
      if (index === -1 && this.data.selections.length) {
        event.$emit(EVENT_TYPES.currentProject, this.data.selections[0])
        return
      }
      this.setData({
        currentVal: index
      })
    },
    getProjectList() {
      post('/service/business/college/iccProject/iccProject/getProjectList.xf', {
        rowsNum: 9999,
        currentPage: 1,
        implementId: wx.getStorageSync(STORAGE_TYPE.uid)
      }).then(res => {
        this.setData({
          selections: res.data.result
        }, () => {
          this.handleProject(app.globalData.currentProject)
        })
      })
    }
  },
  ready() {
    let index = this.data.selections.findIndex(item => item.id === app.globalData.currentProject.id)
    this.setData({
      currentVal: index === -1 ? 0 : index
    })
  },
  created() {
    this.eventIndex = event.$on(EVENT_TYPES.currentProject, (project) => {
      this.handleProject(project)
    })
  },
  detached() {
    event.$off(EVENT_TYPES.currentProject, this.eventIndex)
  }
})
