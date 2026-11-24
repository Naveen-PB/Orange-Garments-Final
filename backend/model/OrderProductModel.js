const mongoose = require("mongoose");

const OrderProductSchema = new mongoose.Schema({
  customerName: {
    type: String,
    default: "",
    trim: true,
  },
  email: {
    type: String,
    default: "",
    trim: true,
  },
  userId: {
    type: String,
    default: "",
  },
  productDetails: {
    type: Array,
    default: [],
  },
  paymentDetails: {
    paymentId: {
      type: String,
      default: "",
    },
    payment_method_type: {
      type: Array,
      default: ["COD"],
    },
    payment_status: {
      type: String,
      default: "Paid",
    }
  },
  shipping_options: {
    type: Array,
    default: [],
  },
  total_amount: {
    type: Number,
    default: 0,
  },
  approvalStatus: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Packed", "Shipping", "Delivered", "Cancelled"],
    default: "Pending",
  }
}, {
  timestamps: true
});

const orderModel = mongoose.model("order", OrderProductSchema);

module.exports = orderModel;
