import React, { useEffect, useState } from "react";
import SummaryApi from "../../common/API";
import displayINRCurrency from "../../helpers/displayCurrency";
import { getProductImage, handleImageError } from "../../helpers/productImageHelper";
import moment from "moment";
import {
  FaBox,
  FaTruck,
  FaCheckDouble,
  FaClock,
  FaSearch,
  FaCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";

const ORDER_STEPS = ["Pending", "Packed", "Shipping", "Delivered"];

const AdminOrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAcceptedOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.adminAcceptedOrders.url, {
        method: SummaryApi.adminAcceptedOrders.method,
        credentials: "include",
      });
      const data = await response.json();
      if (data?.success) {
        setOrders(data?.data || []);
      } else {
        toast.error(data?.message || "Failed to fetch accepted orders from MongoDB Atlas.");
      }
    } catch (err) {
      console.error("Fetch accepted orders error:", err);
      toast.error("Network error while connecting to MongoDB Atlas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${SummaryApi.adminUpdateStatus.url}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await response.json();
      if (data?.success) {
        toast.success(`Fulfillment status updated to '${newStatus}' in MongoDB Atlas!`);
        // Update local state directly with MongoDB Atlas returned document
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.data : o))
        );
      } else {
        toast.error(data?.message || "Failed to update fulfillment status.");
      }
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Error communicating with MongoDB Atlas.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by fulfillment status and search
  const filteredOrders = orders.filter((order) => {
    const currentStatus = order?.orderStatus || "Pending";
    const matchesFilter =
      statusFilter === "ALL" ||
      currentStatus.toLowerCase() === statusFilter.toLowerCase();

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (order?._id || "").toLowerCase().includes(query) ||
      (order?.customerName || "").toLowerCase().includes(query) ||
      (order?.email || "").toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const getStepIndex = (status) => {
    const idx = ORDER_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Order Fulfillment & Live Tracking</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              MongoDB Atlas Live
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track and advance fulfillment status for accepted orders. Updates immediately reflect in customer tracking.
          </p>
        </div>

        <button
          onClick={fetchAcceptedOrders}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
        >
          Refresh Orders
        </button>
      </div>

      {/* Fulfillment Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending Processing", status: "Pending", icon: <FaClock />, color: "amber" },
          { label: "Packed & Ready", status: "Packed", icon: <FaBox />, color: "blue" },
          { label: "Out for Shipping", status: "Shipping", icon: <FaTruck />, color: "purple" },
          { label: "Delivered", status: "Delivered", icon: <FaCheckDouble />, color: "emerald" },
        ].map((item) => {
          const count = orders.filter((o) => (o.orderStatus || "Pending") === item.status).length;
          return (
            <div
              key={item.status}
              onClick={() => setStatusFilter(item.status)}
              className={`bg-white p-4 rounded-xl border cursor-pointer transition shadow-sm hover:shadow ${
                statusFilter === item.status ? "ring-2 ring-blue-500 border-blue-400" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{count}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                    item.color === "amber"
                      ? "bg-amber-50 text-amber-600"
                      : item.color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : item.color === "purple"
                      ? "bg-purple-50 text-purple-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-slate-200/80 p-1 rounded-lg overflow-x-auto">
          {[
            { label: "All Accepted", value: "ALL", count: orders.length },
            { label: "Pending", value: "Pending", count: orders.filter((o) => (o.orderStatus || "Pending") === "Pending").length },
            { label: "Packed", value: "Packed", count: orders.filter((o) => o.orderStatus === "Packed").length },
            { label: "Shipping", value: "Shipping", count: orders.filter((o) => o.orderStatus === "Shipping").length },
            { label: "Delivered", value: "Delivered", count: orders.filter((o) => o.orderStatus === "Delivered").length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition ${
                statusFilter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-3 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search order ID, customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-48" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <FaBox className="mx-auto text-5xl text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No accepted orders found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {orders.length === 0
              ? "When you accept customer orders in the 'My Orders' module, they will appear here for fulfillment."
              : "No orders match the selected status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const currentStatus = order.orderStatus || "Pending";
            const currentStepIdx = getStepIndex(currentStatus);
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-800 mr-3">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      Customer: <strong className="text-slate-700">{order.customerName || "Customer"}</strong> ({order.email})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Last Updated: {moment(order.updatedAt).format("MMM D, h:mm A")}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Approved
                    </span>
                  </div>
                </div>

                {/* Tracking Stepper Bar */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-50/50 to-white border-b border-slate-100">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {ORDER_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(order._id, step)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                                isCompleted
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : isCurrent
                                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                  : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                              }`}
                              title={`Set status to ${step}`}
                            >
                              {isCompleted ? <FaCheck size={12} /> : idx + 1}
                            </button>
                            <span
                              className={`text-xs mt-1.5 font-semibold ${
                                isCurrent
                                  ? "text-blue-600 font-bold"
                                  : isCompleted
                                  ? "text-emerald-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {step}
                            </span>
                          </div>

                          {idx < ORDER_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-2 rounded transition ${
                                idx < currentStepIdx ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Content & Actions */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Items summary */}
                    <div className="flex flex-wrap items-center gap-3">
                      {order.productDetails?.slice(0, 4).map((prod, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <img
                            src={getProductImage(prod, 0)}
                            onError={(e) => handleImageError(e, prod.category)}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                          <div className="text-xs">
                            <p className="font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Qty: {prod.quantity} • {displayINRCurrency(prod.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(order.productDetails?.length || 0) > 4 && (
                        <span className="text-xs text-slate-400 font-semibold">
                          +{order.productDetails.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Quick status selector & total */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-500">Order Total</p>
                        <p className="text-lg font-bold text-red-600">
                          {displayINRCurrency(order.total_amount)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                          Update Status:
                        </label>
                        <select
                          disabled={isUpdating}
                          value={currentStatus}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {ORDER_STEPS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrderStatus;
