let Client = require('instagram-private-api').V1;

let RateLimiter = require('limiter').RateLimiter;
let unfollowLimiter = new RateLimiter(250, 'hour');
let followLimiter = new RateLimiter(250, 'hour');
let likeLimiter = new RateLimiter(450, 'hour');

async function followLimit() {
  return new Promise((res) => {
    followLimiter.removeTokens(1, () => {
      res();
    });
  });
}

async function unfollowLimit() {
  return new Promise((res) => {
    unfollowLimiter.removeTokens(1, () => {
      res();
    });
  });
}

async function likeLimit() {
  return new Promise((res) => {
    likeLimiter.removeTokens(1, () => {
      res();
    });
  });
}


function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

class FeedIterator {
  constructor(api, feed) {
    this.api = api;
    this.feed = feed;
  }

  async get() {
    await this.api.sleep();

    let result = this.feed.get();
    this.api.wait = Date.now() + 3000;
    return result;
  }

  hasMore() {
    return this.feed.isMoreAvailable();
  }
}

class Api {
  constructor(session) {
    this.session = session;
    this.wait = 0;
  }

  async sleep() {
    let timeout = this.wait - Date.now();
    if (timeout > 0) {
      await sleep(timeout);
    }
  }

  async follow(id) {
    await followLimit();
    await this.sleep();

    let result = Client.Relationship.create(this.session, id);
    this.wait = Date.now() + 2000;
    return result;
  }

  async like(id) {
    await likeLimit();
    await this.sleep();

    let result = Client.Like.create(this.session, id);
    this.wait = Date.now() + 3000;
    return result;
  }

  async unfollow(id) {
    await unfollowLimit();
    await this.sleep();

    let result = Client.Relationship.destroy(this.session, id);
    this.wait = Date.now() + 4000;
    return result;
  }

  async getProfile(id) {
    await this.sleep();

    let result = Client.Account.getById(this.session, id);
    this.wait = Date.now() + 3000;
    return result;
  }

  followers(id) {
    return new FeedIterator(this, new Client.Feed.AccountFollowers(this.session, id, 20));
  }

  userMedia(id) {
    return new FeedIterator(this, new Client.Feed.UserMedia(this.session, id, 12));
  }

  async searchForUser(name) {
    await this.sleep();

    let result = Client.Account.searchForUser(this.session, name);
    this.wait = Date.now() + 3000;
    return result;
  }

  async getSessionAccount() {
    await this.sleep();

    let result = this.session.getAccount();
    this.wait = Date.now() + 1000;
    return result;
  }
}

async function login(name, password, proxy) {
  let device = new Client.Device(name);
  let storage = new Client.CookieFileStorage(__dirname + '/../cookies/' + name + '.json');

  let session = await Client.Session.create(device, storage, name, password, proxy);

  return new Api(session);
}

module.exports = {
  apiLogin: login,
  Api: Api,
  NotFoundError: Client.Exceptions.NotFoundError
};
