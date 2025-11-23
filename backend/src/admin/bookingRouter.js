import { Router } from "express";
import Booking from "../models/Booking.js";
import { BookingDetail } from "../models/BookingDetail.js";
import { Payment } from "../models/Payment.js";

const router = Router();

router.get("/booking", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp startDate và endDate"
            });
        }

        const start = new Date(startDate + "T00:00:00.000Z");
        const end = new Date(endDate + "T23:59:59.999Z");

        const bookings = await Booking.find({
            createdAt: { $gte: start, $lte: end }
        }).sort({ createdAt: -1 });

        const bookingIds = bookings.map(b => b._id.toString());

        const bookingDetails = await BookingDetail.find({
            bookingId: { $in: bookingIds }
        }).lean();

        const payments = await Payment.find({
            bookingId: { $in: bookingIds }
        }).lean();

        const paymentMap = {};
        payments.forEach(p => {
            paymentMap[p.bookingId.toString()] = p;
        });

        const detailsMap = {};
        bookingDetails.forEach(d => {
            const id = d.bookingId.toString();
            if (!detailsMap[id]) detailsMap[id] = [];
            detailsMap[id].push(d);
        });

        const revenueByDate = {};
        let totalRevenue = 0;
        let totalTickets = 0;

        bookings.forEach(b => {
            const id = b._id.toString();
            const dateKey = new Date(b.createdAt).toISOString().split("T")[0];

            if (!revenueByDate[dateKey]) {
                revenueByDate[dateKey] = {
                    date: dateKey,
                    ticketCount: 0,
                    revenue: 0
                };
            }

            let revenue = 0;
            const payment = paymentMap[id];
            if (payment?.amount) revenue = payment.amount;
            else if (b.totalAmount) revenue = b.totalAmount;
            else {
                const details = detailsMap[id] || [];
                details.forEach(d => {
                    if (d.totalPrice) revenue += d.totalPrice;
                });
            }

            const details = detailsMap[id] || [];
            const ticketCount = details.reduce((sum, d) => {
                return sum + (d.quantityAdult || 0) + (d.quantityChild || 0);
            }, 0);

            revenueByDate[dateKey].ticketCount += ticketCount;
            revenueByDate[dateKey].revenue += revenue;

            totalRevenue += revenue;
            totalTickets += ticketCount;
        });

        const details = Object.values(revenueByDate)
            .map(r => {
                const [year, month, day] = r.date.split("-");
                return {
                    date: `${day}/${month}/${year}`,
                    ticketCount: r.ticketCount,
                    revenue: r.revenue,
                    bookingIds 
                };
            })
            .sort((a, b) => {
                const A = a.date.split("/").reverse().join("-");
                const B = b.date.split("/").reverse().join("-");
                return B.localeCompare(A);
            });

        res.status(200).json({
            success: true,
            summary: {
                total: totalRevenue,
                totalTickets,
                totalBookings: bookings.length,
            },
            details
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
});

export default router;
