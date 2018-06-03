import { observable, computed } from 'mobx'
import Auth from '../service/auth'

export default class AppState {
  @observable auth
  @observable editor
  @observable terminalMsg
  @observable isLogin = false
  @observable lang = 'java'
  @observable usersIcon = ''
  @observable socket = null

  @observable modalOpen = false
  @observable flagInvJoin = true
  @observable isValidCode = false
  @observable ssidJoined = ''
  @observable ssid = ''

  @observable isBuilding = false
  @observable isBeakline = false

  constructor() {
    this.auth = new Auth()
    this.editor = null
    this.userProfile = null
    this.terminalMsg = []
    this.isLogin = false
    this.profile = null
  }

  @computed get msg() {
    return `${this.name} say count is ${this.count}`
  }
}

