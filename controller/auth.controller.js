import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {} from 'express-async-errors';
import * as userRepository from '../data/auth.js';
import { config } from '../config.js';

export async function signUp(req, res) {
	const { intraId, password, email, profile } = req.body;
	const user = await userRepository.findByintraId(intraId);
	console.log(user);
	if(user){ //이미 존재하는 사용자라면
		return res.status(400).json({message: `${intraId}는 이미 사용중입니다`});
	}
	
	const checkEmail = await userRepository.findByEmail(email);
	if(checkEmail){ //이미 존재하는 이메일
		return res.status(400).json({message: `${email}는 이 사용중입니다`});
	}
	const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
	const userId = await userRepository.createUser({
		intraId,
		password: hashed,
		email,
		profile,
	});
	const token = createJwtToken(userId);
	console.log(`signUp: ${intraId},  time : ${new Date()}`);
	res.status(201).json({token, intraId});
}

export async function login(req, res) {
	const { intraId, password } = req.body;
	const user = await userRepository.findByintraId(intraId);
	if(!user){//사용자가 존재하는지 검사
		return res.status(401).json({message: '아이디와 비밀번호가 틀렸습니다'});
	}
	const isValidPassword = await bcrypt.compare(password, user.password);
	if(!isValidPassword){//비밀먼호 검증
		return res.status(401).json({message: '아이디와 비밀번호가 틀렸습니다'});
	}
	const profile = user.profile;
	const token = createJwtToken(user.intraId, user.isAdmin);
	console.log(`login id : ${intraId},  time : ${new Date()}`);
	res.status(200).json({token, intraId, profile });
	}

function createJwtToken(id, isAdmin) {
	return jwt.sign({id, isAdmin}, config.jwt.secretKey, {expiresIn: config.jwt.expiresInSec});
}

export async function me(req, res) {
	const user = await userRepository.findById(req.userId);
	if(!user) {
		return res.status(404).json({mesage: '사용자가 없습니다'});
	}
	res.status(200).json({token: req.token, intraId:user.intraId});
}
