import express from "express";
import {logiUser, verifyUser} from "../controllers/user.js";
const router = express.Router();

router.post("/login", logiUser);
router.post("/verify", verifyUser)
export default router;