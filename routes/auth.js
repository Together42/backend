import express from 'express';
import 'express-async-errors';
import multer from 'multer';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as authController from '../controller/auth.controller.js';

const router = express.Router();
const upload = multer({
	dest: './uploads/'
	//},
	//filename: (req, res, next) => {
		
	}
);

//로그인할때 
const validateCredential = [
	body('intraId')
		.trim()
		.notEmpty()
		.isLength({min:2})
		.withMessage('intraId should be at least 2 characters'),
	body('pw')
		.trim()
		.isLength({min:8})
		.withMessage('password should be at least 5 characters'),
	validate,
];

//회원가입 유효성 검사
const validateSignup= [
	...validateCredential,
	//body('nickName')
	//	.notEmpty()
	//	.withMessage('nickName is missing'),
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('invalid email'),
	validate,
];

//POST /signUp
router.post('/signup',validateSignup, authController.signUp);

//POST /login
router.post('/login', authController.login);

//GET /me
router.get('/me', isAuth,  authController.me);

router.post('/profile', upload.single('image'), authController.uploadProfile);
router.post('/selfies', upload.array('image',4), authController.uploadImages);
export default router;