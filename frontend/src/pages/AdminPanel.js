import React, { useEffect } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import ROLE from "../common/Role";
import {
  FaBoxes,
  FaShoppingBag,
  FaTruck,
  FaChartLine,
  FaUsers,
  FaStore,
  FaShieldAlt,
} from "react-icons/fa";

const AdminPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const navigate = useNavigate();

  // If user is loaded and not admin, prompt or redirect
  const isAdmin = user?.role === ROLE.ADMIN;

  const navItems = [
    {
      to: "add-items",
      label: "Add Items",
      description: "Garment catalog & products",
      icon: <FaBoxes size={18} />,
    },
    {
      to: "orders",
      label: "My Orders",
      description: "Orders & approvals",
      icon: <FaShoppingBag size={18} />,
    },
    {
      to: "order-status",
      label: "Order Status",
      description: "Fulfillment & tracking",
      icon: <FaTruck size={18} />,
    },
    {
      to: "revenue",
      label: "Revenue",
      description: "Analytics & sales report",
      icon: <FaChartLine size={18} />,
    },
    {
      to: "all-users",
      label: "All Users",
      description: "User role management",
      icon: <FaUsers size={18} />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Admin Profile Header */}
          <div className="p-6 border-b border-slate-800 text-center">
            <div className="text-5xl text-blue-400 mx-auto w-fit mb-3 relative">
              {user?.profilepic ? (
                <img
                  src={user.profilepic}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 mx-auto"
                  alt={user?.name || "Admin"}
                />
              ) : (
                <FaCircleUser className="w-16 h-16 mx-auto" />
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <h2 className="text-lg font-bold text-white capitalize truncate">
              {user?.name || "Orange Administrator"}
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || "admin@orangegarments.com"}</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold mt-3 border border-blue-500/20">
              <FaShieldAlt size={11} />
              <span>Role: {user?.role || "ADMIN"}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Admin Modules (MongoDB Atlas)
            </p>
            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl transition text-sm font-medium ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <div className="flex flex-col">
                    <span className="leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal leading-tight">
                      {item.description}
                    </span>
                  </div>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            <FaStore />
            Back to Customer Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-[calc(100vh-70px)] bg-slate-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
