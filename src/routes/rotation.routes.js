import express from "express";
import "express-async-errors";
import * as rotationController from "../controller/rotation.controller.js"
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/attend", isAuth, rotationController.addParticipant);

export default router;