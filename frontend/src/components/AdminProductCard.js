import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import AdminEditProduct from "./AdminEditProduct";
import displayINRCurrency from "../helpers/displayCurrency";
import { getProductImage, handleImageError } from "../helpers/productImageHelper";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";

const AdminProductCard = ({ product, fetchData }) => {
  const [editProduct, seteditProduct] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.productName}" from MongoDB Atlas?`)) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`${SummaryApi.deleteProduct.url}/${product._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data?.success) {
        toast.success("Product deleted successfully from MongoDB Atlas!");
        fetchData();
      } else {
        toast.error(data?.message || "Failed to delete product.");
      }
    } catch (err) {
      toast.error("Error deleting product.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition w-64 h-90 flex flex-col justify-between">
      <div>
        <div className="flex justify-end gap-2 mb-2">
          <button
            type="button"
            className="p-1.5 bg-blue-500 rounded-full text-white hover:bg-blue-700 transition cursor-pointer text-xs"
            onClick={() => seteditProduct(true)}
            title="Edit Product"
          >
            <FaEdit />
          </button>
          <button
            type="button"
            disabled={deleting}
            className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-700 transition cursor-pointer text-xs disabled:opacity-50"
            onClick={handleDelete}
            title="Delete Product"
          >
            <FaTrash />
          </button>
        </div>
        <div className="w-56 h-44 flex justify-center items-center mx-auto bg-slate-50 rounded-lg p-2">
          <img
            src={getProductImage(product, 0)}
            onError={(e) => handleImageError(e, product?.category)}
            className="object-contain h-full w-full rounded mix-blend-multiply"
            alt={product.productName}
          />
        </div>
        <h1 className="text-ellipsis line-clamp-2 text-center mt-2 font-medium text-slate-800 text-sm">
          {product.productName}
        </h1>
      </div>
      <div>
        <p className="font-bold text-center mt-2 text-red-600">
          {displayINRCurrency(product.sellingPrice)}
        </p>
      </div>

      {editProduct && (
        <AdminEditProduct
          product={product}
          onClose={() => seteditProduct(false)}
          fetchData={fetchData}
        />
      )}
    </div>
  );
};

export default AdminProductCard;
