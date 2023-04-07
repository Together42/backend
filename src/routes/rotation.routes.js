import express from "express";
import "express-async-errors";
import * as rotationController from "../controller/rotation.controller.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

// 사서 로테이션 참석 기록 반환
router.get("/attend", isAuth, rotationController.getUserParticipation);

// 로테이션 참석 사서 추가
router.post("/attend", isAuth, rotationController.addParticipant);

// 로테이션 참석 사서 삭제
router.delete("/attend", isAuth, rotationController.deleteParticipant);

// 전체 사서 로테이션 결과 반환
router.get("/", rotationController.getRotationInfo);

// 사서 일정 변경
router.patch("/update", isAuth, rotationController.updateAttendInfo);

// 사서 일정 삭제
router.delete("/update", isAuth, rotationController.deleteAttendInfo);

export default router;