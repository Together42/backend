import express from 'express'
import 'express-async-errors'
import * as slackController from '../controller/slack.controller.js'

const router = express.Router()

router.post('',slackController.publishMessages)

export default router