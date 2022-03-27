var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Together42' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: '회원가입' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: '로그인' });
});

router.get('/together', function(req, res, next) {
  res.render('together_test', { title: '친바하기' });
});
module.exports = router;
