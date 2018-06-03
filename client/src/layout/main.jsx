import React, { Component } from 'react'
import { withRouter, Route, Switch } from 'react-router'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import io from 'socket.io-client'
import hash from 'object-hash'
import randStr from 'randomstring'

import About from '../views/about'
import CodePad from '../views/codepad'
import Login from '../views/login'

import { AppState } from '../store/app-state'

@inject('appState') @withRouter @observer
export default class Main extends Component {
  componentDidMount() {
    if (!this.props.appState.isLogin && this.props.appState.auth.isAuthenticated()) {
      console.log('authed')
      this.props.appState.auth.getProfile((profile) => {
        this.loginCallback(profile)
      })
    }
  }

  socketConnect(profile) {
    const ssid = hash(randStr.generate(3) + profile.name).substr(0, 8)
    this.props.appState.ssid = ssid
    const picUri = encodeURIComponent(profile.picture)
    this.socket = io('/', {
      query: `name=${profile.name}&nick=${profile.nickname}&pic=${picUri}&ssid=${ssid}`,
      forceNew: true,
    })
    this.props.appState.socket = this.socket
    this.registerSocketService()
  }

  registerSocketService() {
    const { editor } = this.props.appState
    this.socket.on('usersInSession', (users) => {
      this.props.appState.usersIcon = users
    })

    this.socket.on('editorChange', (d) => {
      const delta = JSON.parse(d)
      console.log(delta)
      if (!delta) {
        return
      }
      editor.lastAppliedChange = delta
      editor.getSession().getDocument().applyDeltas([delta])
    })

    editor.on('change', (e) => {
      const delta = JSON.stringify(e)
      console.log(e)
      if (editor.lastAppliedChange !== e) {
        if (this.socket && this.socket.connected) {
          this.socket.emit('editorChange', delta)
        }
      }
    })

    this.socket.on('changeLang', (lang) => {
      this.props.appState.lang = lang
      this.props.appState.editor.getSession().setMode(`ace/mode/${this.props.appState.lang}`)
      this.props.appState.editor.clearSelection()
    })

    this.socket.on('compiled', (data) => {
      const res = JSON.parse(data)
      this.props.appState.terminalMsg.unshift(res)
    })

    this.socket.on('checkCode', () => {
      this.props.appState.isValidCode = true
    })
    this.socket.emit('getContent')
  }

  loginCallback(profile) {
    this.props.appState.isLogin = true
    this.props.appState.profile = profile
    console.log(profile)
    this.props.history.push('/codepad')
    this.socketConnect(profile)
  }

  login() {
    this.props.appState.auth.handleAuthentication((profile) => {
      this.loginCallback(profile)
    })
  }

  render() {
    return (
      <Switch>
        <Route exact path="/" component={CodePad} />
        <Route path="/codepad" component={CodePad} />
        <Route path="/about" component={About} />
        <Route
          path="/login"
          render={() => {
            this.login()
            return <Login />
          }}
        />
        <Route component={CodePad} />
      </Switch>
    )
  }
}

Main.propTypes = {
  appState: PropTypes.instanceOf(AppState),
  history: PropTypes.object,
}

