const router = require('express').Router();
const controller = require('./auth.controller');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/logout', controller.logout);

module.exports = router