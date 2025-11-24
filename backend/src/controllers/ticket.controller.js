import Booking from "../models/Booking.js";
import  BookingDetail  from "../models/BookingDetail.js";
import  Tickets  from "../models/Tickets.js";
import  {TicketType}  from "../models/TicketType.js";

// API lấy toàn bộ vé theo bookingId
export const getTicketsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt vé" });
    }

    const bookingDetail = await BookingDetail.find({ bookingId });

    const detailsWithTickets = await Promise.all(
      bookingDetail.map(async (detail) => {
        const tickets = await Tickets.find({ bookingDetailId: detail._id })
          .populate("ticketTypeId", "ticketName priceAdult priceChild");
        return { bookingDetail: detail, tickets };
      })
    );

    res.status(200).json({
      booking,
      details: detailsWithTickets,
    });
  } catch (err) {
    console.error("Lỗi lấy vé:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
