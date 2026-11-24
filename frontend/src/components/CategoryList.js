import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { Link } from "react-router-dom";
import { getProductImage, handleImageError } from "../helpers/productImageHelper";

const CategoryList = () => {
  const [categoryProduct, setCategoryProduct] = useState([]);
  const [loding, setLoding] = useState(false);

  const categoryLoading = new Array(6).fill(null);

  const fetchCategoryProduct = async () => {
    setLoding(true);
    try {
      const response = await fetch(SummaryApi.getProductByCategory.url, {
        method: SummaryApi.getProductByCategory.method,
      });

      const responseData = await response.json();
      setCategoryProduct(responseData?.data || []);
    } catch (err) {
      console.error("Error fetching category list:", err);
    } finally {
      setLoding(false);
    }
  };

  useEffect(() => {
    fetchCategoryProduct();
  }, []);

  return (
    <div className="container pl-10 pr-10 pt-4 pb-4 mx-auto">
      <div className="flex items-center gap-4 justify-between overflow-scroll scrollbar-none">
        {loding
          ? categoryLoading.map((el, index) => {
              return (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-200 animate-pulse flex-shrink-0" key={"categoryLoading" + index}></div>
              );
            })
          : categoryProduct.map((category, index) => {
              return (
                <Link
                  to={"/category-product?category=" + category?.category}
                  className="cursor-pointer flex-shrink-0"
                  key={(category?.category || "cat") + index}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-3 bg-orange-50 border border-orange-200 flex justify-center items-center">
                    <img
                      src={getProductImage(category, 0)}
                      alt={category?.category}
                      onError={(e) => handleImageError(e, category?.category)}
                      className="h-full w-full object-contain mix-blend-multiply hover:scale-125 transition-all"
                    />
                  </div>
                  <p className="text-center text-sm md:text-base capitalize font-medium text-slate-700 mt-1">
                    {category?.category}
                  </p>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default CategoryList;
