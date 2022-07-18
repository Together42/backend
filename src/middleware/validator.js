import { validationResult } from 'express-validator'
import { body } from 'express-validator'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()){
    return next()
  }
  return res.status(400).json({ message: errors.array()[0].msg})
}

//로그인할때 
export const validateCredential = [
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
]

//회원가입 유효성 검사
export const validateSignup= [
  ...validateCredential,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('email 형식을 지켜주세요'),
  validate,
]