import express from "express";
import "express-async-errors";
import { validateSignup } from "../middleware/validator.js";
import { isAuth } from "../middleware/auth.js";
import * as authController from "../controller/auth.controller.js";

const router = express.Router();

//POST /signUp
router.post("/signup", validateSignup, authController.signUp);

//POST /login
router.post("/login", authController.login);

//GET /me
router.get("/me", isAuth, authController.me);

//메일인증 보내기
router.post("/mail", authController.mailAuthentication);

//메일 인증확인
router.post("/cert", authController.cert);

//GET 유저리스트 조회
router.get("/userList", authController.getByUserList);

//유저 정보 조회(intraId, Email)
router.get("/userInfo/:id", authController.getByUserInfo);

// 유저 비밀번호 변경(intraId, password)
router.put("/password/:id", authController.updatePassword);

export default router;
