var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

const authCheck = (req, res, next) => {
	console.log('hi');
	const token = getCookie(req.headers.cookie, 'userId');
	if (token) {
	  try {
		jwt.verify(token, process.env.JW_SECRET);
		res.locals.state = true;
	  } catch (error) {
		res.locals.state = false;
	  }
	}
};


module.exports = authCheck;