var express = require('express');
const jwt = require("jsonwebtoken");
var router = express.Router();

/* GET home page. */

function getCookie(cookie, cName) {
  if (!cookie)
    return ;
  const name = cName + "=";
  const cArr = cookie.split('; ');
  let res;
  cArr.forEach(val => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  })
  return res
}

router.get('/', function(req, res, next) {
  const token = getCookie(req.headers.cookie, 'userId');
  let state;
  if (token) {
    try {
      req.decoded = jwt.verify(token, process.env.JW_SECRET);
      state = true;
    } catch (error) {
      state = false;
    }
  }
  res.render('index', { token: state });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: '회원가입' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: '로그인' });
});

router.get('/together', function(req, res, next) {
  const token = getCookie(req.headers.cookie, 'userId');
  let state;
  if (token) {
    try {
      req.decoded = jwt.verify(token, process.env.JW_SECRET);
      state = true;
    } catch (error) {
      state = false;
    }
  }
  res.render('together_test', { title: '친바하기', token: state });
});
module.exports = router;
