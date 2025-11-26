import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    userMessage: String,
    aiReply: String,
    createdAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model("chats", ChatSchema);