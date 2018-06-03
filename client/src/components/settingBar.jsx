import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import { withStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import green from '@material-ui/core/colors/green'
import axios from 'axios'
import PersonAdd from '@material-ui/icons/PersonAdd'
import SwapHoriz from '@material-ui/icons/SwapHoriz'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import TextField from '@material-ui/core/TextField'
import classnames from 'classnames'
import AppState from '../store/app-state'
import './settingBar.css'

const defaultContent = {
  java: `public class Mycode {
\tpublic static void main(String[] args) { 
\t\t// Type your Java code here 
\t} 
}`,
  c_cpp: `#include <iostream> 
using namespace std; 
int main() { 
\t// Type your C++ code here 
\treturn 0; 
}`,
  python: `class Solution: 
   def mycode(): 
       # Write your Python code here`,
}

const styles = theme => ({
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
  },
  root: {
    margin: '0px 15px 0px 15px',
    display: 'inline-block',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    'margin-right': '15px',
    minWidth: '200px',
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  buttons: {
    position: 'fixed',
    right: '5px',
    bottom: '20px',
  },
  formBtn: {
    'margin-right': '5px',
    'margin-bottom': '3px',
  },
  invBtn: {
    'margin-right': '15px',
    'margin-bottom': '3px',
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  diag: {
    'min-width': '30vw',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  wrapper: {

  },
  buttonProgress: {
    color: green[900],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
})


@inject('appState') @observer
class SettingBar extends Component {
  componentDidMount = () => {
    this.props.appState.editor.setValue(defaultContent.java)
    this.props.appState.editor.clearSelection()
  }
  handleDiagOpen = () => {
    this.props.appState.modalOpen = true
  }

  handleDiagClose = () => {
    this.props.appState.modalOpen = false
    this.props.appState.isValidCode = false
  }

  checkCode(event) {
    this.props.appState.ssidJoined = event.target.value
    this.props.appState.isValidCode = false
    if (this.props.appState.ssidJoined && this.props.appState.socket) {
      this.props.appState.socket.emit('checkCode', this.props.appState.ssidJoined)
    }
  }

  joinSession(newSsid) {
    if (this.props.appState.socket) {
      const { profile } = this.props.appState
      this.props.appState.socket.close()
      this.props.appState.editor.setValue(defaultContent.java)
      this.props.appState.editor.getSession().setMode('ace/mode/java')
      this.props.appState.socket.io.opts.query = {
        name: profile.name,
        nick: profile.nick,
        pic: profile.picture,
        ssid: newSsid,
      }
      console.log(this.props.appState.socket.io.opts.query)
      this.props.appState.socket.connect('/')
      this.props.appState.ssid = newSsid
      this.props.appState.socket.emit('getContent')
    }
  }

  handleLangChange(event) {
    this.props.appState.lang = event.target.value
    this.props.appState.editor.setValue(defaultContent[event.target.value])
    this.props.appState.editor.getSession().setMode(`ace/mode/${this.props.appState.lang}`)
    this.props.appState.editor.clearSelection()
    if (this.props.appState.socket !== null) {
      this.props.appState.socket.emit('changeLang', this.props.appState.lang)
    }
  }

  buildCode() {
    const code = this.props.appState.editor.getValue()
    this.props.appState.isBuilding = true
    axios.post('/api/v1/build', {
      userCode: code,
      lang: this.props.appState.lang,
    })
      .then((res) => {
        this.props.appState.isBuilding = false
        if (res.status !== 200) {
          this.props.appState.terminalMsg.unshift('Server is temporily unavaliable')
          return
        }

        if (this.props.appState.socket) {
          this.props.appState.socket.emit('compiled', JSON.stringify(res.data))
        }
        res.data.ts = Date.now()
        this.props.appState.terminalMsg.unshift(res.data)
        console.log(res)
      })
      .catch((error) => {
        this.props.appState.isBuilding = false
        console.log(error)
      });
  }

  resetCode() {
    this.props.appState.editor.setValue(defaultContent[this.props.appState.lang])
    this.props.appState.editor.getSession().setMode(`ace/mode/${this.props.appState.lang}`)
    this.props.appState.editor.clearSelection()
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.container}>
        {
          this.props.appState.flagInvJoin &&
          <Dialog
            open={this.props.appState.modalOpen}
            onClose={() => { this.handleDiagClose() }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            classes={{ paper: classes.diag }}
          >
            <DialogTitle width="25%" id="alert-dialog-title">Invite Code</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.props.appState.ssid}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { this.handleDiagClose() }} color="primary" variant="raised">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        }
        {
          !this.props.appState.flagInvJoin &&
          <Dialog
            open={this.props.appState.modalOpen}
            onClose={() => { this.handleDiagClose() }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            classes={{ paper: classes.diag }}
          >
            <DialogTitle id="alert-dialog-title">Enter Invite Code</DialogTitle>
            <DialogContent>
              <TextField
                id="code"
                label="Code"
                className={classes.textField}
                margin="normal"
                onChange={(event) => { this.checkCode(event) }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  this.joinSession(this.props.appState.ssidJoined)
                  this.handleDiagClose()
                }}
                color="secondary"
                variant="raised"
                disabled={!this.props.appState.isValidCode}
              >
                Join
              </Button>
              <Button
                onClick={() => { this.handleDiagClose() }}
                color="primary"
                variant="raised"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        }
        <form className={classes.root} autoComplete="off">
          <FormControl className={classes.formControl}>
            <Select
              value={this.props.appState.lang}
              onChange={(event) => { this.handleLangChange(event) }}
            >
              <MenuItem value="java">Java 8</MenuItem>
              <MenuItem value="python">Python 2.7</MenuItem>
              <MenuItem value="c_cpp">C++ 14</MenuItem>
            </Select>
          </FormControl>
          <Button
            className={classes.formBtn}
            variant="raised"
            style={{ backgroundColor: green[500], color: 'white' }}
            size="small"
            onClick={() => { this.buildCode() }}
            disabled={this.props.appState.isBuilding}
          >
            {
              this.props.appState.isBuilding &&
              <CircularProgress size={24} className={classes.buttonProgress} />
            }
            {
              !this.props.appState.isBuilding &&
              'Run'
            }
          </Button>
          <Button
            className={classes.formBtn}
            variant="raised"
            size="small"
            component={Link}
            to="/codepad"
            onClick={() => { this.resetCode() }}
          >
              Reset
          </Button>
        </form>
        <div className={classnames(classes.buttons, 'co-btn')}>
          <Tooltip id="tooltip-fab-inv" title="Invite">
            <Button
              className={classes.invBtn}
              disabled={!this.props.appState.isLogin}
              variant="fab"
              color="secondary"
              onClick={() => {
                this.props.appState.flagInvJoin = true
                this.handleDiagOpen()
              }}
            >
              <PersonAdd />
            </Button>
          </Tooltip>
          <Tooltip id="tooltip-fab-join" title="Join">
            <Button
              disabled={!this.props.appState.isLogin}
              className={classes.invBtn}
              variant="fab"
              color="primary"
              onClick={() => {
                this.props.appState.flagInvJoin = false
                this.handleDiagOpen()
              }}
            >
              <SwapHoriz />
            </Button>
          </Tooltip>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(SettingBar)

SettingBar.propTypes = {
  appState: PropTypes.instanceOf(AppState),
  classes: PropTypes.object.isRequired,
}
