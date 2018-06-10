import React, { Component } from 'react'

class UserLink extends Component {
  render() {
    return (
      <a
        className={`user-link ${this.props.id == this.props.selectedUser ? 'active' : '' }`}
        data-id={this.props.id}
        onClick={(e) => {
          this.props.dispatch(e.currentTarget.dataset.id, this.props.users)
        }}
      >
        <span
          className={`user-status ${this.props.status === 'requires_attention' ? 'user-status--attention' : '' } ${this.props.status === 'active' ? 'user-status--active' : '' }`}>
        </span>
        <span className="user-name">{this.props.name}</span>
      </a>
    )
  }
}

export default UserLink
