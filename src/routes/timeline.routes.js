import express from "express";
import "express-async-errors";
import * as timelineController from "../controller/timeline.controller.js";

const router = express.Router();

//타임라인 사진 가져오기
router.get("/", timelineController.listAllImages);

export default router;