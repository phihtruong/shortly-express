const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');
const Cookie = require('./middleware/cookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(Cookie);
app.use(Auth.createSession);

app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

// login
app.post('/login', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  return models.Users.get({ username })
    .then((user) => {
      if (!user || !models.Users.compare(password, user.password, user.salt)) {
        //console.log('error username or password does not match');
        throw new Error;
      }
      return Auth.createSession(req, res, next);
    })
    .then(() => {
      res.redirect('/');
    })
    .error(error => {
      res.sendStatus(500);
    })
    .catch(user => {
      res.redirect('/login');
    });
});

//signup
app.post('/signup', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  // console.log('bob: ', username);
  // console.log('get from Users table...: ', models.Users.get({ username }));
  return models.Users.get({ username })
    .then(user => {
      if (!user) {
        return models.Users.create({ username, password });
      } else {
        throw user;
      }
    })
    .then(() => {
      return Auth.createSession(req, res, () => res.set('set-cookie', res.cookies.shortlyid.value));
      // res.send(res.cookies.shortlyid.value);
      // res.cookie('shortlyid', res.cookies.shortlyid.value, { domain: 'localhost' });
      // });

    })
    .then(() => {
      // console.log('res');
      res.redirect('/');
    })
    .error(err => {
      res.sendStatus(500);
    })
    .catch(user => {
      res.redirect('/signup');

    });
});








/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
