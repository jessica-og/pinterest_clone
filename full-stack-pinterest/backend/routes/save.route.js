import express from "express";
import { //savePin, 
    getUserSaves } from "../controllers/save.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

//router.post("/", verifyToken, savePin);
router.get("/:userId",  getUserSaves);

export default router;
