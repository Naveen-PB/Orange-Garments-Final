const productModel = require("../model/productModel");
const productData = require("./product.json");

const seedProducts = async () => {
  try {
    const count = await productModel.countDocuments();
    if (count === 0) {
      console.log("No products found in database. Seeding products...");
      // Remove mongo specific $oid or format them
      const formatted = productData.map(p => {
        const item = { ...p };
        if (item._id && item._id.$oid) {
          delete item._id;
        }
        if (item.createdAt && item.createdAt.$date) {
          delete item.createdAt;
        }
        if (item.updatedAt && item.updatedAt.$date) {
          delete item.updatedAt;
        }
        delete item.__v;
        return item;
      });
      await productModel.insertMany(formatted);
      console.log(`Successfully seeded ${formatted.length} garment products into MongoDB!`);
    } else {
      // Check if products have old cloudinary or external URLs and update them
      const sample = await productModel.findOne({ category: "shirt" });
      if (sample && sample.productImage && sample.productImage[0] && (sample.productImage[0].includes("cloudinary") || sample.productImage[0].includes("googleusercontent"))) {
        console.log("Updating existing products with clean static garment image URLs...");
        for (const p of productData) {
          await productModel.updateOne(
            { productName: p.productName },
            { $set: { productImage: p.productImage } }
          );
        }
        console.log("Successfully updated product image URLs in database!");
      } else {
        console.log(`Database already has ${count} products.`);
      }
    }
  } catch (error) {
    console.error("Error seeding products:", error.message);
  }
};

module.exports = seedProducts;
