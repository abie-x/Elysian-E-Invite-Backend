import { Router } from "express";
import { randomBytes } from "crypto";
import Guest from "../models/Guest.js";

const router = Router();

function sendError(res, status, message) {
    return res.status(status).json({ success: false, error: message });
}

async function generateUniqueQrId(maxAttempts = 5) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const candidate = randomBytes(4).toString("hex");
        // Ensure uniqueness before creating
        // eslint-disable-next-line no-await-in-loop
        const existing = await Guest.findOne({ qrId: candidate }).lean();
        if (!existing) return candidate;
    }
    throw new Error("Failed to generate unique qrId");
}

// POST /api/guests - Create a new guest & auto-generate QR ID
router.post("/", async (req, res) => {
    try {
        const { name, place } = req.body || {};
        if (typeof name !== "string" || typeof place !== "string") {
            return sendError(res, 400, "name and place are required strings");
        }
        const trimmedName = name.trim();
        const trimmedPlace = place.trim();
        if (!trimmedName || !trimmedPlace) {
            return sendError(res, 400, "name and place cannot be empty");
        }

        const qrId = await generateUniqueQrId();
        const guest = await Guest.create({ name: trimmedName, place: trimmedPlace, qrId });
        return res.status(201).json({ success: true, guest });
    } catch (err) {
        if (err && err.code === 11000) {
            return sendError(res, 409, "qrId already exists");
        }
        return sendError(res, 500, "Internal server error");
    }
});

// GET /api/guests - Get all guests
router.get("/", async (_req, res) => {
    try {
        const guests = await Guest.find({}).sort({ createdAt: 1 }).lean();
        return res.json({ success: true, guests });
    } catch (_err) {
        return sendError(res, 500, "Internal server error");
    }
});

// GET /api/guests/:qrId - Fetch guest info using QR ID
router.get("/:qrId", async (req, res) => {
    try {
        const { qrId } = req.params;
        const guest = await Guest.findOne({ qrId }).lean();
        if (!guest) return sendError(res, 404, "Guest not found");
        return res.json({ success: true, guest });
    } catch (_err) {
        return sendError(res, 500, "Internal server error");
    }
});

// PATCH /api/guests/:qrId/checkin - Mark guest as checked in
router.patch("/:qrId/checkin", async (req, res) => {
    try {
        const { qrId } = req.params;
        const guest = await Guest.findOneAndUpdate(
            { qrId },
            { $set: { checkedIn: true } },
            { new: true }
        );
        if (!guest) return sendError(res, 404, "Guest not found");
        return res.json({ success: true, guest });
    } catch (_err) {
        return sendError(res, 500, "Internal server error");
    }
});

export default router;


