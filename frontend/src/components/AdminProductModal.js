import React, { useState } from "react";
import ProductCategory from "../helpers/ProductCategory";
import { GARMENT_IMAGE_PRESETS, getPresetsByCategory } from "../helpers/garmentPresets";
import { MdClose, MdDelete, MdCheck } from "react-icons/md";
import { FaCloudUploadAlt, FaImages } from "react-icons/fa";
import UploadImage from "../helpers/UploadImage";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";

const AdminProductModal = ({ product = null, onClose, onSuccess }) => {
  const isEditing = Boolean(product && product._id);

  const [formData, setFormData] = useState({
    productName: product?.productName || "",
    brandName: product?.brandName || "",
    category: product?.category || "shirt",
    price: product?.price || "",
    sellingPrice: product?.sellingPrice || "",
    productDesc: product?.productDesc || "",
    productImage: Array.isArray(product?.productImage)
      ? product.productImage
      : (product?.productImage ? [product.productImage] : []),
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData((prev) => {
      // If user hasn't selected any image yet, suggest a default preset for this category
      let newImages = [...prev.productImage];
      if (newImages.length === 0) {
        const presets = getPresetsByCategory(newCategory);
        if (presets.length > 0) {
          newImages = [presets[0].path];
        }
      }
      return {
        ...prev,
        category: newCategory,
        productImage: newImages,
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await UploadImage(file);
      if (result.url) {
        setFormData((prev) => ({
          ...prev,
          productImage: [...prev.productImage, result.url],
        }));
        toast.success("Local image processed successfully!");
      }
    } catch (err) {
      console.error("Local file processing error:", err);
      toast.error("Failed to process image file.");
    }
  };

  const handleSelectPreset = (path) => {
    if (!formData.productImage.includes(path)) {
      setFormData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, path],
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updated = [...prev.productImage];
      updated.splice(index, 1);
      return { ...prev, productImage: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName.trim()) {
      toast.error("Please enter a product name.");
      return;
    }
    if (!formData.brandName.trim()) {
      toast.error("Please enter a brand name.");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error("Please enter a valid regular price (MRP).");
      return;
    }
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      toast.error("Please enter a valid selling price.");
      return;
    }

    // Default image if none selected
    let images = formData.productImage;
    if (!images || images.length === 0) {
      images = [`/images/placeholders/placeholder-${formData.category}.svg`];
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        productImage: images,
        price: Number(formData.price),
        sellingPrice: Number(formData.sellingPrice),
      };

      const url = isEditing ? SummaryApi.updateProduct.url : SummaryApi.uploadProduct.url;
      const method = isEditing ? SummaryApi.updateProduct.method : SummaryApi.uploadProduct.method;

      if (isEditing) {
        payload._id = product._id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          isEditing
            ? "Product updated successfully in MongoDB Atlas!"
            : "Product added successfully to MongoDB Atlas!"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to save product in MongoDB Atlas.");
      }
    } catch (error) {
      console.error("Save product error:", error);
      toast.error("An error occurred while saving product to MongoDB Atlas.");
    } finally {
      setSubmitting(false);
    }
  };

  const availablePresets = getPresetsByCategory(formData.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white">
          <div>
            <h2 className="text-xl font-bold">
              {isEditing ? "Edit Garment Product" : "Add New Garment Product"}
            </h2>
            <p className="text-xs text-slate-300">
              Directly connected to MongoDB Atlas Product Catalog
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="e.g. Premium Linen Casual Shirt"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                placeholder="e.g. Orange Garments"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
              >
                {ProductCategory.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* MRP / Original Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Original Price (₹ MRP) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 1499"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                placeholder="e.g. 999"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-red-600"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Product Description
            </label>
            <textarea
              name="productDesc"
              rows={3}
              value={formData.productDesc}
              onChange={handleInputChange}
              placeholder="Enter product fabric details, fit, wash care instructions, etc."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Handling (Zero Cloudinary) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FaImages className="text-blue-600" />
                Product Images (Local Assets & Presets)
              </label>
              <button
                type="button"
                onClick={() => setShowPresetPicker(!showPresetPicker)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
              >
                {showPresetPicker ? "Hide Presets" : "Select from Garment Presets"}
              </button>
            </div>

            {/* Selected Images Preview */}
            <div className="flex flex-wrap gap-3 mb-3 min-h-[70px] items-center p-2 bg-white rounded border border-slate-200">
              {formData.productImage.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No images selected yet. Choose a preset below or upload a local file.
                </p>
              ) : (
                formData.productImage.map((img, index) => (
                  <div key={index} className="relative group w-16 h-16 border rounded bg-slate-100 p-1">
                    <img
                      src={img}
                      alt={`Product Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs shadow hover:bg-red-700"
                      title="Remove image"
                    >
                      <MdDelete size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Presets Gallery */}
            {showPresetPicker && (
              <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Click any local garment asset to add to this product:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availablePresets.map((preset, idx) => {
                    const isSelected = formData.productImage.includes(preset.path);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleSelectPreset(preset.path)}
                        className={`p-1 border rounded-lg flex flex-col items-center hover:border-blue-500 transition relative ${
                          isSelected ? "border-blue-600 bg-blue-50 ring-2 ring-blue-400" : "border-slate-200"
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.path}
                          alt={preset.name}
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-[10px] text-slate-600 truncate w-full text-center mt-1">
                          {preset.name.split(" ")[0]}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                            <MdCheck size={10} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Local File Upload (Base64) */}
            <div className="mt-3 flex items-center gap-3">
              <label
                htmlFor="localImageFileInput"
                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                <FaCloudUploadAlt size={16} />
                Upload Local File (Zero Cloudinary)
              </label>
              <input
                id="localImageFileInput"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-[11px] text-slate-500">
                Supports PNG, JPG, SVG, WebP
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Saving to MongoDB..." : isEditing ? "Update Product" : "Save to MongoDB"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductModal;
