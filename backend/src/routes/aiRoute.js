import express from "express";
import { handleAI } from "../ai/controllers/aiController.js";
import { answerQuestion } from "../ai/controllers/qaController.js";

const router = express.Router();

router.post("/ask", handleAI);
router.post("/qa", answerQuestion); // endpoint mới cho RAG

export default router;
