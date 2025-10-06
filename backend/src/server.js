import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

// ➕ import routes
import branchRoutes from "./routes/branch.route.js";
import uploadRoutes from "./routes/upload.route.js";

const app = express();
app.use(express.json());
app.use(cors());

// ===== LOGIN DEMO (bạn giữ nguyên) =====
app.post("/auth/login-plain", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
    const user = await User.findOne({ email: email.toLowerCase(), password, status: "active" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ _id: user._id, email: user.email, name: user.name, role: user.role, status: user.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/", (_req, res) => res.json({ ok: true }));

// ✅ mount API cho branches + upload
app.use("/api", branchRoutes);
app.use("/api/admin", uploadRoutes);

const PORT = process.env.PORT || 4000;
connectDB().then(() => app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`)));
