const orderModel = require("../../model/OrderProductModel");
const userModel = require("../../model/userModel");
const uploadProductPermission = require("../../helpers/permission");

// Helper to verify admin permissions
const verifyAdmin = async (userId) => {
  if (!userId) return false;
  const user = await userModel.findById(userId);
  return user?.role === "ADMIN";
};

/**
 * Fetch all customer orders directly from MongoDB Atlas Orders collection.
 * Includes customer details, product items, pricing, approval status, order status, and timestamps.
 */
const getAllOrders = async (req, res) => {
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

    const { approvalStatus, orderStatus, search } = req.query;
    let query = {};

    if (approvalStatus && approvalStatus !== "ALL") {
      query.approvalStatus = approvalStatus;
    }

    if (orderStatus && orderStatus !== "ALL") {
      query.orderStatus = orderStatus;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { customerName: searchRegex },
        { email: searchRegex },
        { "_id": search.trim().length === 24 ? search.trim() : null },
      ].filter(item => item !== null && Object.values(item)[0] !== null);
    }

    const orders = await orderModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      data: orders,
      count: orders.length,
      message: "Customer orders fetched successfully from MongoDB Atlas.",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

/**
 * Fetch only Accepted customer orders for the "Order Status" fulfillment tracking module.
 */
const getAcceptedOrders = async (req, res) => {
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

    const { orderStatus } = req.query;
    let query = { approvalStatus: "Accepted" };

    if (orderStatus && orderStatus !== "ALL") {
      query.orderStatus = orderStatus;
    }

    const orders = await orderModel.find(query).sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      data: orders,
      count: orders.length,
      message: "Accepted customer orders fetched successfully from MongoDB Atlas.",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

/**
 * Update Order Approval Status ("Accept" or "Reject") directly in MongoDB Atlas.
 */
const updateOrderApproval = async (req, res) => {
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

    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!["Accepted", "Rejected", "Pending"].includes(approvalStatus)) {
      return res.status(400).json({
        message: "Invalid approval status. Must be 'Accepted', 'Rejected', or 'Pending'.",
        error: true,
        success: false,
      });
    }

    const updateFields = { approvalStatus };
    if (approvalStatus === "Rejected") {
      updateFields.orderStatus = "Cancelled";
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found in database.",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      data: updatedOrder,
      message: `Order approval status successfully updated to '${approvalStatus}' in MongoDB Atlas.`,
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

/**
 * Update Order Fulfillment Status ("Pending", "Packed", "Shipping", "Delivered") directly in MongoDB Atlas.
 */
const updateOrderStatus = async (req, res) => {
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

    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = ["Pending", "Packed", "Shipping", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid order status. Allowed values: ${allowedStatuses.join(", ")}`,
        error: true,
        success: false,
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      { $set: { orderStatus } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found in database.",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      data: updatedOrder,
      message: `Order fulfillment status updated to '${orderStatus}' in MongoDB Atlas.`,
      error: false,
      success: true,
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
  getAllOrders,
  getAcceptedOrders,
  updateOrderApproval,
  updateOrderStatus,
};
