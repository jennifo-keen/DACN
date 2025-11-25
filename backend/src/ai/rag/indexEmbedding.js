import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { embedText } from "../services/embedding.js";
import { Embedding } from "../../models/Embedding.js";

// import các model gốc
import { Province } from "../../models/Province.js";
import { Branch } from "../../models/Branch.js";
import { Zone } from "../../models/Zone.js";
import { TicketType } from "../../models/TicketType.js";
import { PromoCode } from "../../models/PromoCodes.js";

function splitIntoChunks(text, maxLen = 1200, overlap = 200) {
    if (!text || typeof text !== "string") return [];

    // đảm bảo overlap nhỏ hơn maxLen
    if (overlap >= maxLen) {
        throw new Error("Overlap phải nhỏ hơn maxLen");
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + maxLen, text.length);
        const chunk = text.slice(start, end);

        if (chunk.trim()) {
            chunks.push(chunk);
        }

        // tăng start theo bước (maxLen - overlap)
        start += (maxLen - overlap);
    }

    return chunks;
}

async function indexProvinces() {
    const provinces = await Province.find({});
    for (const province of provinces) {
        const combinedText = [province.provinceName, province.description].filter(Boolean).join(" | ");
        if (!combinedText) continue;

        const chunks = splitIntoChunks(combinedText);
        for (let i = 0; i < chunks.length; i++) {
            const vec = await embedText(chunks[i]);
            await Embedding.create({
                sourceId: province._id,
                chunkIndex: i,
                chunkText: chunks[i],
                embedding: vec,
                metadata: { collection: "provinces" }
            });
        }
    }
    console.log("Done indexing provinces");
}

async function indexBranches() {
    const branches = await Branch.find({}).populate("provincesId");
    for (const branch of branches) {
        const combinedText = [
            branch.branchName,
            branch.description_branch,
            branch.provincesId?.provinceName,
            branch.provincesId?.description
        ].filter(Boolean).join(" | ");

        if (!combinedText) continue;

        const chunks = splitIntoChunks(combinedText);
        for (let i = 0; i < chunks.length; i++) {
            const vec = await embedText(chunks[i]);
            await Embedding.create({
                sourceId: branch._id,
                chunkIndex: i,
                chunkText: chunks[i],
                embedding: vec,
                metadata: {
                    collection: "branches",
                    provinceId: branch.provincesId?._id,
                    provinceName: branch.provincesId?.provinceName
                }
            });
        }
    }
    console.log("✅ Done indexing branches");
}

async function indexZones() {
    const zones = await Zone.find({}).populate("branchesId");
    for (const zone of zones) {
        const combinedText = [
            zone.zoneName,
            zone.description_zone,
            `Opening: ${zone.openingTime_zone?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
            `Closing: ${zone.closingTime_zone?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
            zone.branchesId?.branchName,
            zone.branchesId?.description_branch
        ].filter(Boolean).join(" | ");

        if (!combinedText) continue;

        const chunks = splitIntoChunks(combinedText);
        for (let i = 0; i < chunks.length; i++) {
            const vec = await embedText(chunks[i]);
            await Embedding.create({
                sourceId: zone._id,
                chunkIndex: i,
                chunkText: chunks[i],
                embedding: vec,
                metadata: {
                    collection: "zones",
                    branchId: zone.branchesId?._id,
                    branchName: zone.branchesId?.branchName
                }
            });
        }
    }
    console.log("✅ Done indexing zones");
}
async function indexTicketTypes() {
    const tickets = await TicketType.find({})
        .populate("branchId")
        .populate("includedZones"); // populate mảng zone

    for (const ticket of tickets) {
        // Ghép text từ nhiều field
        const combinedText = [
            ticket.ticketName,
            ticket.description_ticket,
            `Giá người lớn: ${ticket.priceAdult}`,
            `Giá trẻ em: ${ticket.priceChild}`,
            `Trạng thái: ${ticket.status}`,
            ticket.branchId?.branchName,
            ticket.branchId?.description_branch,
            ...(ticket.includedZones?.map(z => `${z.zoneName} - ${z.description}`) || [])
        ]
            .filter(Boolean)
            .join(" | ");

        if (!combinedText) continue;

        const chunks = splitIntoChunks(combinedText);
        for (let i = 0; i < chunks.length; i++) {
            const vec = await embedText(chunks[i]);
            await Embedding.create({
                sourceId: ticket._id,
                chunkIndex: i,
                chunkText: chunks[i],
                embedding: vec,
                metadata: {
                    collection: "ticketTypes",
                    branchId: ticket.branchId?._id,
                    branchName: ticket.branchId?.branchName,
                    zoneIds: ticket.includedZones?.map(z => z._id),
                    zoneNames: ticket.includedZones?.map(z => z.zoneName)
                }
            });
        }
    }
    console.log("✅ Done indexing ticketTypes");
}

async function indexPromoCodes() {
    const promos = await PromoCode.find({});
    for (const promo of promos) {
        const combinedText = [promo.code, promo.description_promo, promo.discountPercent?.toString()]
            .filter(Boolean)
            .join(" | ");

        if (!combinedText) continue;

        const chunks = splitIntoChunks(combinedText);
        for (let i = 0; i < chunks.length; i++) {
            const vec = await embedText(chunks[i]);
            await Embedding.create({
                sourceId: promo._id,
                chunkIndex: i,
                chunkText: chunks[i],
                embedding: vec,
                metadata: { collection: "promo_codes" }
            });
        }
    }
    console.log("✅ Done indexing promo_codes");
}

async function run() {
    try {
        // dùng đúng biến MONGODB_URI từ .env
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await indexProvinces();
        await indexBranches();
        await indexZones();
        await indexTicketTypes();
        await indexPromoCodes();

        await mongoose.disconnect();
        console.log("✅ Indexing hoàn tất");
    } catch (err) {
        console.error("❌ Lỗi connect MongoDB:", err);
    }
}

run();
