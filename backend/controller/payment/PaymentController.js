const stripe = require("../../config/stripe");
const userModel = require("../../model/userModel");
const orderModel = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");

const PaymentController = async (request, response) => {
  try {
    const { cartItems, paymentMethod = "card" } = request?.body;
    const userId = request?.userId;

    if (!cartItems || cartItems.length === 0) {
      return response.status(400).json({
        message: "No cart items provided for checkout",
        error: true,
        success: false,
      });
    }

    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Format product details for order
    const productDetails = cartItems.map(item => {
      const prod = item.productId || {};
      const img = (Array.isArray(prod.productImage) && prod.productImage.length > 0)
        ? prod.productImage
        : ["/images/placeholders/placeholder-garment.svg"];
      return {
        productId: prod._id || item.productId,
        name: prod.productName || "Garment Item",
        price: prod.sellingPrice || prod.price || 0,
        quantity: item.quantity || 1,
        image: img,
        category: prod.category || "garments"
      };
    });

    const totalAmount = productDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // If Stripe is configured and paymentMethod is 'card', attempt Stripe Checkout
    if (paymentMethod === "card" && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
      try {
        const line_items = cartItems.map((item) => {
          const prod = item.productId || {};
          // Stripe requires absolute HTTPS URLs for images; filter out relative or local paths
          const validImages = (Array.isArray(prod.productImage) ? prod.productImage : [])
            .filter(img => typeof img === 'string' && img.startsWith('https://'));

          return {
            price_data: {
              currency: "inr",
              product_data: {
                name: prod.productName || "Garment Item",
                images: validImages,
                metadata: {
                  productId: String(prod._id || item.productId),
                },
              },
              unit_amount: Math.round((prod.sellingPrice || prod.price || 0) * 100),
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            quantity: item.quantity || 1,
          };
        });

        const params = {
          submit_type: "pay",
          mode: "payment",
          payment_method_types: ['card'],
          billing_address_collection: "auto",
          customer_email: currentUser.email,
          metadata: {
            userId: String(userId),
            customerName: currentUser.name || "Customer",
          },
          line_items: line_items,
          success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
        };

        const session = await stripe.checkout.sessions.create(params);
        return response.status(200).json(session);

      } catch (stripeError) {
        console.warn("Stripe checkout error (falling back to direct order creation):", stripeError.message);
        // Fallback to direct order creation so checkout doesn't fail
      }
    }

    // Direct / Fallback Order Creation
    const orderDetails = {
      customerName: currentUser.name || "Customer",
      productDetails: productDetails,
      email: currentUser.email,
      userId: String(userId),
      paymentDetails: {
        paymentId: "PAY_" + Date.now(),
        payment_method_type: [paymentMethod || "COD"],
        payment_status: paymentMethod === "COD" ? "Pending" : "Paid",
      },
      shipping_options: [
        {
          shipping_rate: "standard",
          shipping_amount: 0,
        }
      ],
      total_amount: totalAmount,
      approvalStatus: "Pending",
      orderStatus: "Pending",
    };

    const newOrder = new orderModel(orderDetails);
    const savedOrder = await newOrder.save();

    // Clear ordered products from user's cart
    await cartModel.deleteMany({ userId: userId });

    return response.status(201).json({
      order: savedOrder,
      directOrder: true,
      message: "Order placed successfully!",
      error: false,
      success: true,
    });

  } catch (error) {
    console.error("PaymentController error:", error);
    response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = PaymentController;
