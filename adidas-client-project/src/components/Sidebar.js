import React from 'react'
import logo from '../logo.svg'
import PropTypes from 'prop-types'
import { UserLink } from '../containers/UserLink'

const Sidebar = ({users}) => {

  const usersAttention = users.filter(function(user){ return user.status === 'requires_attention' })
  const usersActive = users.filter(function(user){ return user.status === 'active' })
  const usersInactive = users.filter(function(user){ return user.status === 'inactive' })

  return (
    <div className="sidebar">
      <div className="sidebar__logo">
        <span className="logo-title"><strong>9chat</strong> of</span>
        <img src={logo} alt=""/>
      </div>
      <div>
        { !users.length
        ? <div className="heading empty">No users</div>
        : (
          <div>
            <div className="sidebar__part">
              {usersAttention.length
                ? <h2 className="heading">Needs your attention</h2>
                : null
              }
              {usersAttention.map(user => (
                <div key={user.id}>
                  <UserLink {...user} />
                </div>
              ))}
            </div>
            <div className="sidebar__part">
              {usersActive.length
                ? <h2 className="heading">Chatting</h2>
                : null
              }
              {usersActive.map(user => (
                  <div key={user.id}>
                    <UserLink {...user} />
                  </div>
                ))
              }
            </div>
            <div className="sidebar__part">
              {usersInactive.length
                ? <h2 className="heading">Left the chat</h2>
                : null
              }
              {usersInactive.map(user => (
                  <div key={user.id}>
                    <UserLink {...user} />
                  </div>
                ))
              }
            </div>
          </div>
        )
      }
      </div>
    </div>
  )
}

Sidebar.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired).isRequired
}

export default Sidebar
