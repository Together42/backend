var express = require('express');
const app = express();
var router = express.Router();
const authCheck = require('../middleware/token');
/* GET home page. */

router.use((req,res,next) => {
  console.log('test');
  authCheck(req,res,next);
  next();
});

router.get('/', function(req, res, next) {
  res.render('index', { token: res.locals.state });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: '회원가입', token: res.locals.state });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: '로그인', token: res.locals.state });
});

router.get('/together', function(req, res, next) {
  console.log(`together ${res.locals.state}`);
  if(!res.locals.state)
    res.redirect('/login');
  res.render('together_test', { title: '친바하기', token: res.locals.state });
});

module.exports = router;