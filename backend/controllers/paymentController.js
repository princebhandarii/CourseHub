const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Course   = require('../models/Course');
const { Enrollment } = require('../models/index');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/payment/order/:courseId
exports.createOrder = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || !course.isPublished)
      return res.status(404).json({ success: false, message: 'Course not found.' });

    // Already enrolled?
    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing)
      return res.status(400).json({ success: false, message: 'Already enrolled.' });

    // Free course — enroll directly, no payment needed
    if (course.price === 0) {
      await Enrollment.create({ user: req.user._id, course: course._id, amountPaid: 0 });
      await Course.findByIdAndUpdate(course._id, { $inc: { enrollmentCount: 1 } });
      return res.json({ success: true, free: true });
    }

    // Create Razorpay order (amount must be in paise)
    const order = await razorpay.orders.create({
      amount:   Math.round(course.price * 100),
      currency: 'INR',
      receipt:  `rcpt_${req.user._id}_${course._id}`.slice(0, 40),
      notes: {
        courseId: course._id.toString(),
        userId:   req.user._id.toString(),
      },
    });

    res.json({
      success: true,
      free:    false,
      order,
      key:     process.env.RAZORPAY_KEY_ID,
      course: {
        name:        course.title,
        description: course.shortDesc || course.description?.slice(0, 100) || '',
        thumbnail:   course.thumbnail || '',
        amount:      course.price,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @POST /api/payment/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    // Verify signature
    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ success: false, message: 'Course not found.' });

    // Enroll user (skip if already enrolled)
    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!existing) {
      await Enrollment.create({
        user:       req.user._id,
        course:     courseId,
        amountPaid: course.price,
        paymentId:  razorpay_payment_id,
      });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    }

    res.json({ success: true, message: 'Payment verified. Enrolled successfully!' });
  } catch (err) {
    next(err);
  }
};