import React, { useEffect, useState } from "react";
import SummaryApi from "../../common/API";
import displayINRCurrency from "../../helpers/displayCurrency";
import { getProductImage, handleImageError } from "../../helpers/productImageHelper";
import AdminProductModal from "../../components/AdminProductModal";
import ProductCategory from "../../helpers/ProductCategory";
import { FaPlus, FaSearch, FaTrash, FaEdit, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";

const AdminAddItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.getProduct.url, {
        method: SummaryApi.getProduct.method,
      });
      const data = await response.json();
      if (data?.success) {
        setProducts(data?.data || []);
      } else {
        toast.error("Failed to fetch products from MongoDB Atlas.");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Network error while connecting to MongoDB Atlas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;

    try {
      const response = await fetch(`${SummaryApi.deleteProduct.url}/${deleteCandidate._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });

      const data = await response.json();
      if (data?.success) {
        toast.success("Product deleted successfully from MongoDB Atlas!");
        setProducts((prev) => prev.filter((p) => p._id !== deleteCandidate._id));
      } else {
        toast.error(data?.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error("Error deleting product from database.");
    } finally {
      setDeleteCandidate(null);
    }
  };

  // Filter products by search query and category
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      (prod?.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod?.brandName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      (prod?.category || "").toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Add Items & Products</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              MongoDB Atlas Live
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage garment catalog: Add, edit, and delete products directly in MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
        >
          <FaPlus size={14} />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative md:col-span-2">
          <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by title or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {ProductCategory.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-pulse">
              <div className="h-44 bg-slate-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <FaBoxOpen className="mx-auto text-5xl text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No products found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm || selectedCategory !== "ALL"
              ? "Try adjusting your search query or category filter."
              : "Click 'Add New Product' to create your first garment item in MongoDB Atlas."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const discount = Math.round(
              ((product.price - product.sellingPrice) / product.price) * 100
            );

            return (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-48 bg-slate-50 p-4 flex items-center justify-center border-b border-slate-100">
                    <img
                      src={getProductImage(product, 0)}
                      onError={(e) => handleImageError(e, product.category)}
                      alt={product.productName}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                    <span className="absolute top-2 left-2 bg-slate-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded capitalize">
                      {product.category}
                    </span>
                    {discount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      {product.brandName}
                    </p>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-1 mt-0.5">
                      {product.productName}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-base font-bold text-red-600">
                        {displayINRCurrency(product.sellingPrice)}
                      </span>
                      {product.price > product.sellingPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {displayINRCurrency(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(product)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    title="Delete product"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchProducts}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteCandidate.productName}"</span>? This will permanently remove the item from MongoDB Atlas.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
              >
                Delete from Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddItems;
