import { Brain, Search, Zap, Sparkles } from 'lucide-react';

export default function TechHighlights() {
  const features = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: "YAKE",
      subtitle: "Keyword Extraction",
      desc: "Advanced keyword extraction using YAKE algorithm for intelligent query understanding.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600"
    },
    {
      icon: <Search className="w-7 h-7" />,
      title: "FAISS",
      subtitle: "Semantic Search",
      desc: "Vector similarity search powered by Facebook AI Similarity Search for semantic understanding.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-600"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "BM25",
      subtitle: "Keyword Ranking",
      desc: "Best Match 25 algorithm for traditional keyword-based ranking and relevance scoring.",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconColor: "text-amber-600"
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "RRF",
      subtitle: "Rank Fusion",
      desc: "Reciprocal Rank Fusion combines multiple search results for optimal relevance and accuracy.",
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
      {features.map((f, idx) => (
        <div 
          key={idx} 
          className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden"
        >
          {/* Gradient Background on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${f.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className={`relative mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
              <div className="text-white">
                {f.icon}
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <h3 className={`text-2xl font-bold bg-gradient-to-r ${f.gradient} bg-clip-text text-transparent mb-1`}>
                {f.title}
              </h3>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                {f.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
              {f.desc}
            </p>

            {/* Decorative Element */}
            <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${f.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
