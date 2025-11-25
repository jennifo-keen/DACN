import fetch from "node-fetch";


/**
 * Gọi tới llama-server đang chạy ở localhost:8080
 * @param {string} prompt - câu hỏi hoặc input
 * @returns {Promise<string>} - câu trả lời từ model
 */
export async function runAI(prompt) {
    try {
        const response = await fetch("http://127.0.0.1:8080/completion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                n_predict: 400,
                temperature: 0.1,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        }

        const data = await response.json();
        return data.content.trim();
    } catch (err) {
        console.error("runAI error:", err);
        throw err;
    }
}