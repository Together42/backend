const db = require('../../../db.js');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookie = require('cookie');

/*
POST /api/auth/register
{
	username,
	password
}
*/

const bcrypt = require('bcrypt');
const saltRounds = 10; //암호화 진행 횟수

exports.register = (req, res, next) => {
	const param = [req.body.id, req.body.pw, req.body.name];
	//console.log(param);
	const user = [req.body.id, req.body.pw, req.body.name];
	db.query('SELECT * FROM test WHERE id=?', user, (err, result) =>{
	
		console.log(result);
		if(result.length > 0)
			console.log('중복된 아이디입니다');
		//else if(result[0].name > 0)
		//	console.log('중복된 이름입니다');
		else{
		bcrypt.hash(param[1], saltRounds, (error, hash)=>{
			param[1] = hash;
			db.query('INSERT INTO test(`id`,`pw`,`name`) VALUES (?,?,?)', param, (err, row) =>{
				console.log(param);
				if(err)
					console.log(err);
			})
		})
	}
	})
	res.end();
}

exports.login = (req, res, next) => {
	const param = [req.body.id, req.body.pw];
	const {userId, userPw} = req.body;
	db.query('SELECT * FROM test WHERE id=?', param, (err, row) =>{
		console.log(`param , ${param} param[1]= ${param[1]}`);
		if(err)
			console.log(err);
		if(row.length > 0){
			console.log(row[0].pw);
			//id 존재하면 pw도 체크해야함 근데 bcrypt 복호화해서 비교
			bcrypt.compare(param[1], row[0].pw, (error, result) =>{
				if(result){
					//성공
					console.log('로그인성공');
					const YOUR_SECRET_KEY = process.env.JW_SECRET;
					const accessToken = jwt.sign(
					{
						userId,
					},
					YOUR_SECRET_KEY,
					{
						expiresIn: "1h",
					}
					);
					res.cookie("userId", accessToken);
					res.status(201).json({
					result: "ok",
					accessToken,
					});
				}else{
					//실패
					res.status(400).json({ error: 'invalid user' });
					console.log('비번틀림');
				}
			})
		}else{
			console.log('ID가 없습니다');
		}
	})

	//res.end();
}