import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SynapseMart</span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Marketplace powered by hybrid AI search. Find everything you need with intelligent search technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Home</Link></li>
              <li><Link to="/search" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Search</Link></li>
              <li><Link to="/upload" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Upload Products</Link></li>
              <li><Link to="/settings" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} SynapseMart. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built with FastAPI & React
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
