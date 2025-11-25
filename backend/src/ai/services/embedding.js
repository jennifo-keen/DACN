import { pipeline } from "@xenova/transformers";

// Load model embedding (chạy 1 lần khi khởi động)
const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

export async function embedText(text) {
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data); // array số thực
}