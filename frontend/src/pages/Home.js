import React from 'react';
import CategoryList from '../components/CategoryList';
import BannerProduct from '../components/BannerProduct';
import HorizontalProductCard from '../components/HorizontalProductCard';
import VerticalProductCard from '../components/VerticalProductCard';

const Home = () => {
  return (
    <div>
      <CategoryList />
      <BannerProduct />

      {/* Shirts */}
      <HorizontalProductCard category={"shirt"} heading={"Top Shirts"} />
      
      {/* T-Shirts */}
      <HorizontalProductCard category={"tshirt"} heading={"Trending T-Shirts"} />
      
      {/* Pants */}
      <HorizontalProductCard category={"pant"} heading={"Popular Pants"} />
      
      {/* Hoodies */}
      <VerticalProductCard category={"hoodie"} heading={"Trending Hoodies"} />

      {/* Sweaters */}
      <HorizontalProductCard category={"sweater"} heading={"Best Selling Sweaters"} />
      
      {/* Jackets */}
      <VerticalProductCard category={"jacket"} heading={"Stylish Winter Jackets"} />
    </div>
  );
};

export default Home;
