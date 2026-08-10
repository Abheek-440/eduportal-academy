const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Initialize Razorpay instance helper
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay API keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  return {
    instance: new Razorpay({ key_id, key_secret }),
    key_id,
    key_secret,
  };
};


// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    const amountInPaise = Math.round(Number(course.price || 0) * 100);

    // If course is free (0 amount), allow immediate enrollment or 0 order
    if (amountInPaise <= 0) {
      const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
      });

      // Save a ₹0 completed payment record
      await Payment.create({
        student: studentId,
        course: courseId,
        razorpayOrderId: `free_order_${Date.now()}`,
        razorpayPaymentId: `free_pay_${Date.now()}`,
        amount: 0,
        currency: "INR",
        status: "paid",
      });

      return res.status(200).json({
        isFree: true,
        message: "Free course enrolled successfully",
        enrollment,
      });
    }

    const { instance, key_id } = getRazorpayInstance();

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${studentId.toString().slice(-8)}`,
      notes: {
        courseId: course._id.toString(),
        studentId: studentId.toString(),
        courseTitle: course.title,
      },
    };

    let order;
    try {
      order = await instance.orders.create(options);
    } catch (rzpErr) {
      console.error("Razorpay order creation failed:", rzpErr?.error?.description || rzpErr?.message || rzpErr);
      return res.status(502).json({
        message: `Payment gateway error: ${rzpErr?.error?.description || rzpErr?.message || "Could not create order."}`,
      });
    }

    // Record created payment in database
    await Payment.create({
      student: studentId,
      course: courseId,
      razorpayOrderId: order.id,
      amount: course.price,
      currency: "INR",
      status: "created",
    });

    res.status(200).json({
      success: true,
      keyId: key_id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title,
      courseDescription: course.description,
    });
  } catch (error) {
    console.error("Payment Order Creation Error:", error);
    res.status(500).json({
      message: error.message || "Failed to create payment order",
    });
  }
};

// Verify Payment & Auto Enroll
exports.verifyPayment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res
        .status(400)
        .json({ message: "Missing required payment details (order_id, payment_id, signature, courseId are all required)" });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      return res.status(500).json({ message: "Payment verification unavailable. Server misconfigured." });
    }

    // Verify HMAC SHA256 signature (mandatory per Razorpay docs)
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Invalid payment signature. Verification failed." });
    }

    // Update payment record in database
    let payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (payment) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "paid";
      await payment.save();
    } else {
      const course = await Course.findById(courseId);
      payment = await Payment.create({
        student: studentId,
        course: courseId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: course ? course.price : 0,
        currency: "INR",
        status: "paid",
      });
    }

    // Check or create enrollment
    let enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified & course enrolled successfully!",
      enrollment,
      payment,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      message: error.message || "Payment verification failed",
    });
  }
};

// Get Payment History for Logged-In Student
exports.getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const payments = await Payment.find({ student: studentId })
      .populate("course")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch payment history",
    });
  }
};
