import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress';
import className from 'classnames'

import AppState from '../store/app-state'
import './terminal.css'

const styles = {
  panel: {
    width: '100%',
    height: '100%',
    color: 'white',
    padding: '20px',
    overflow: 'auto',
  },
  title: {
    color: '#ffbb00',
    background: '#222',
    padding: '2px 6px 2px 6px',
    'border-radius': '10px',
    display: 'inline',
    'font-weight': 700,
  },
  hr: {
    'box-shadow': 'none',
    background: '#555',
    border: '0',
    height: '1px',
  },
  user: {
    display: 'inline',
    'margin-left': '5px',
    color: '#ffff80',
  },
  loading: {
    position: 'absolute',
    top: '20px',
    right: '20px',
  },
}

@inject('appState') @observer
class Terminal extends Component {
  componentDidMount() {

  }

  results() {
    const { classes } = this.props
    if (!this.props.appState.terminalMsg) {
      return (<div />)
    }
    return (
      this.props.appState.terminalMsg.map(n => (
        <div key={`${n.ts}1`}>
          <Typography className={classes.title} variant="body2" gutterBottom>
            Compiled result
          </Typography>
          {n.user && (<Typography className={classes.user}> by {n.user}</Typography>)}
          <pre>{n.build}</pre>
          <Typography className={classes.title} variant="body2" gutterBottom>
            Stdout
          </Typography>
          <pre>{n.run}</pre>
          <hr className={classes.hr} />
        </div>
      ))
    )
  }

  render() {
    const { classes } = this.props

    return (
      <div className={className(classes.panel, 'terminal')}>
        <div className={classes.loading}>
          {
            this.props.appState.isBuilding &&
            <CircularProgress className={classes.progress} color="secondary" />
          }
        </div>
        {this.results()}
      </div>
    )
  }
}

export default withStyles(styles)(Terminal)

Terminal.propTypes = {
  appState: PropTypes.instanceOf(AppState),
  classes: PropTypes.object.isRequired,
}
