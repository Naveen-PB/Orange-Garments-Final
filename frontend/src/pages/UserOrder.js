import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import emptyBox from "../assest/empty_order.gif";
import { Link } from "react-router-dom";
import moment from "moment";
import displayINRCurrency from "../helpers/displayCurrency";
import { getProductImage, handleImageError } from "../helpers/productImageHelper";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCheck,
  FaShoppingBag,
} from "react-icons/fa";

const TRACKING_STEPS = [
  { key: "Pending", label: "Order Placed", desc: "Confirmed in system" },
  { key: "Packed", label: "Packed", desc: "Ready for courier" },
  { key: "Shipping", label: "Out for Delivery", desc: "On the way" },
  { key: "Delivered", label: "Delivered", desc: "Package received" },
];

const UserOrder = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.getOrderData.url, {
        method: SummaryApi.getOrderData.method,
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setOrderData(data.data || []);
      }
    } catch (err) {
      console.error("Fetch customer orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStepIndex = (status) => {
    const idx = TRACKING_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b pb-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Orders & Live Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fulfillment tracking directly updated from our central warehouse.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
        >
          Refresh Tracking
        </button>
      </div>

      {/* Loading State */}
      {loading && orderData.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* For User having 0 orders */}
      {!loading && orderData.length === 0 && (
        <div className="flex justify-center items-center gap-3 flex-col my-12 bg-white p-8 rounded-xl border border-slate-200 text-center">
          <img
            src={emptyBox}
            width={240}
            height={240}
            className="rounded mix-blend-multiply"
            alt="No Orders Yet"
          />
          <h3 className="text-lg font-bold text-slate-700 mt-2">No orders placed yet</h3>
          <p className="text-slate-500 text-sm max-w-md">
            Looks like you have not placed any orders yet. Explore our latest garment collections and start shopping!
          </p>
          <Link to={"/"} className="mt-4">
            <button className="bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold px-8 py-2.5 shadow transition">
              Explore Products
            </button>
          </Link>
        </div>
      )}

      {/* Orders List with Live Tracking */}
      <div className="space-y-6">
        {orderData.map((order, orderIdx) => {
          const approval = order.approvalStatus || "Pending";
          const fulfillmentStatus = order.orderStatus || "Pending";
          const currentStep = getStepIndex(fulfillmentStatus);
          const isRejected = approval === "Rejected" || fulfillmentStatus === "Cancelled";

          return (
            <div
              key={order._id || orderIdx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Order Top Summary */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-800">
                      Order #{order._id?.slice(-8).toUpperCase() || orderIdx + 1}
                    </span>
                    <span className="text-xs text-slate-500">
                      • Placed on {moment(order.createdAt).format("MMMM D, YYYY [at] h:mm A")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Approval Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      approval === "Accepted"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : approval === "Rejected"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    Approval: {approval}
                  </span>

                  {/* Fulfillment Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      fulfillmentStatus === "Delivered"
                        ? "bg-emerald-500 text-white"
                        : fulfillmentStatus === "Shipping"
                        ? "bg-purple-600 text-white"
                        : fulfillmentStatus === "Packed"
                        ? "bg-blue-600 text-white"
                        : isRejected
                        ? "bg-slate-400 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {fulfillmentStatus}
                  </span>
                </div>
              </div>

              {/* Live Order Tracking Stepper */}
              {!isRejected && (
                <div className="px-6 py-5 bg-gradient-to-r from-blue-50/40 via-white to-slate-50/40 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Live Shipment Tracking
                  </p>
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {TRACKING_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                                isCompleted
                                  ? "bg-emerald-600 text-white"
                                  : isCurrent
                                  ? "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse"
                                  : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {isCompleted ? <FaCheck size={12} /> : idx + 1}
                            </div>
                            <span
                              className={`text-xs mt-1.5 font-semibold ${
                                isCurrent
                                  ? "text-blue-600 font-bold"
                                  : isCompleted
                                  ? "text-emerald-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:block">
                              {step.desc}
                            </span>
                          </div>

                          {idx < TRACKING_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-2 rounded transition ${
                                idx < currentStep ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancellation Notice */}
              {isRejected && (
                <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 text-xs text-rose-700 flex items-center gap-2">
                  <FaTimesCircle className="text-rose-500 text-base shrink-0" />
                  <span>
                    This order has been cancelled or rejected. If you have questions, please reach out to customer support.
                  </span>
                </div>
              )}

              {/* Items List */}
              <div className="p-6">
                <div className="grid gap-3">
                  {order.productDetails?.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <Link
                        to={`/product/${product?.productId}`}
                        className="flex items-center gap-4 hover:opacity-90 transition"
                      >
                        <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={getProductImage(product, 0)}
                            onError={(e) => handleImageError(e, product?.category)}
                            className="w-full h-full object-contain mix-blend-multiply"
                            alt={product?.name || "Garment product"}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            Category: {product.category || "Garment"} • Quantity: {product.quantity}
                          </p>
                        </div>
                      </Link>

                      <div className="text-right">
                        <p className="font-bold text-red-600 text-sm">
                          {displayINRCurrency(product.price * product.quantity)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {displayINRCurrency(product.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Payment & Grand Total Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="space-y-1">
                    <p>
                      Payment Method:{" "}
                      <span className="font-semibold text-slate-800 uppercase">
                        {(order.paymentDetails?.payment_method_type || [])[0] || "COD"}
                      </span>
                    </p>
                    <p>
                      Payment Status:{" "}
                      <span className="font-semibold text-emerald-600">
                        {order.paymentDetails?.payment_status || "Paid"}
                      </span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-slate-500 font-medium">Grand Total:</span>
                    <span className="text-xl font-extrabold text-red-600 ml-2">
                      {displayINRCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrder;
