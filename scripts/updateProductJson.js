const fs = require('fs');
const path = require('path');

const productJsonPath = path.join(__dirname, '..', 'backend', 'config', 'product.json');
const products = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));

const catCounters = {
  shirt: 0,
  pant: 0,
  tshirt: 0,
  sweater: 0,
  hoodie: 0,
  jacket: 0
};

const updatedProducts = products.map((item) => {
  const cat = item.category;
  if (catCounters[cat] !== undefined) {
    catCounters[cat]++;
    const idx = catCounters[cat];
    item.productImage = [
      `/images/products/${cat}-${idx}.svg`,
      `/images/products/${cat}-${idx}-back.svg`
    ];
  }
  return item;
});

fs.writeFileSync(productJsonPath, JSON.stringify(updatedProducts, null, 2), 'utf8');
console.log('Successfully updated backend/config/product.json with local static garment image URLs!');
console.log('Category Counts:', catCounters);
