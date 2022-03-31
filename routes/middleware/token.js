var express = require('express');
const jwt = require("jsonwebtoken");
require("dotenv").config();


const authCheck = (req, res, next) => {
	function getCookie(cookie, cName) {
		if (!cookie)
			return ;
		const name = cName + "=";
		const cArr = cookie.split('; ');
		let res;
		cArr.forEach(val => {
		if (val.indexOf(name) === 0) res = val.substring(name.length);
		})
		return res;
	}

	const tokenCheck = ()=> {
		token = getCookie(req.headers.cookie, 'userId');
		let state;
		if (token) {
			try {
			req.decoded = jwt.verify(token, process.env.JW_SECRET);
			state = true;
			} catch (error) {
			state = false;
			res.status(401).json({ error: 'Auth Error from authChecker' });
			}
		}
	res.render('index', { token: state });
	next();
}}

module.exports = authCheck;