import express from "express";
import "express-async-errors";
import * as timelineController from "../controller/timeline.controller.js";
import { isAuth } from "../middleware/auth.js";
import { fileSizeLimitErrorHandler, timelineUpload } from "../middleware/uploads.js";

const router = express.Router();

// 타임라인 사진 가져오기
router.get("/", timelineController.listAllImages);

// 타임라인 사진 업로드
router.post(
  "/upload",
  isAuth,
  timelineUpload.any(), 
  fileSizeLimitErrorHandler, 
  timelineController.upload
);

export default router;
