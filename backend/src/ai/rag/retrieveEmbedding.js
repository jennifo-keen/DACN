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
    const allEmbeddings = await Embedding.find({});

    const scored = allEmbeddings.map(doc => {
        const score = cosineSimilarity(queryVec, doc.embedding);
        return { ...doc.toObject(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
}