// Presets of static local SVG garment assets available in public/images/products and placeholders

export const GARMENT_IMAGE_PRESETS = [
  // Shirts
  { name: "Blue Oxford Shirt", category: "shirt", path: "/images/products/shirt-1.svg" },
  { name: "Casual Denim Shirt", category: "shirt", path: "/images/products/shirt-2.svg" },
  { name: "Formal White Shirt", category: "shirt", path: "/images/products/shirt-3.svg" },
  { name: "Checked Flannel Shirt", category: "shirt", path: "/images/products/shirt-4.svg" },
  { name: "Striped Cotton Shirt", category: "shirt", path: "/images/products/shirt-5.svg" },
  { name: "Linen Summer Shirt", category: "shirt", path: "/images/products/shirt-6.svg" },
  { name: "Printed Casual Shirt", category: "shirt", path: "/images/products/shirt-7.svg" },
  { name: "Slim Fit Black Shirt", category: "shirt", path: "/images/products/shirt-8.svg" },
  { name: "Khaki Workwear Shirt", category: "shirt", path: "/images/products/shirt-9.svg" },
  { name: "Mandarin Collar Shirt", category: "shirt", path: "/images/products/shirt-10.svg" },

  // T-Shirts
  { name: "Crew Neck Cotton T-Shirt", category: "tshirt", path: "/images/products/tshirt-1.svg" },
  { name: "Heather Grey Tee", category: "tshirt", path: "/images/products/tshirt-2.svg" },
  { name: "Graphic Streetwear Tee", category: "tshirt", path: "/images/products/tshirt-3.svg" },
  { name: "Classic Polo T-Shirt", category: "tshirt", path: "/images/products/tshirt-4.svg" },
  { name: "Oversized Fit Tee", category: "tshirt", path: "/images/products/tshirt-5.svg" },
  { name: "V-Neck Slim Tee", category: "tshirt", path: "/images/products/tshirt-6.svg" },
  { name: "Vintage Wash Tee", category: "tshirt", path: "/images/products/tshirt-7.svg" },
  { name: "Athletic Quick-Dry Tee", category: "tshirt", path: "/images/products/tshirt-8.svg" },
  { name: "Pocket Detail Tee", category: "tshirt", path: "/images/products/tshirt-9.svg" },
  { name: "Striped Mariner Tee", category: "tshirt", path: "/images/products/tshirt-10.svg" },

  // Pants
  { name: "Slim Fit Chinos", category: "pant", path: "/images/products/pant-1.svg" },
  { name: "Classic Blue Denim Jeans", category: "pant", path: "/images/products/pant-2.svg" },
  { name: "Formal Trousers", category: "pant", path: "/images/products/pant-3.svg" },
  { name: "Cargo Joggers", category: "pant", path: "/images/products/pant-4.svg" },
  { name: "Tapered Cotton Pants", category: "pant", path: "/images/products/pant-5.svg" },
  { name: "Relaxed Linen Pants", category: "pant", path: "/images/products/pant-6.svg" },
  { name: "Stretch Khaki Pants", category: "pant", path: "/images/products/pant-7.svg" },
  { name: "Track Pant Joggers", category: "pant", path: "/images/products/pant-8.svg" },
  { name: "Pleated Dress Trousers", category: "pant", path: "/images/products/pant-9.svg" },

  // Hoodies
  { name: "Fleece Pullover Hoodie", category: "hoodie", path: "/images/products/hoodie-1.svg" },
  { name: "Zip-Up Urban Hoodie", category: "hoodie", path: "/images/products/hoodie-2.svg" },
  { name: "Oversized Winter Hoodie", category: "hoodie", path: "/images/products/hoodie-3.svg" },
  { name: "Heavyweight Graphic Hoodie", category: "hoodie", path: "/images/products/hoodie-4.svg" },
  { name: "Sport Athletic Hoodie", category: "hoodie", path: "/images/products/hoodie-5.svg" },

  // Jackets
  { name: "Bomber Flight Jacket", category: "jacket", path: "/images/products/jacket-1.svg" },
  { name: "Classic Denim Trucker Jacket", category: "jacket", path: "/images/products/jacket-2.svg" },
  { name: "Puffer Winter Jacket", category: "jacket", path: "/images/products/jacket-3.svg" },
  { name: "Lightweight Windbreaker", category: "jacket", path: "/images/products/jacket-4.svg" },
  { name: "Fleece Zip Jacket", category: "jacket", path: "/images/products/jacket-5.svg" },

  // Sweaters
  { name: "Cable Knit Wool Sweater", category: "sweater", path: "/images/products/sweater-1.svg" },
  { name: "Crewneck Cashmere Sweater", category: "sweater", path: "/images/products/sweater-2.svg" },
  { name: "Ribbed Turtleneck Sweater", category: "sweater", path: "/images/products/sweater-3.svg" },
  { name: "Patterned Winter Knit", category: "sweater", path: "/images/products/sweater-4.svg" },
  { name: "Cardigan Button Sweater", category: "sweater", path: "/images/products/sweater-5.svg" },
];

export const getPresetsByCategory = (category) => {
  if (!category) return GARMENT_IMAGE_PRESETS;
  const cat = category.toLowerCase();
  const filtered = GARMENT_IMAGE_PRESETS.filter(p => p.category === cat);
  return filtered.length > 0 ? filtered : GARMENT_IMAGE_PRESETS;
};

export default GARMENT_IMAGE_PRESETS;
