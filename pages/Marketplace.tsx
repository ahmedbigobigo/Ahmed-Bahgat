import React from 'react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../services/data';

const Marketplace: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-arabic">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-cyan-400 font-semibold tracking-wide uppercase text-sm mb-2">Portfolio</h2>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            مصنع الحلول "حل"
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            اختار الحل المناسب لمشروعك، واحصل على نسختك في دقايق. تكنولوجيا سباقة لرواد أعمال طموحين.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Call to Action Footer */}
        <div className="mt-20 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
           <h3 className="text-2xl font-bold mb-4">مش لاقي اللي بتدور عليه؟</h3>
           <p className="text-gray-400 mb-8">كلم النسخة الديجيتال مني ونعمل عصف ذهني سوا ونخلق الحل الخاص بيك</p>
           <a href="#/" className="inline-block bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
             ابدأ المحادثة الآن
           </a>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
