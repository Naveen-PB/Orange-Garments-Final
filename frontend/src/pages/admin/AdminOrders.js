import React, { useEffect, useState } from "react";
import SummaryApi from "../../common/API";
import displayINRCurrency from "../../helpers/displayCurrency";
import { getProductImage, handleImageError } from "../../helpers/productImageHelper";
import moment from "moment";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaShoppingBag,
  FaUser,
  FaEnvelope,
  FaReceipt,
} from "react-icons/fa";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.adminOrders.url, {
        method: SummaryApi.adminOrders.method,
        credentials: "include",
      });
      const data = await response.json();
      if (data?.success) {
        setOrders(data?.data || []);
      } else {
        toast.error(data?.message || "Failed to fetch orders from MongoDB Atlas.");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Network error while connecting to MongoDB Atlas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApproval = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${SummaryApi.adminUpdateApproval.url}/${orderId}/approval`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ approvalStatus: status }),
      });

      const data = await response.json();
      if (data?.success) {
        toast.success(`Order successfully marked as ${status} in MongoDB Atlas!`);
        // Update local state directly with MongoDB Atlas result
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.data : o))
        );
      } else {
        toast.error(data?.message || "Failed to update order approval status.");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Error communicating with MongoDB Atlas.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by active tab and search query
  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === "ALL" ||
      (order?.approvalStatus || "Pending").toLowerCase() === activeTab.toLowerCase();

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (order?._id || "").toLowerCase().includes(query) ||
      (order?.customerName || "").toLowerCase().includes(query) ||
      (order?.email || "").toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const pendingCount = orders.filter((o) => (o.approvalStatus || "Pending") === "Pending").length;
  const acceptedCount = orders.filter((o) => o.approvalStatus === "Accepted").length;
  const rejectedCount = orders.filter((o) => o.approvalStatus === "Rejected").length;

  return (
    <div className="p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Customer Orders & Approvals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              MongoDB Atlas Live
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review placed orders, view customer details, and persist Accept / Reject decisions in MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
        >
          Refresh Orders
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{orders.length}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FaReceipt />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Approvals</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <FaClock />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Accepted Orders</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{acceptedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Rejected Orders</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <FaTimesCircle />
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-slate-200/80 p-1 rounded-lg">
          {[
            { label: "All Orders", value: "ALL", count: orders.length },
            { label: "Pending", value: "Pending", count: pendingCount },
            { label: "Accepted", value: "Accepted", count: acceptedCount },
            { label: "Rejected", value: "Rejected", count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition ${
                activeTab === tab.value
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
            placeholder="Search by ID, customer, email..."
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
          <FaShoppingBag className="mx-auto text-5xl text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No orders found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery || activeTab !== "ALL"
              ? "Try adjusting your search query or tab filter."
              : "Customer checkout orders placed on the storefront will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const currentApproval = order.approvalStatus || "Pending";
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {moment(order.createdAt).format("MMM D, YYYY • h:mm A")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        currentApproval === "Accepted"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : currentApproval === "Rejected"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      Approval: {currentApproval}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                      Status: {order.orderStatus || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Customer Details
                      </h4>
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <FaUser className="text-slate-400 text-xs" />
                        {order.customerName || "Customer"}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <FaEnvelope className="text-slate-400 text-xs" />
                        {order.email || "N/A"}
                      </p>
                      <p className="text-xs text-slate-400">
                        User ID: {order.userId || "Guest"}
                      </p>

                      <div className="pt-3 mt-3 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Payment Info
                        </h4>
                        <p className="text-xs text-slate-700">
                          Method:{" "}
                          <span className="font-semibold uppercase">
                            {(order.paymentDetails?.payment_method_type || [])[0] || "COD"}
                          </span>
                        </p>
                        <p className="text-xs text-slate-700">
                          Payment Status:{" "}
                          <span className="font-semibold text-emerald-600">
                            {order.paymentDetails?.payment_status || "Paid"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Ordered Items ({order.productDetails?.length || 0})
                      </h4>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {order.productDetails?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                                <img
                                  src={getProductImage(item, 0)}
                                  onError={(e) => handleImageError(e, item.category)}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-xs">
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-slate-500 capitalize">
                                  Category: {item.category || "Garment"} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-slate-800 text-xs">
                                {displayINRCurrency(item.price * item.quantity)}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {displayINRCurrency(item.price)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Amount & Action Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Grand Total Amount</p>
                          <p className="text-xl font-extrabold text-red-600">
                            {displayINRCurrency(order.total_amount)}
                          </p>
                        </div>

                        {/* Approval Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleApproval(order._id, "Accepted")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                              currentApproval === "Accepted"
                                ? "bg-emerald-600 text-white cursor-default"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            } disabled:opacity-50`}
                          >
                            <FaCheckCircle />
                            {currentApproval === "Accepted" ? "Approved" : "Accept Order"}
                          </button>

                          <button
                            disabled={isUpdating}
                            onClick={() => handleApproval(order._id, "Rejected")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                              currentApproval === "Rejected"
                                ? "bg-rose-600 text-white cursor-default"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                            } disabled:opacity-50`}
                          >
                            <FaTimesCircle />
                            {currentApproval === "Rejected" ? "Rejected" : "Reject Order"}
                          </button>
                        </div>
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

export default AdminOrders;
