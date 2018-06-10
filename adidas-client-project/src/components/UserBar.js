import React, {Component} from 'react'

const UserInfo = ({label, values}) => {
  return (
    <div className="user-info">
      <span className="user-info__label">{label}</span>
      <span className="user-info__values">
        {values.map((x, i) =>
          i ? ', '+x : x
        )}
      </span>
    </div>
  )
}


class UserBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      animate: false,
      defaultDimensions: 150
    };
  }

  componentDidMount() {
    this.onWillOpen();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.animate === false) {
      this.onWillOpen();
    }
    else if (this.state.animate === true && this.props.user && nextProps.user && nextProps.user.id !== this.props.user.id) {
      this.setState({ animate: false });
      this.onWillOpen();
    }
  }

  onWillOpen = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.setState({
          animate: true,
          defaultDimensions: this.state.defaultDimensions + 1
        });
      }, 200);
    });
  }

  render() {
    return (
      <div className={`user-bar ${ this.state.animate ? 'animate' : ''}`}>
        <div>
          <div className="sidebar__part">
            <h2 className="heading">You are chatting with</h2>
            <div className="user-card">
              <div className="user-card__photo">
                <div className="user-card__avatar">
                  <img src={this.props.user.profile_pic ? this.props.user.profile_pic : 'http://i.pravatar.cc/100'} alt=""/>
                </div>
              </div>
              <div className="user-card__infos">
                <div className="user-card__name"><strong>{this.props.user.full_name ? this.props.user.full_name : this.props.user.name}</strong></div>
                <div className="user-card__meta">
                  <div>Gender: {this.props.user.gender ? this.props.user.gender : 'Male'}</div>
                  <div>Age: {this.props.user.age ? this.props.user.age : '27'}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="sidebar__part">
            <h2 className="heading">Users most liked posts</h2>
            <div className="user-posts">
              {[...Array(6)].map((x, i) => {
                // simulate reload
                const dimensions = this.state.defaultDimensions + i
                return (
                  <div className="user-post" key={i}>
                    <div className="user-post__image">
                      <img src={`https://source.unsplash.com/random/${dimensions}x${dimensions}/`} alt=''/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="sidebar__part">
            <h2 className="heading">About user</h2>
            <UserInfo
              label='Activities'
              values={['Football', 'Footsal']}
            />
            <UserInfo
              label='Type'
              values={['Casual']}
            />
            <UserInfo
              label='Preferred color'
              values={['Red']}
            />

          </div>
          <div className="sidebar__part">
            <h2 className="heading">History picks</h2>

            <div className="user-pick">
              <div className="user-pick-before" />
              Wanted to know more about 2018 summer collection
            </div>
            <div className="user-pick">
              <div className="user-pick-before" />
              3 best fitting products showed
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default UserBar
