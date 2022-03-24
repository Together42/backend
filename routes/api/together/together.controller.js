
//const db = require('../../../db.js');
///*
//POST /api/auth/register
//{
//	username,
//	password
//}
//*/

//const bcrypt = require('bcrypt');
//const saltRounds = 10; //암호화 진행 횟수

//exports.register = (req, res, next) => {
//	const param = [req.body.id, req.body.pw, req.body.name];
//	bcrypt.hash(param[1], saltRounds, (error, hash)=>{
//		param[1] = hash;
//		db.query('INSERT INTO test(`id`,`pw`,`name`) VALUES (?,?,?)', param, (err, row) =>{
//			console.log(param);
//			if(err)
//				console.log(err);
//		})
//	})
//	res.end();
//}
