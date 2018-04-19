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
    handleCatch() {
    },
    handleProject(project) {
      this.setData({
        currentVal: this.data.selections.findIndex(item => item.projectId === project.projectId)
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
    this.setData({
      currentVal: this.data.selections.findIndex(item => item.id === app.globalData.currentProject.id)
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
