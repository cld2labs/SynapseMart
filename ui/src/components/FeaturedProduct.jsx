import { Star, CheckCircle2, Sparkles } from 'lucide-react';

export default function FeaturedProduct() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl animate-fade-in">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600 blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-600 blur-3xl opacity-20"></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-300">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Recommended Choice</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                        MacBook Pro 16" <span className="text-gray-400">M3 Max</span>
                    </h2>

                    <p className="text-lg text-gray-300 max-w-lg">
                        Experience the ultimate performance for professionals. The new M3 Max chip brings specific hardware acceleration for machine learning and 3D rendering properly.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Hybrid Search matched "Professional Laptop"</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Semantic similarity score: 0.92</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>Stock availability confirmed</span>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-wrap gap-4">
                        <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg shadow-white/10">
                            View Details
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition">
                            Add to Cart - $2499
                        </button>
                    </div>
                </div>

                {/* Product Image Side */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
                    <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 min-h-[400px] flex flex-col items-center justify-center text-center">
                        {/* Placeholder for Laptop Image */}
                        <img
                            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="MacBook Pro"
                            className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition duration-500"
                        />
                        <div className="mt-8 flex gap-4">
                            <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                                <div className="text-xs text-gray-400 uppercase font-bold">Chip</div>
                                <div className="font-mono text-indigo-400">M3 Max</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                                <div className="text-xs text-gray-400 uppercase font-bold">Memory</div>
                                <div className="font-mono text-purple-400">36GB</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                                <div className="text-xs text-gray-400 uppercase font-bold">SSD</div>
                                <div className="font-mono text-emerald-400">1TB</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
