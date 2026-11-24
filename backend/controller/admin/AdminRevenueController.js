const orderModel = require("../../model/OrderProductModel");
const userModel = require("../../model/userModel");

// Helper to verify admin permissions
const verifyAdmin = async (userId) => {
  if (!userId) return false;
  const user = await userModel.findById(userId);
  return user?.role === "ADMIN";
};

/**
 * Dynamically aggregate and calculate revenue metrics, order counts,
 * items sold, and sales reports directly from the MongoDB Atlas Orders collection.
 * Supports optional date-range filtering with fromDate and toDate.
 */
const getRevenueMetrics = async (req, res) => {
  try {
    const sessionUserId = req.userId;
    const isAdmin = await verifyAdmin(sessionUserId);
    if (!isAdmin) {
      return res.status(403).json({
        message: "Permission denied! Admin access required.",
        error: true,
        success: false,
      });
    }

    const { fromDate, toDate } = req.query;
    let dateFilter = {};

    if (fromDate && fromDate.trim() !== "") {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.$gte = start;
    }

    if (toDate && toDate.trim() !== "") {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    let query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // Fetch orders matching date filter directly from MongoDB Atlas
    const orders = await orderModel.find(query).sort({ createdAt: -1 });

    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let pendingRevenue = 0;
    let totalItemsSold = 0;
    let acceptedOrdersCount = 0;
    let pendingOrdersCount = 0;
    let rejectedOrdersCount = 0;
    let deliveredOrdersCount = 0;

    const categoryBreakdown = {};
    const salesReport = [];

    orders.forEach((order) => {
      const isAccepted = order.approvalStatus === "Accepted";
      const isPending = order.approvalStatus === "Pending";
      const isRejected = order.approvalStatus === "Rejected";
      const isDelivered = order.orderStatus === "Delivered";

      if (isAccepted) acceptedOrdersCount++;
      if (isPending) pendingOrdersCount++;
      if (isRejected) rejectedOrdersCount++;
      if (isDelivered) deliveredOrdersCount++;

      // Count revenue for valid orders (Accepted or Delivered or Paid without rejection)
      const orderAmount = Number(order.total_amount) || 0;
      if (!isRejected) {
        totalRevenue += orderAmount;
      }
      if (isDelivered) {
        deliveredRevenue += orderAmount;
      }
      if (isPending) {
        pendingRevenue += orderAmount;
      }

      // Calculate items sold and categories for non-rejected orders
      let orderItemsCount = 0;
      const productNames = [];

      if (Array.isArray(order.productDetails)) {
        order.productDetails.forEach((prod) => {
          const qty = Number(prod.quantity) || 1;
          const cat = (prod.category || "garments").toLowerCase();
          const itemPrice = Number(prod.price) || 0;

          if (!isRejected) {
            totalItemsSold += qty;

            if (!categoryBreakdown[cat]) {
              categoryBreakdown[cat] = {
                category: cat,
                unitsSold: 0,
                revenue: 0,
              };
            }
            categoryBreakdown[cat].unitsSold += qty;
            categoryBreakdown[cat].revenue += itemPrice * qty;
          }

          orderItemsCount += qty;
          if (prod.name) {
            productNames.push(`${prod.name} (x${qty})`);
          }
        });
      }

      // Format row for sales report
      salesReport.push({
        orderId: order._id,
        createdAt: order.createdAt,
        customerName: order.customerName || "Customer",
        customerEmail: order.email || "N/A",
        totalItems: orderItemsCount,
        itemNames: productNames.join(", "),
        totalAmount: orderAmount,
        paymentStatus: order.paymentDetails?.payment_status || "N/A",
        paymentMethod: (order.paymentDetails?.payment_method_type || [])[0] || "COD",
        approvalStatus: order.approvalStatus || "Pending",
        orderStatus: order.orderStatus || "Pending",
      });
    });

    res.status(200).json({
      success: true,
      error: false,
      message: "Revenue analytics dynamically aggregated from MongoDB Atlas.",
      data: {
        summary: {
          totalOrders: orders.length,
          acceptedOrdersCount,
          completedOrdersCount: deliveredOrdersCount,
          pendingOrdersCount,
          rejectedOrdersCount,
          totalRevenue,
          deliveredRevenue,
          pendingRevenue,
          totalItemsSold,
        },
        categoryBreakdown: Object.values(categoryBreakdown),
        salesReport,
        filter: {
          fromDate: fromDate || null,
          toDate: toDate || null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = {
  getRevenueMetrics,
};
