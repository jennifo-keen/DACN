import express from "express";
import { getTicketsByBooking } from "../controllers/ticket.controller.js";

const router = express.Router();
router.get("/:bookingId/tickets", getTicketsByBooking);

export default router;
