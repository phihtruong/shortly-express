const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // see if there is a cookie
  let sessionObj = {};
  let cookies = req.cookies;
  // if no then create new session(hash) models.Sessions.create()
  Promise.resolve(cookies)
    .then((result) => {
      console.log('result', result);
    });
  if (!cookies) {
    return models.Sessions.create()
      .then(hash => {
        console.log('hash', hash);
        sessionObj['shortlyid'] = hash;
      })
      .then(() => {
        console.log('in req.session then');
        req.session = sessionObj;
      });
    //req.session = sessionObj;
    console.log('the end');
    next();
    // then  assign cookie(hash) and assign it to the session
  }
  return sessionObj;
};
/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

