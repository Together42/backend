import express from "express";
import "express-async-errors";
import * as userController from "../controller/user.controller.js";

const router = express.Router();

//GET 유저리스트 조회
router.get("/userList", userController.getUserList);

export default router;
