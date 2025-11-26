import mongoose from "mongoose";

const EmbeddingSchema = new mongoose.Schema({
    sourceId: mongoose.Schema.Types.ObjectId,
    chunkIndex: Number,
    chunkText: String,
    embedding: [Number],
    metadata: Object
});

export const Embedding = mongoose.model("embeddings", EmbeddingSchema);