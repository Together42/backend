import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as authController from '../controller/auth.controller.js';

const router = express.Router();

//로그인할때 
const validateCredential = [
	body('intraId')
		.trim()
		.notEmpty()
		.isLength({min:2})
		.withMessage('intraId는 2글자 이상이어야 합니다'),
	body('password')
		.trim()
		.isLength({min:8})
		.withMessage('password는 8글자 이상이어야 합니다'),
	validate,
];

//회원가입 유효성 검사
const validateSignup= [
	...validateCredential,
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('email 형식을 지켜주세요'),
	validate,
];

//POST /signUp
router.post('/signup',validateSignup, authController.signUp);

//POST /login
router.post('/login', authController.login);

//GET /me
router.get('/me', isAuth,  authController.me);

export default router;