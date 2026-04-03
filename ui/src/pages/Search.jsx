import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { searchProducts, getProducts, getCategories, getUploadJobStatus } from '../services/api';
import ProductList from '../components/ProductList';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true);
  const [jobStatus, setJobStatus] = useState(null);

  const loadProducts = async (category = '') => {
    const filters = { limit: 100 };
    if (category) {
      filters.category = category;
    }

    const data = await getProducts(filters);
    setResults(data || []);
  };

  useEffect(() => {
    loadCategories();
    const initialQuery = searchParams.get('q');
    const initialCategory = searchParams.get('category');
    const currentJobId = searchParams.get('job');

    setQuery(initialQuery || '');
    setSelectedCategory(initialCategory || '');
    performSearch(initialQuery, initialCategory);
    setJobStatus(currentJobId ? { job_id: currentJobId, status: 'queued', processed_products: 0, total_products: 0 } : null);
  }, [searchParams]);

  useEffect(() => {
    const jobId = searchParams.get('job');
    if (!jobId) {
      setJobStatus(null);
      return undefined;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const nextStatus = await getUploadJobStatus(jobId);
        if (!cancelled) {
          setJobStatus(nextStatus);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch upload job status:', error);
        }
      }
    };

    fetchStatus();

    const intervalId = window.setInterval(async () => {
      const nextStatus = await getUploadJobStatus(jobId).catch((error) => {
        console.error('Failed to fetch upload job status:', error);
        return null;
      });

      if (!nextStatus || cancelled) {
        return;
      }

      setJobStatus(nextStatus);
      if (nextStatus.status === 'completed' || nextStatus.status === 'completed_with_errors') {
        window.clearInterval(intervalId);
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
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
    setLoading(true);
    setSearched(true);
    try {
      if (searchQ) {
        const data = await searchProducts(searchQ);
        if (searchCat) {
          data.results = data.results.filter(p => p.category === searchCat);
        }
        setResults(data.results || []);
      } else {
        await loadProducts(searchCat || '');
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
    const jobId = searchParams.get('job');
    if (jobId) params.job = jobId;
    setSearchParams(params);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (category) params.category = category;
    const jobId = searchParams.get('job');
    if (jobId) params.job = jobId;
    setSearchParams(params);
  };

  const progressPercent = jobStatus?.total_products
    ? Math.min(100, Math.round((jobStatus.processed_products / jobStatus.total_products) * 100))
    : 0;
  const enrichmentFinished = jobStatus?.status === 'completed' || jobStatus?.status === 'completed_with_errors';
  const enrichmentHeading = enrichmentFinished
    ? 'Upload processing is complete.'
    : 'Products are searchable now. Enrichment is still running.';
  const enrichmentBody = enrichmentFinished
    ? 'Background enrichment has finished. Search results now reflect the latest indexed product text.'
    : `Processed ${jobStatus?.processed_products ?? 0} of ${jobStatus?.total_products ?? 0} products.`;

  return (
    <div className="space-y-8">
      {jobStatus && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Upload Processing</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">{enrichmentHeading}</h2>
              <p className="mt-2 text-gray-600">{enrichmentBody}</p>
            </div>
            {!enrichmentFinished && (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            )}
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <span>Status: <strong className="text-gray-900">{jobStatus.status}</strong></span>
            <span>Completed batches: <strong className="text-gray-900">{jobStatus.completed_batches}</strong></span>
            {jobStatus.failed_batches > 0 && (
              <span>Failed batches: <strong className="text-red-600">{jobStatus.failed_batches}</strong></span>
            )}
          </div>
        </div>
      )}

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
