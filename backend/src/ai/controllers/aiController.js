import { runAI } from "../aiService.js"

export async function handleAI(req, res) {
    try {
        // luôn lấy message từ body
        const question = req.body.message;

        if (!question || typeof question !== "string" || !question.trim()) {
            return res.status(400).json({ error: "Thiếu hoặc sai định dạng 'message' trong request body" });
        }

        const prompt = `Người dùng hỏi: ${question}\nTrả lời tự nhiên bằng tiếng Việt`;

        const result = await runAI(prompt);

        res.json({ reply: result });
    } catch (err) {
        console.error("AI error:", err);
        res.status(500).json({ error: "AI failed", detail: err.message });
    }
}
