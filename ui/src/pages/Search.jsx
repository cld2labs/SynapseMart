import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { searchProducts, getProducts, getCategories } from '../services/api';
import ProductList from '../components/ProductList';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadCategories();

    // Auto-search if params exist
    const initialQuery = searchParams.get('q');
    const initialCategory = searchParams.get('category');

    if (initialQuery || initialCategory) {
      setQuery(initialQuery || '');
      setSelectedCategory(initialCategory || '');
      performSearch(initialQuery, initialCategory);
    }
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const performSearch = async (searchQ, searchCat) => {
    if (!searchQ && !searchCat) return;

    setLoading(true);
    setSearched(true);
    try {
      let data;
      if (searchQ) {
        data = await searchProducts(searchQ);
        if (searchCat) {
          data.results = data.results.filter(p => p.category === searchCat);
        }
        setResults(data.results || []);
      } else if (searchCat) {
        data = await getProducts({ category: searchCat, limit: 100 });
        setResults(data || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Update params to trigger search via useEffect
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (category) params.category = category;
    setSearchParams(params);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-blue-700 flex items-center gap-2 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <SearchIcon className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-gray-100">
              <span className="text-gray-700 font-semibold">Filter by Category:</span>
              <button
                type="button"
                onClick={() => handleCategoryClick('')}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${selectedCategory === ''
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Searching...</p>
        </div>
      )}

      {!loading && searched && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">No products found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <ProductList products={results} />
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
