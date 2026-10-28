import Promotion from '../models/Promotion.js';
import Booking from '../models/Booking.js';
import { memoryStore } from '../config/memoryStore.js';
import { isDbConnected } from '../config/database.js';

export const validatePromotion = async (req, res, next) => {
  try {
    const { code, seatCount } = req.body;
    const cleanCode = code?.toUpperCase()?.trim();

    let promo = null;
    if (isDbConnected()) {
      promo = await Promotion.findOne({
        code: cleanCode,
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });
    } else {
      promo = memoryStore.promotions.find(
        (p) => p.code === cleanCode && p.isActive !== false
      );
    }

    if (!promo) {
      return res.json({ success: false, valid: false, message: 'Invalid or expired promotional code' });
    }

    if (promo.eligibility?.studentOnly && !req.user?.studentVerified) {
      return res.json({
        success: false,
        valid: false,
        message: 'This promo is restricted to verified student accounts',
      });
    }

    if (seatCount && promo.eligibility?.minTickets > seatCount) {
      return res.json({
        success: false,
        valid: false,
        message: `Requires minimum ${promo.eligibility.minTickets} seats to apply`,
      });
    }

    res.json({
      success: true,
      valid: true,
      data: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        maxDiscountAmount: promo.maxDiscountAmount,
        description: promo.description,
      },
    });
  } catch (err) {
    next(err);
  }
};
