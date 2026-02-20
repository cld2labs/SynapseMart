import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search as SearchIcon } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-20 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="h-11 w-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:block">SynapseMart</span>
          </Link>

          {/* Search Bar (Centered) */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all font-medium text-gray-800 placeholder:text-gray-400 shadow-sm hover:shadow-md"
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Nav Links */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-gray-50 transition-colors">Home</Link>
            <Link to="/upload" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-gray-50 transition-colors">Upload</Link>
            <Link to="/settings" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-gray-50 transition-colors">Settings</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
