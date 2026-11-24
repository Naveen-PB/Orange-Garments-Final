const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    required: true,
    type: String,
    trim: true,
  },
  brandName: {
    required: true,
    type: String,
    trim: true,
  },
  category: {
    required: true,
    type: String,
    trim: true,
  },
  productImage: {
    type: [String],
    default: [],
  },
  productDesc: {
    type: String,
    default: "",
  },
  price: {
    required: true,
    type: Number,
  },
  sellingPrice: {
    required: true,
    type: Number,
  }
}, {
  timestamps: true
});

const productModel = mongoose.model('product', productSchema);

module.exports = productModel;
