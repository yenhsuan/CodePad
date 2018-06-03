import auth0 from 'auth0-js'
import history from './history'
import confing from './auth.config'

export default class Auth {
  auth0 = new auth0.WebAuth(confing)

  userProfile = null

  constructor() {
    this.getProfile = this.getProfile.bind(this);
  }

  getProfile(cb) {
    const accessToken = this.getAccessToken();
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (err) {
        return
      }
      if (profile) {
        this.userProfile = profile;
      }
      cb(profile);
    });
  }

  login() {
    this.auth0.authorize()
  }

  getAccessToken = () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No Access Token found');
    }
    return accessToken;
  }

  handleAuthentication(cb) {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        this.getProfile(cb)
      } else if (err) {
        history.push('/codepad')
        console.log(err)
      }
    })
  }

  setSession = (authResult) => {
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
  }

  logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    history.push('/codepad')
    window.location.reload(false);
  }

  isAuthenticated = () => {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }
}
