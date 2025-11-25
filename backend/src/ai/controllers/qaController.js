import { retrieveContext } from "../rag/retrieveEmbedding.js";
import { runAI } from "../aiService.js";

export async function answerQuestion(req, res) {
    const { question } = req.body;

    try {
        const contexts = await retrieveContext(question, 3);

        const contextText = contexts
            .map(c => c.chunkText || c.text || c.content || "")
            .join("\n---\n");

        const openingMatch = contextText.match(/Opening:\s*([0-9]{2}:[0-9]{2})/i);
        const closingMatch = contextText.match(/Closing:\s*([0-9]{2}:[0-9]{2})/i);

        if (/giờ|mấy giờ|mở cửa|closing|opening/i.test(question)) {
            if (openingMatch && closingMatch) {
                return res.json({
                    question,
                    answer: `Giờ mở cửa: ${openingMatch[1]} – ${closingMatch[1]}`,
                    contexts
                });
            }
        }

            const prompt = `
            <s>[INST]
            Bạn là trợ lý AI. Trả lời CHỈ dựa trên dữ liệu bên dưới.

            Quy tắc:
            - Nếu dữ liệu KHÔNG chứa thông tin trả lời → trả lời: "Không tìm thấy thông tin".
            - Không lặp lại câu hỏi.
            - Không giải thích dài dòng.
            - Không suy đoán.

            Câu hỏi:
            ${question}

            Dữ liệu:
            ${contextText}

            TRẢ LỜI:
            [/INST]
            `;


        const answer = await runAI(prompt, {
            n_predict: 300,
            temperature: 0.2
        });

        res.json({
            question,
            answer: (answer || "").trim() || "Không tìm thấy thông tin.",
            contexts
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}