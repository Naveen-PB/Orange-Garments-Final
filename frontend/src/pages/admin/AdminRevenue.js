import React, { useEffect, useState } from "react";
import SummaryApi from "../../common/API";
import displayINRCurrency from "../../helpers/displayCurrency";
import moment from "moment";
import {
  FaChartLine,
  FaFileDownload,
  FaCalendarAlt,
  FaCheckCircle,
  FaTshirt,
  FaFilter,
  FaRedo,
  FaPrint,
} from "react-icons/fa";
import { toast } from "react-toastify";

const AdminRevenue = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("ALL");

  const fetchRevenue = async (start = fromDate, end = toDate) => {
    setLoading(true);
    try {
      let queryParams = [];
      if (start) queryParams.push(`fromDate=${encodeURIComponent(start)}`);
      if (end) queryParams.push(`toDate=${encodeURIComponent(end)}`);
      const queryStr = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

      const response = await fetch(`${SummaryApi.adminRevenue.url}${queryStr}`, {
        method: SummaryApi.adminRevenue.method,
        credentials: "include",
      });

      const data = await response.json();
      if (data?.success) {
        setRevenueData(data.data);
      } else {
        toast.error(data?.message || "Failed to fetch revenue analytics from MongoDB Atlas.");
      }
    } catch (err) {
      console.error("Revenue fetch error:", err);
      toast.error("Error connecting to MongoDB Atlas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const handleApplyPreset = (preset) => {
    setSelectedPreset(preset);
    let start = "";
    let end = "";

    const today = moment().format("YYYY-MM-DD");

    if (preset === "TODAY") {
      start = today;
      end = today;
    } else if (preset === "LAST_7_DAYS") {
      start = moment().subtract(6, "days").format("YYYY-MM-DD");
      end = today;
    } else if (preset === "THIS_MONTH") {
      start = moment().startOf("month").format("YYYY-MM-DD");
      end = today;
    } else if (preset === "ALL") {
      start = "";
      end = "";
    }

    setFromDate(start);
    setToDate(end);
    fetchRevenue(start, end);
  };

  const handleCustomFilter = (e) => {
    e.preventDefault();
    setSelectedPreset("CUSTOM");
    fetchRevenue(fromDate, toDate);
  };

  const handleResetFilter = () => {
    setSelectedPreset("ALL");
    setFromDate("");
    setToDate("");
    fetchRevenue("", "");
  };

  const exportToCSV = () => {
    const report = revenueData?.salesReport || [];
    if (report.length === 0) {
      toast.info("No sales records available to export for this date range.");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Items Count",
      "Ordered Products",
      "Total Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Approval Status",
      "Fulfillment Status",
    ];

    const rows = report.map((row) => [
      `"${row.orderId}"`,
      `"${moment(row.createdAt).format("YYYY-MM-DD HH:mm:ss")}"`,
      `"${(row.customerName || "Customer").replace(/"/g, '""')}"`,
      `"${(row.customerEmail || "N/A").replace(/"/g, '""')}"`,
      row.totalItems,
      `"${(row.itemNames || "").replace(/"/g, '""')}"`,
      row.totalAmount,
      `"${row.paymentMethod}"`,
      `"${row.paymentStatus}"`,
      `"${row.approvalStatus}"`,
      `"${row.orderStatus}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateSuffix = fromDate || toDate ? `${fromDate || "start"}_to_${toDate || "now"}` : "all_time";
    link.setAttribute("download", `Orange_Garments_Sales_Report_${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Sales report exported successfully as CSV!");
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = revenueData?.summary || {
    totalRevenue: 0,
    acceptedOrdersCount: 0,
    completedOrdersCount: 0,
    totalItemsSold: 0,
    totalOrders: 0,
  };

  const categoryBreakdown = revenueData?.categoryBreakdown || [];
  const salesReport = revenueData?.salesReport || [];

  return (
    <div className="p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Revenue Analytics & Sales Report</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              MongoDB Atlas Live
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic revenue aggregation, sales KPI tracking, and exportable financial reports from MongoDB Atlas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <FaFileDownload size={14} />
            Export to CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
          >
            <FaPrint size={14} />
            Print Report
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={handleCustomFilter} className="flex flex-wrap items-center justify-between gap-4">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Date Filter:
            </span>
            {[
              { label: "All Time", value: "ALL" },
              { label: "Today", value: "TODAY" },
              { label: "Last 7 Days", value: "LAST_7_DAYS" },
              { label: "This Month", value: "THIS_MONTH" },
            ].map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => handleApplyPreset(p.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  selectedPreset === p.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1"
            >
              <FaFilter size={10} />
              Filter
            </button>

            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition inline-flex items-center gap-1"
                title="Reset Date Filters"
              >
                <FaRedo size={10} />
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">
              {displayINRCurrency(summary.totalRevenue)}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Across all accepted & active orders
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FaChartLine />
          </div>
        </div>

        {/* Accepted & Completed Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted Orders</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {summary.acceptedOrdersCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Completed / Delivered: {summary.completedOrdersCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
        </div>

        {/* Total Items Sold */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Items Sold</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">
              {summary.totalItemsSold}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Garments purchased
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            <FaTshirt />
          </div>
        </div>

        {/* Total Orders Logged */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">
              {summary.totalOrders}
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              Pending: {summary.pendingOrdersCount || 0} • Rejected: {summary.rejectedOrdersCount || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <FaCalendarAlt />
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Garment Category Sales Performance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryBreakdown.map((cat) => {
              const percentage = summary.totalRevenue > 0
                ? Math.round((cat.revenue / summary.totalRevenue) * 100)
                : 0;

              return (
                <div key={cat.category} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-700 capitalize">{cat.category}</p>
                  <p className="text-base font-extrabold text-slate-800 mt-1">
                    {displayINRCurrency(cat.revenue)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cat.unitsSold} units ({percentage}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sales Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Sales Transactions Report</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {salesReport.length} customer order transaction(s) from MongoDB Atlas
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Loading sales data from MongoDB Atlas...
          </div>
        ) : salesReport.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold">No transactions recorded for the selected period.</p>
            <p className="text-xs text-slate-400 mt-1">
              Place an order on the storefront or adjust your date filter to view transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesReport.map((row) => (
                  <tr key={row.orderId} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      #{row.orderId.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {moment(row.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{row.customerName}</p>
                      <p className="text-[11px] text-slate-400">{row.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">{row.totalItems} item(s)</span>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]" title={row.itemNames}>
                        {row.itemNames}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-600 whitespace-nowrap">
                      {displayINRCurrency(row.totalAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 uppercase">{row.paymentMethod}</span>
                      <span className="block text-[10px] text-emerald-600 font-medium">
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.approvalStatus === "Accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : row.approvalStatus === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {row.approvalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.orderStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : row.orderStatus === "Shipping"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : row.orderStatus === "Packed"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenue;
