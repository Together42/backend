import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {} from 'express-async-errors';
import * as userRepository from '../data/auth.js';
import { config } from '../config.js';

//id pw email name gender location hobby

export async function signUp(req, res) {
	const { loginId, pw, nickName, email, url } = req.body;
	const found = await userRepository.findByLoginId(loginId);
	if(found){ //이미 존재하는 사용자라면
		return res.status(400).json({message: `${loginId} already exists`});
	}
	const hashed = await bcrypt.hash(pw, config.bcrypt.saltRounds);
	const userId = await userRepository.createUser({
		loginId,
		pw: hashed,
		nickName,
		email,
		url,
	});
	const token = createJwtToken(userId);
	console.log(hashed);
	res.status(201).json({token, loginId});
	//,res.redirect('/'));
}

export async function login(req, res) {
	const { loginId, pw } = req.body;
	const user = await userRepository.findByLoginId(loginId);
	if(!user){//사용자가 존재하는지 검사
		return res.status(401).json({message: 'Invalid user or password'});
	}
	const isValidPassword = await bcrypt.compare(pw, user.pw);
	if(!isValidPassword){//비밀먼호 검증
		return res.status(401).json({message: 'Invalid user or password'});
	}
	const token = createJwtToken(user.loginId);
	res.status(200).json({token, loginId});
	//,res.redirect('/'));
}

function createJwtToken(id) {
	return jwt.sign({id}, config.jwt.secretKey, {expiresIn: config.jwt.expiresInSec});
}

export async function me(req, res) {
	const user = await userRepository.findById(req.userId);
	if(!user) {
		return res.status(404).json({mesage: 'User not found'});
	}
	res.status(200).json({token: req.token, loginId:user.loginId});
}