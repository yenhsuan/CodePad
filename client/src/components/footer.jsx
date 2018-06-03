import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './footer.css'

const styles = {
  footer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#222',
    opacity: 0.8,
    color: '#f2f2f2',
    'font-size': '12px',
    'z-index': 10,
    'font-family': '"Roboto", "Helvetica", "Arial", sans-serif',
    'padding-left': '15px',
    'padding-right': '15px',
    'padding-top': '5px',
    'padding-bottom': '5px',
    'border-radius': '5px 5px 0 0',
  },
}

class Footer extends Component {
  componentDidMount() {

  }

  render = () => {
    const { classes } = this.props
    return (
      <div className={classnames(classes.footer, 'footer-mobile')}>
        By Yen-Hsuan Chen (Terry) @ 2018
      </div>
    )
  }
}

export default withStyles(styles)(Footer)

Footer.propTypes = {
  classes: PropTypes.object.isRequired,
}
