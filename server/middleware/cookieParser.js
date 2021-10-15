const parseCookies = (req, res, next) => {
  // get cookie prop from req header
  // arr = split on semi-colon
  // check length of arr, if greater than 1
  // iterate over arr
  // for each cookie, split on =
  // assign first element to key in resultObj to the second element
  var cookieObj = {};
  var cookies = req.get('Cookie');
  if (!cookies) {
    req.cookies = cookieObj;
    next();
    return cookieObj;
  }
  var cookiesArr = cookies.split('; ');
  cookiesArr.forEach(cookie => {
    var splitCookie = cookie.split('=');
    cookieObj[splitCookie[0]] = splitCookie[1];
  });
  req.cookies = cookieObj;
  next();
  return cookieObj;
};

module.exports = parseCookies;