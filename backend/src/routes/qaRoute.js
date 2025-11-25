import express from "express";
import { answerQuestion } from "../controllers/qaController.js";

const router = express.Router();

router.post("/qa", answerQuestion);

export default router;