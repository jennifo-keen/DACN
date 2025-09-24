import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB Atlas");
}
