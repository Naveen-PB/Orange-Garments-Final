const stripe = require("../../config/stripe");
const cartModel = require("../../model/Cart");
const orderModel = require("../../model/OrderProductModel");

const endpointSecret = process.env.STRIPE_WEBHOOK_END_POINTS_SECRET;

const webHooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const payloadString = JSON.stringify(req.body);
  
  let event;
  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(payloadString, sig, endpointSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const getLineItems = async (lineItems) => {
    let productItems = [];
    if (lineItems?.data?.length) {
      for (const item of lineItems.data) {
        let productId = "";
        let productName = item.description || "Garment Product";
        let images = [];

        try {
          if (item.price?.product) {
            const product = await stripe.products.retrieve(item.price.product);
            productId = product.metadata?.productId || "";
            productName = product.name || productName;
            images = product.images || [];
          }
        } catch (e) {
          // ignore Stripe product retrieval errors
        }

        const productData = {
          productId: productId,
          name: productName,
          price: (item.price?.unit_amount || 0) / 100,
          quantity: item.quantity,
          image: images.length > 0 ? images : ["/images/placeholders/placeholder-garment.svg"],
        };
        productItems.push(productData);
      }
    }
    return productItems;
  };

  const deleteCartProduct = async (productId, userId) => {
    try {
      await cartModel.findOneAndDelete({ productId: productId, userId: userId });
    } catch (e) {
      console.error("Error clearing cart item:", e.message);
    }
  };

  switch (event?.type) {
    case "checkout.session.completed":
      try {
        const session = event.data.object;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const productDetails = await getLineItems(lineItems);
        
        const orderDetails = {
          customerName: session.customer_details?.name || session.metadata?.customerName || "Customer",
          productDetails: productDetails,
          email: session.customer_email || session.customer_details?.email,
          userId: session.metadata?.userId || "",
          paymentDetails: {
            paymentId: session.payment_intent,
            payment_method_type: session.payment_method_types || ["card"],
            payment_status: session.payment_status || "Paid",
          },
          shipping_options: session.shipping_options || [],
          total_amount: (session.amount_total || 0) / 100,
          approvalStatus: "Pending",
          orderStatus: "Pending",
        };

        const order = new orderModel(orderDetails);
        const saveOrder = await order.save();

        if (saveOrder && session.metadata?.userId) {
          await cartModel.deleteMany({ userId: session.metadata.userId });
        }
      } catch (err) {
        console.error("Webhook processing error:", err.message);
      }
      break;
    default:
      console.log(`Unhandled webhook event type: ${event?.type}`);
  }

  res.status(200).json({ received: true });
};

module.exports = webHooks;
