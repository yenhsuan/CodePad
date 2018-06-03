import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import { Provider } from 'mobx-react'
import { hot } from 'react-hot-loader' // eslint-disable-line
import indigo from '@material-ui/core/colors/indigo'
import pink from '@material-ui/core/colors/pink'
import red from '@material-ui/core/colors/red'
import yellow from '@material-ui/core/colors/yellow'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import App from './views/App'
import AppState from './store/app-state'
import '../favicon.ico'

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: pink,
    accent: yellow,
    error: red,
    type: 'dark',
  },
});

ReactDOM.render(
  <BrowserRouter>
    <Provider appState={new AppState()}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Route component={App} />
      </MuiThemeProvider>
    </Provider>
  </BrowserRouter>,
  document.getElementById('app'),
)

module.hot.accept() // eslint-disable-line
