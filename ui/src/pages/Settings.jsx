import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Trash2 } from 'lucide-react';
import { getProducts, getCategories, clearDatabase } from '../services/api';
import toast from 'react-hot-toast';

export const Settings = () => {
  const [stats, setStats] = useState({ totalProducts: 0, categories: [] });
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [products, categories] = await Promise.all([
        getProducts({ limit: 1000 }),
        getCategories()
      ]);
      setStats({
        totalProducts: products.length,
        categories: categories
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to delete ALL products? This cannot be undone!')) {
      return;
    }

    setClearing(true);
    try {
      await clearDatabase();
      toast.success('Database cleared successfully');
      
      // Reload stats
      await loadStats();
    } catch (error) {
      toast.error('Failed to clear database: ' + error.message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          Statistics & Settings
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-700">Total Products</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600">{stats.totalProducts}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-700">Categories</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">{stats.categories.length}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {stats.categories.length > 0 ? (
              stats.categories.map(cat => (
                <span key={cat} className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">
                  {cat}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No categories yet</p>
            )}
          </div>
        </div>

        {/* Clear Database */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Clear All Products</h4>
                <p className="text-gray-600 text-sm">
                  This will permanently delete all products from the database. 
                  Use this if you uploaded duplicates or want to start fresh.
                </p>
              </div>
              <button
                onClick={handleClearDatabase}
                disabled={clearing || stats.totalProducts === 0}
                className="ml-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2 font-medium whitespace-nowrap"
              >
                <Trash2 className="w-5 h-5" />
                {clearing ? 'Clearing...' : 'Clear Database'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
