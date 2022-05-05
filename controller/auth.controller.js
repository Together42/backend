import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {} from 'express-async-errors';
import * as userRepository from '../data/auth.js';
import { config } from '../config.js';

export async function signUp(req, res) {
	const { intraId, password, email, url } = req.body;
	const user = await userRepository.findByintraId(intraId);
	if(user){ //이미 존재하는 사용자라면
		return res.status(400).json({message: `${intraId} already exists`});
	}
	const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
	const userId = await userRepository.createUser({
		intraId,
		password: hashed,
		email,
		url,
	});
	const token = createJwtToken(userId);
	res.status(201).json({token, intraId});
}

export async function login(req, res) {
	const { intraId, password } = req.body;
	const user = await userRepository.findByintraId(intraId);
	if(!user){//사용자가 존재하는지 검사
		return res.status(401).json({message: 'Invalid user or password'});
	}
	const isValidPassword = await bcrypt.compare(password, user.password);
	if(!isValidPassword){//비밀먼호 검증
		return res.status(401).json({message: 'Invalid user or password'});
	}
	const url = user.url;
	const token = createJwtToken(user.intraId);
	res.status(200).json({token, intraId, url });
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
	res.status(200).json({token: req.token, intraId:user.intraId});
}

export async function uploadProfile(req, res) {
	const image = req.file.path;
	//console.log(req.file);
	//console.log(image);
	if(image === undefined){
		return res.status(400).send(util.fail(400, "이미지가 없다"));
	}
	res.status(200).send(util.success(200, "요청 성공 ", image));
}

export async function uploadImages(req, res) {
	const image = req.files;
	const path = image.map(img => img.path);
	if(image === undefined){
		return res.status(400).send(util.fail(400, "이미지가 없다"));
	}
	res.status(200).send(util.success(200, "요청 성공 ", path));
}

const util = {
	success: (status, message, data) => {
		return {
			status: status,
			success: true,
			message: message,
			data: data
		}
	},
	fail: (status, message) => {
		return {
			status: status,
			success: false,
			message: message
		}
	}
}