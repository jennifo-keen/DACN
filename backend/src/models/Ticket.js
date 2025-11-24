import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    bookingDetailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookingDetail',
      required: true,
      index: true
    },
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketType',
      required: true,
      index: true
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'used', 'cancelled', 'expired'],
      default: 'pending',
      index: true
    },
    usedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    collection: 'tickets'
  }
);

// Index để search nhanh
ticketSchema.index({ qrCode: 1 });
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ bookingDetailId: 1, status: 1 });

// Virtual để lấy thông tin ticket type
ticketSchema.virtual('ticketType', {
  ref: 'TicketType',
  localField: 'ticketTypeId',
  foreignField: '_id',
  justOne: true
});

// Virtual để lấy thông tin booking detail
ticketSchema.virtual('bookingDetail', {
  ref: 'BookingDetail',
  localField: 'bookingDetailId',
  foreignField: '_id',
  justOne: true
});

// Method để đánh dấu vé đã sử dụng
ticketSchema.methods.markAsUsed = function() {
  this.status = 'used';
  this.usedAt = new Date();
  return this.save();
};

// Method để hủy vé
ticketSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

// Static method để generate QR code unique
ticketSchema.statics.generateQRCode = async function(ticketType, index) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `QR-${ticketType}-${timestamp}-${random}`;
};

// Middleware: Validate trước khi save
ticketSchema.pre('save', async function(next) {
  // Nếu QR code chưa có, tự động generate
  if (!this.qrCode && this.ticketTypeId) {
    const TicketType = mongoose.model('TicketType');
    const ticketType = await TicketType.findById(this.ticketTypeId);
    if (ticketType) {
      this.qrCode = await this.constructor.generateQRCode(
        ticketType.ticketName.toUpperCase(),
        Math.floor(Math.random() * 1000)
      );
    }
  }
  next();
});

export const Ticket = mongoose.model('Ticket', ticketSchema);