const express = require('express');

const router = express.Router();

const userSignUpController = require('../controller/user/userSignUp');
const userSignInController = require('../controller/user/userSIgnIn');
const authToken = require('../middleware/AuthToken');
const userDetailController = require('../controller/user/UserDetail');
const UserLogout = require('../controller/user/UserLogout');
const allUsers = require('../controller/user/AllUsers');
const UpdateuserRole = require('../controller/user/UpdateUserRole');
const UploadProductController = require('../controller/product/UploadProduct');
const GetProductController = require('../controller/product/GetProduct');
const UpdateProductController = require('../controller/product/UpdateProduct');
const GetSingleCategoryProductController = require('../controller/product/GetSingleCategoryProduct');
const getCategoryWiseProductController = require('../controller/product/GetCategoryWiseProduct');
const GetSingleProductController = require('../controller/product/GetSingleProduct');
const CartController = require('../controller/user/CartController');
const CountCartProductController = require('../controller/user/CountCartProduct');
const UpdatePlusCartQuantityController = require('../controller/user/UpdatePlusCartQuantity');
const DeleteCartProductController = require('../controller/user/DeleteCartProduct');
const SearchProductController = require('../controller/product/SearchProduct');
const FilterProductController = require('../controller/product/FilterProduct');
const wishListController = require('../controller/user/AddToWishList');
const GetWishListController = require('../controller/user/GetWishList');
const CountAddToWishListProductController = require('../controller/user/CountAddToWishListProduct');
const DeleteWishlistProductController = require('../controller/user/DeleteWishlistProduct');
const Updateuser = require('../controller/user/UpdateUser');
const OtpController = require('../controller/OTP/OtpController');
const VerifyOtpController = require('../controller/OTP/VerifyOtpController');
const ResetPasswordController = require('../controller/user/ResetPasswordController');
const PaymentController = require('../controller/payment/PaymentController');
const webHooks = require('../controller/order/WebHook');
const GetOderDetails = require('../controller/order/GetOrderDetails');
const DeleteProductController = require('../controller/product/DeleteProduct');
const {
  getAllOrders,
  getAcceptedOrders,
  updateOrderApproval,
  updateOrderStatus,
} = require('../controller/admin/AdminOrdersController');
const { getRevenueMetrics } = require('../controller/admin/AdminRevenueController');

// User Authentication
router.post("/signup", userSignUpController);
router.post("/signin", userSignInController);
router.get("/user-details", authToken, userDetailController);
router.get("/logout", UserLogout);

// Admin Panel
router.get("/all-users", authToken, allUsers);
router.put("/update-role/:id", authToken, UpdateuserRole);

// Products Catalog
router.post("/upload-product", authToken, UploadProductController);
router.get("/get-product", GetProductController);
router.get("/all-products", GetProductController);
router.put("/update-product", authToken, UpdateProductController);
router.delete("/delete-product/:id", authToken, DeleteProductController);
router.post("/delete-product", authToken, DeleteProductController);
router.delete("/admin/products/:id", authToken, DeleteProductController);
router.get("/get-category-product", GetSingleCategoryProductController);
router.get("/get-category-wise-product/:category", getCategoryWiseProductController);
router.get("/get-single-product-details/:id", GetSingleProductController);
router.get("/search-product", SearchProductController);
router.post("/fiter-product", FilterProductController);

// Admin Dedicated API Endpoints
router.get("/admin/orders", authToken, getAllOrders);
router.get("/admin/orders/accepted", authToken, getAcceptedOrders);
router.put("/admin/orders/:id/approval", authToken, updateOrderApproval);
router.put("/admin/orders/:id/status", authToken, updateOrderStatus);
router.get("/admin/revenue", authToken, getRevenueMetrics);

// User Cart
router.post("/add-to-cart", authToken, CartController);
router.get("/count-cart-product", authToken, CountCartProductController);
router.get("/count-cart-product/:id", authToken, CountCartProductController);
router.post("/update-cart-quantity", authToken, UpdatePlusCartQuantityController);
router.post("/delete-cart-product", authToken, DeleteCartProductController);
router.put("/update-user", authToken, Updateuser);

// User Wishlist
router.post("/add-to-wishlist", authToken, wishListController);
router.get("/get-wishlist", authToken, GetWishListController);
router.get("/get-wishlist-count", authToken, CountAddToWishListProductController);
router.post("/delete-wishlist-product", authToken, DeleteWishlistProductController);

// Password Reset / OTP
router.post("/send-otp", OtpController);
router.post("/verify-otp", VerifyOtpController);
router.post("/reset-password", ResetPasswordController);

// Payment & Orders
router.post("/checkout", authToken, PaymentController);
router.post("/create-order", authToken, PaymentController);
router.post("/webhook", webHooks);
router.get("/get-order-details", authToken, GetOderDetails);

module.exports = router;
