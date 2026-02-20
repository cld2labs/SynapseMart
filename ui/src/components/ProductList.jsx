import ProductCard from './ProductCard';

export const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return <p className="text-center py-8 text-gray-500">No products to display</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
