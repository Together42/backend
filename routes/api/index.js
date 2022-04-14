const router = require('express').Router();
const auth = require('./auth');
const together = require('./together');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const express = require("express");

const app = express();
router.use('/auth', auth);
router.use('/together', together);

app.use(cors({
	origin : true,
	credentials : true
}));
app.use(cookieParser());
app.use(
	session({
		key: "loginData",
		secret: "testSecret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			expires: 60*60*24,
		},
	})
);


module.exports = router;