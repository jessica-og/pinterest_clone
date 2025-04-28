import express from "express";
import {
  getPins,
  getPin,
  createPin,
  updatePin,
  deletePin,
  interactionCheck,  
  interact,
} from "../controllers/pin.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();
  
router.get("/", getPins);
router.get("/:id", getPin);
router.post("/", verifyToken, createPin);
router.put("/:id", verifyToken, updatePin); // Update pin
router.delete("/:id", verifyToken, deletePin); // Delete pin
router.get("/interaction-check/:id", interactionCheck);
router.post("/interact/:id",verifyToken, interact);

export default router;
