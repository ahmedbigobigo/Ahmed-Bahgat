import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../services/data';

const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400 mb-4">المنتج غير موجود</p>
          <Link to="/marketplace" className="text-cyan-400 hover:underline">الرجوع للمتجر</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 font-arabic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-gray-400 text-sm text-right flex-row-reverse">
          <Link to="/marketplace" className="hover:text-white transition-colors">المتجر</Link>
          <span className="mx-2">/</span>
          <span className="text-cyan-400">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Right Column in LTR, but effectively main content) */}
          <div className="lg:col-span-2 space-y-12 order-2 lg:order-1">
            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
              <img src={product.images[0]} alt={product.name} className="w-full h-auto" />
            </div>

            {/* Description & Details */}
            <div className="prose prose-invert max-w-none text-right" dir="rtl">
              <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
            </div>

            {/* Features Grid */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800" dir="rtl">
              <h3 className="text-2xl font-bold mb-6">المميزات الرئيسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
             
             {/* Additional Screenshots */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-right">لقطات من التطبيق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.images.slice(1).map((img, idx) => (
                         <div key={idx} className="rounded-xl overflow-hidden border border-gray-800">
                             <img src={img} alt={`${product.name} screen ${idx + 1}`} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                         </div>
                    ))}
                </div>
            </div>

          </div>

          {/* Sidebar (Sticky Pricing) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-24 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2 text-white">{product.name}</h1>
                <p className="text-gray-400 text-sm mb-4">{product.tagline}</p>
                <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-extrabold text-cyan-400">${product.price}</span>
                    <span className="text-gray-500 line-through text-lg">$999</span>
                </div>
                <div className="mt-2 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/20">
                    LIFETIME DEAL
                </div>
              </div>

              <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] mb-4 transform hover:-translate-y-1">
                اشتري الآن
              </button>
              
              <p className="text-center text-xs text-gray-500 mb-6">
                ضمان استرجاع الأموال لمدة 60 يوم
              </p>

              <div className="space-y-4 border-t border-gray-800 pt-6" dir="rtl">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">التسليم:</span>
                    <span className="text-white font-medium">فوري</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">الدعم:</span>
                    <span className="text-white font-medium">24/7 عبر AI</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-400">التحديثات:</span>
                    <span className="text-white font-medium">مجانية مدى الحياة</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
