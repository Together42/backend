import express from "express"
import "express-async-errors"
import { isAuth } from "../middleware/auth.js"
import * as togetherController from "../controller/together.controller.js"

const router = express.Router()

router.get("/", togetherController.getEventList)
router.post("/", isAuth, togetherController.createEvent)
router.post("/register", isAuth, togetherController.register)
router.delete("/unregister/:id", isAuth, togetherController.unregister)
router.post("/matching", isAuth, togetherController.matching)
router.get("/matching", togetherController.getEventInfo)
router.get("/matching/:id", togetherController.getTeam)
router.get("/:id", togetherController.getEvent)
router.delete("/:id", isAuth, togetherController.deleteEvent)

export default router
