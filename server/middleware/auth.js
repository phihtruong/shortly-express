const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // see if there is a cookie
  let sessionObj = {};
  let cookies = req.cookies.shortlyid;

  Promise.resolve(cookies)
    .then((result) => {
      //console.log('result', result);
      return models.Sessions.get({ hash: result });
    })
    .then(sessionEntry => {
      // console.log('session', sessionEntry);
      if (!sessionEntry) {
        return models.Sessions.create()
          .then((sessionHash) => {
            // console.log('session hash: ', sessionHash);
            return models.Sessions.get({ id: sessionHash.insertId });
          })
          .then((sessionEntry) => {
            // console.log('session entry: ', sessionEntry);
            sessionObj['hash'] = sessionEntry.hash;
            req.session = sessionObj;

            // res.cookies['shortlyid'] = { 'value': sessionEntry.hash };
            res.cookies = { 'shortlyid': { 'value': sessionEntry.hash } };
            // console.log('res.cookies', res.cookies);
            //console.log('req', req.session);
            next();
          });
      } else {
        sessionObj['hash'] = sessionEntry.hash;
        req.session = sessionObj;

        res.cookies['shortlyid'] = { 'value': sessionEntry.hash };
        // res.set('set-cookie', sessionEntry.hash);
        // console.log('res.cookies', res.cookies);
        // console.log('id', sessionEntry.userId);
        if (sessionEntry.userId) {
          sessionObj['userId'] = sessionEntry.userId;
          sessionObj['user'] = { 'username': sessionEntry.user.username };

          // console.log('username', sessionEntry.user.username);
        }
        next();
      }
    });
  // look see  if the cookie is in the sessions table hash = cookie
  // .then(hash => {
  //   console.log('hash', hash);
  //   sessionObj['shortlyid'] = hash;
  // })
  //res.send(res.cookies);
};
/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

