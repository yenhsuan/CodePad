import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Avatar from '@material-ui/core/Avatar'
import blueGrey from '@material-ui/core/colors/cyan'
import classnames from 'classnames'

import logo from '../../brand.png'
import { AppState } from '../store/app-state'
import './navbar.css'

const styles = () => ({
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  avatar: {
    margin: 10,
  },
  info: {
    color: '#888',
    'font-size': '10px',
  },
  loginBtn: {
    color: 'white',
    backgroundColor: blueGrey[500],
    '&:hover': {
      backgroundColor: blueGrey[700],
    },
  },
})

@inject('appState') @observer
class NavBar extends Component {
  componentDidMount = () => {

  }

  usersIcon = () => {
    const { classes } = this.props
    if (this.props.appState.usersIcon === '') {
      return <div />
    }

    const users = JSON.parse(this.props.appState.usersIcon)
    const res = users.map(user => (
      <Tooltip title={user.name}>
        <Avatar key={user.name} alt={user.nick} src={user.pic} className={classes.avatar} />
      </Tooltip>
    ))
    return res
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <Avatar alt="logo" src={logo} className={classes.avatar} />
            <Typography variant="title" color="inherit" className={classnames(classes.flex, 'brand')}>
              CodePad
            </Typography>
            {this.usersIcon()}
            {/* <Button component={Link} to="/codepad">codepad</Button>
            <Button component={Link} to="/about" color="inherit">about</Button> */}
            {
              !this.props.appState.isLogin && (
                <Button
                  onClick={() => this.props.appState.auth.login()}
                  className={classes.loginBtn}
                >
                  Login
                </Button>
              )
            }
            {
              this.props.appState.isLogin && (
                <Button
                  onClick={() => {
                    this.props.appState.auth.logout()
                    this.props.appState.isLogin = false
                  }}
                  color="inherit"
                >
                  Logout
                </Button>
              )
            }
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

export default withStyles(styles)(NavBar)

NavBar.propTypes = {
  appState: PropTypes.instanceOf(AppState),
  classes: PropTypes.object.isRequired,
}
