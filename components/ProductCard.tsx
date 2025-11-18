import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-white/10">
          <span className="text-cyan-400 font-bold">${product.price}</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-2 text-right font-arabic">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 text-right font-arabic flex-1">
          {product.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-800">
           <Link 
            to={`/product/${product.slug}`}
            className="block w-full bg-white/5 hover:bg-white/10 text-center py-2 rounded-lg text-cyan-400 font-medium transition-colors"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
