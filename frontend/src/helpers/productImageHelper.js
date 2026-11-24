// Helper for resolving garment product images and category placeholders

export const CATEGORY_PLACEHOLDERS = {
  shirt: "/images/placeholders/placeholder-shirt.svg",
  pant: "/images/placeholders/placeholder-pant.svg",
  tshirt: "/images/placeholders/placeholder-tshirt.svg",
  sweater: "/images/placeholders/placeholder-sweater.svg",
  hoodie: "/images/placeholders/placeholder-hoodie.svg",
  jacket: "/images/placeholders/placeholder-jacket.svg",
  default: "/images/placeholders/placeholder-garment.svg",
};

/**
 * Gets a reliable image URL for a garment product.
 * Falls back to category-specific placeholders if image is missing.
 */
export const getProductImage = (product, index = 0) => {
  const category = (product?.category || "").toLowerCase();
  const fallback = CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.default;

  if (!product) return fallback;

  const images = product?.productImage || product?.image;
  if (Array.isArray(images) && images.length > 0 && images[index]) {
    const img = images[index];
    // If it's an old broken cloudinary or external url, fallback to clean category placeholder
    if (typeof img === "string" && (img.includes("cloudinary") || img.includes("googleusercontent"))) {
      return fallback;
    }
    return img;
  }

  if (typeof images === "string" && images.trim().length > 0) {
    if (images.includes("cloudinary") || images.includes("googleusercontent")) {
      return fallback;
    }
    return images;
  }

  return fallback;
};

/**
 * Fallback event handler for img onError.
 * Replaces broken images with a clean garment placeholder.
 */
export const handleImageError = (e, category = "default") => {
  const cat = (category || "").toLowerCase();
  const placeholder = CATEGORY_PLACEHOLDERS[cat] || CATEGORY_PLACEHOLDERS.default;
  if (e.target.src !== placeholder && !e.target.src.endsWith(placeholder)) {
    e.target.onerror = null; // Prevent infinite loop if placeholder fails
    e.target.src = placeholder;
  }
};

export default getProductImage;
