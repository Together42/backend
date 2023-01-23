import express from "express";
import "express-async-errors";
import * as rotationController from "../controller/rotation.controller.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

// 로테이션 참석 사서 추가
router.post("/attend", isAuth, rotationController.addParticipant);

// 사서 로테이션 진행 및 결과 반환
router.get("/", rotationController.setRotationAndGet);

// 사서 일정 변경
router.patch("/update/:intraId", isAuth, rotationController.updateAttendInfo);

export default router;