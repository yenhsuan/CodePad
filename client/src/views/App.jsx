import React, { Component } from 'react'
import { hot } from 'react-hot-loader' // eslint-disable-line
// import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
// import { AppState } from '../store/app-state'
import { withRouter } from 'react-router-dom';

import Main from '../layout/main'
import NavBar from '../components/navbar'
import Footer from '../components/footer'

@inject('appState') @withRouter @observer
class App extends Component {
  componentDidMount() {

  }

  render = () => [
    <NavBar key="navbar" />,
    <Main key="route" />,
    <Footer key="footer" />,
  ]
}

export default hot(module)(App)

// App.propTypes = {
//   appState: PropTypes.instanceOf(AppState),
// }
