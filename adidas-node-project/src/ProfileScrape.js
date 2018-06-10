var _ = require('lodash');
let rp = require('request-promise-native');
var Client = require('instagram-private-api').V1;
var device = new Client.Device('someuser');
var storage = new Client.CookieFileStorage(__dirname + '/../someuser.json');

var session = null;

var log = function(m) {console.log(m);}


function isSinglePhoto(photo) {
  return true;
  return photo._params.mediaType === 1;
}

async function processImage(url, meta) {
  let data = [];
  try {
    data = await rp({
      uri: 'http://188.166.163.134:5000/process_image',
      method: 'POST',
      timeout: 30000,
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        'image_url': url,
        'save': false,
        'meta': meta
      })
    });
  } catch(e) {
    log(`error when fetching Targeting Vision API: ${e.message}`);
    return [];
  }
  return JSON.parse(data);
}

async function analyzeProfile(instagramUserId) {
  if (session == null) {
    session = await Client.Session.create(device, storage, '9stories.red', 'pwpwpw');
  }
  let profile = await Client.Account.getById(session, instagramUserId);
  var feed = new Client.Feed.UserMedia(session, profile._params.id, 12);

  media = [];
  for (var i = 1; i <= 12; i++) {
    try {
      p = await feed.get();
      console.log(p);
      
      let url = p._params.images.sort((a, b) => {
        return a.width * a.height < b.width * b.height;
      })[0].url;
      media.push({
        'url': url,
        'caption': p._params.caption,
        'likes': p._params.likes
      });
    } catch (e) {}
  }
  console.log(media);
  let image_tasks = [];
  for (let image of images) {
    let meta = {
      'profile_username': profile._params.username,
      'profile_full_name': profile._params.full_name,
      'profile_bio': profile._params.biography,
      'image_caption': image.caption,
      'image_likes': image.likeCount,
    }
    let url = image.url.split('?')[0];
    console.log(url);
    image_tasks.push(processImage(url, meta));
  }
  let image_tasks_results = await Promise.all(image_tasks);

  let ageSum = 0;
  let genderSum = 0;
  let personsAnalyzed = 0;
  let photosWithoutPersons = 0;
  for (let result of image_tasks_results) {
    if (result.length == 0) {
      photosWithoutPersons += 1;
      continue;
    }
    for (let person of result) {
      personsAnalyzed += 1;
      ageSum += person.age;
      let log_str = `Targeting Vision API found a person (${person.gender}${person.age})`;
      if (person.gender == 'F') {
        log(log_str, 'magenta');
        genderSum -= 1; // (.)(.)
      } else {
        log(log_str, 'blue');
        genderSum += 1; // 8====>
      }
    }
  }

  let profileType = 'unknown';
  if (photosWithoutPersons / images.length < businessProfileThreshold || personsAnalyzed == 0) {
    profileType = 'business';
  } else {
    profileType = 'person';
  }

  if (genderSum < 0) {
    resultGender = 'female'; 
  } else if (genderSum > 0) {
    resultGender = 'male';
  } else {
    resultGender = 'unknown';
  }

  resultAge = Math.round(ageSum / personsAnalyzed);

  return {
    'gender': resultGender,
    'age': resultAge,
    'username': profile._params.username,
    'full_name': profile._params.full_name,
    'bio': profile._params.biography
  }
}

module.exports = {
  analyzeProfile: analyzeProfile,
};

module.exports.analyzeProfile = function() {
  return {
    'gender': 'man',
    'age': 24,
    'username': 'johancutych1',
    'full_name': 'Johan Cutych',
    'profile_pic': 'https://scontent-ams3-1.cdninstagram.com/vp/66d77a7f29dcbb3ad7f13dbae5f5aa5c/5B9F2CF4/t51.2885-19/s320x320/34401462_1813519158686771_7740952860480765952_n.jpg'
  }
}

console.log(module.exports.analyzeProfile());
