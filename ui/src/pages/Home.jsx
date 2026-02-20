import { useState, useEffect } from 'react';
import { Sparkles, Upload, Search, FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import WorkflowSummary from '../components/WorkflowSummary';
import ProductList from '../components/ProductList';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ limit: 8 }); // Get latest/trending
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-20 pb-12">
      {/* Marketplace Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 h-[600px] flex items-center shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Marketplace"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-indigo-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.3),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 px-8 md:px-16 max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1]">
              Find everything <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                you need.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 font-light">
              marketplace powered by hybrid ai search
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => window.location.href = '/search'}
              className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl shadow-white/20 hover:shadow-2xl hover:scale-105"
            >
              Start Shopping
            </button>
            <button className="px-8 py-4 rounded-2xl font-bold text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
              Sell on SynapseMart
            </button>
          </div>
        </div>
      </div>

      {/* Backend Tech Workflow Summary */}
      <div className="relative pt-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>Architecture Overview</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Backend <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Tech Workflow</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            How SynapseMart processes data and provides intelligent answers
          </p>
        </div>

        <WorkflowSummary />
      </div>

      {/* Quick Access Grid */}
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 p-8 md:p-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>Getting Started</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How to Use <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">SynapseMart</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to start using the marketplace with hybrid AI search
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative group">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              1
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 h-full border-2 border-blue-100 group-hover:border-blue-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Products</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload a CSV file with your products. Include columns like name, description, category, price, and image_url.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:gap-3"
              >
                Go to Upload <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              2
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 h-full border-2 border-purple-100 group-hover:border-purple-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Products Loaded</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your products are automatically indexed using hybrid AI search. The system builds semantic and keyword search indices.
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Automatic</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              3
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 h-full border-2 border-amber-100 group-hover:border-amber-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Search & Discover</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Use natural language search like "toys under $10" or filter by category. The hybrid AI search understands your intent.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors group-hover:gap-3"
              >
                Start Searching <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* CSV Format Info */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">CSV File Format</h3>
              <p className="text-gray-600 mb-4">
                Your CSV file should include these columns:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['name', 'description', 'category', 'price', 'currency', 'stock_quantity', 'seller_name', 'image_url'].map((col) => (
                  <div key={col} className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <code className="text-sm font-mono text-gray-700">{col}</code>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                💡 <strong>Tip:</strong> Use direct image URLs from Unsplash or any image hosting service for the <code className="bg-gray-200 px-1 rounded">image_url</code> column.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Arrivals / Product Grid */}
      <div className="space-y-8">
        <div className="flex justify-between items-center px-2 pt-12 border-t border-gray-200">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
            <p className="text-gray-600">Latest products added to our marketplace</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Upload a CSV file to get started!</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Upload Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <ProductList products={products} />
        )}
      </div>
    </div>
  );
};

export default Home;
