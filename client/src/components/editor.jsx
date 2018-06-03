import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import AppState from '../store/app-state'
import './editor.css'

@inject('appState') @observer
class Editor extends Component {
  componentDidMount() {
    const node = ReactDOM.findDOMNode(this.refs.editorRef) //eslint-disable-line
    this.props.appState.editor = window.ace.edit(node)
    const editor = this.props.appState.editor //eslint-disable-line
    this.props.appState.editor.setTheme('ace/theme/monokai')
    editor.setShowPrintMargin(false)
    editor.setFontSize(this.props.appState.editorFontSize)
    editor.getSession().setMode('ace/mode/java')
  }

  render() {
    const style = {
      fontSize: '14px !important',
      border: 'none',
      width: '100%',
      height: '100%',
    };
    return ( <div ref="editorRef" className="ace-editor-div" style={style} /> ) //eslint-disable-line
  }
}

export default Editor;

Editor.propTypes = {
  appState: PropTypes.instanceOf(AppState),
}
