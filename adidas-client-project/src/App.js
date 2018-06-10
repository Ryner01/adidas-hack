import React, { Component } from 'react'
import { Sidebar } from './containers/Sidebar'
import { UserBar } from './containers/UserBar'
import { Chat } from './containers/Chat'
import './App.css'
import {connect} from 'react-redux';

class AppComponent extends Component {
  render() {

    return (
      <div className="app">
        <div className="layout">
          <div className="layout__left-bar">
            <Sidebar  />
          </div>
          <div className="layout__main">
            { !Array.isArray(this.props.selectedUser)
              ? <Chat />
              : null
            }
          </div>
          <div className="layout__right-bar">
            { !Array.isArray(this.props.selectedUser)
              ? <UserBar />
              : null
            }
          </div>
        </div>
      </div>
    )
  }
}

export const App = connect(state => ({
  selectedUser: state.selectedUser
}), {})(AppComponent)
