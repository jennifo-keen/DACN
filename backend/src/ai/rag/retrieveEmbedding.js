import { embedText } from "../services/embedding.js";
import { Embedding } from "../../models/Embedding.js";

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
}

export async function retrieveContext(question, topK = 10) {
    const queryVec = await embedText(question);

    const pricePattern = /giá|vé|bao nhiêu|price/i;
    const locationPattern = /khu vực|chi nhánh|chỗ|branch|province/i;

    let embeddings;

    if (pricePattern.test(question)) {
        embeddings = await Embedding.find({
            "metadata.collection": "ticketTypes"
        });
    } else if (locationPattern.test(question)) {
        embeddings = await Embedding.find({
            "metadata.collection": { $in: ["provinces", "branches"] }
        });
    } else {
        embeddings = await Embedding.find({});
    }

    const scored = embeddings.map(doc => {
        const score = cosineSimilarity(queryVec, doc.embedding);
        return { ...doc.toObject(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
}