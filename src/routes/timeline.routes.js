import express from 'express'
import 'express-async-errors'
import * as timelineController from '../controller/timeline.controller.js'
import { fileSizeLimitErrorHandler, timelineUpload } from '../middleware/uploads.js'


const router = express.Router()

//타임라인 사진 가져오기
router.get('/', timelineController.listAllImages)

//router.post('/upload', timelineUpload.any(), fileSizeLimitErrorHandler, timelineController.upload)

export default router