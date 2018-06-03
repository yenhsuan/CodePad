import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid';

import Terminal from '../components/terminal'
import Editor from '../components/editor'
import SettingBar from '../components/settingBar'

const styles = {
  root: {
    flexGrow: 1,
    width: '100%',
    position: 'absolute',
    top: '64px',
    bottom: '50px',
    height: 'auto',
  },
}

class CodePad extends Component {
  componentDidMount() {

  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Grid container className={classes.root} spacing={0}>
          <Grid item sm={7} xs={12}>
            <Editor />
          </Grid>
          <Grid item sm={5} xs={12}>
            <Terminal />
          </Grid>
        </Grid>
        <SettingBar />
      </div>
    )
  }
}

export default withStyles(styles)(CodePad)

CodePad.propTypes = {
  classes: PropTypes.object.isRequired,
}
