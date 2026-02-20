import { Package } from 'lucide-react';

export const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-indigo-200">
      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback icon */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
          style={{ display: product.image_url ? 'none' : 'flex' }}
        >
          <Package className="w-20 h-20 text-gray-300" />
        </div>
        
        {/* Category Badge Overlay */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              ${product.price}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{product.currency}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-gray-600">
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </span>
          </div>
          <span className="text-gray-500 font-medium">{product.seller_name}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
