import { ArrowRight, Database, Search, Zap, Cpu, Sparkles, Filter, Brain } from 'lucide-react';

export default function WorkflowSummary() {
    const steps = [
        {
            title: "Data Ingestion",
            phase: "Phase 1: Catalog Processing",
            icon: <Database className="w-6 h-6" />,
            color: "blue",
            details: [
                "CSV Parsing (Pandas)",
                "SQL Persistence (SQLite)",
                "Indexing Trigger"
            ],
            description: "Raw product data is cleaned, validated, and persisted for reliable storage."
        },
        {
            title: "Hybrid Indexing",
            phase: "Phase 2: AI Knowledge Base",
            icon: <Cpu className="w-6 h-6" />,
            color: "purple",
            details: [
                "Semantic Vectors (MiniLM)",
                "Keyword Index (BM25)",
                "FAISS Vector Storage"
            ],
            description: "Products are transformed into 384D mathematical vectors for semantic understanding."
        },
        {
            title: "Intelligent Retrieval",
            phase: "Phase 3: Smart Search",
            icon: <Search className="w-6 h-6" />,
            color: "amber",
            details: [
                "NLP Query Parsing",
                "Semantic + Keyword Fusion",
                "RRF Relevance Ranking"
            ],
            description: "Natural language is parsed for intent, filters are applied, and results are ranked."
        }
    ];

    const techStack = [
        {
            icon: <Brain className="w-6 h-6" />,
            title: "YAKE",
            subtitle: "Keyword Extraction",
            desc: "Advanced keyword extraction for intelligent query understanding"
        },
        {
            icon: <Search className="w-6 h-6" />,
            title: "FAISS",
            subtitle: "Semantic Search",
            desc: "Vector similarity search for semantic understanding"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "BM25",
            subtitle: "Keyword Ranking",
            desc: "Best Match 25 algorithm for keyword-based ranking"
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "RRF",
            subtitle: "Rank Fusion",
            desc: "Reciprocal Rank Fusion for optimal relevance"
        }
    ];

    const colorMap = {
        blue: {
            bg: 'bg-blue-600',
            text: 'text-blue-600',
            lightBg: 'bg-blue-50',
            sparkle: 'text-blue-500'
        },
        purple: {
            bg: 'bg-purple-600',
            text: 'text-purple-600',
            lightBg: 'bg-purple-50',
            sparkle: 'text-purple-500'
        },
        amber: {
            bg: 'bg-amber-600',
            text: 'text-amber-600',
            lightBg: 'bg-amber-50',
            sparkle: 'text-amber-500'
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200">
            {/* Main Workflow Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {steps.map((step, idx) => {
                    const colors = colorMap[step.color];
                    return (
                        <div key={idx} className="relative flex flex-col bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                            {/* Step Number Badge */}
                            <div className={`absolute -top-3 -left-3 w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center text-white font-bold shadow-lg z-10`}>
                                {idx + 1}
                            </div>

                            {/* Header */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${colors.lightBg} ${colors.text}`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                                    <p className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>{step.phase}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                {step.description}
                            </p>

                            {/* Detail Pills */}
                            <div className="mt-auto space-y-2">
                                {step.details.map((detail, dIdx) => (
                                    <div key={dIdx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <Sparkles className={`w-3 h-3 ${colors.sparkle}`} />
                                        <span className="text-xs font-medium text-gray-700">{detail}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Connecting Arrow */}
                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                                    <div className="bg-white p-1.5 rounded-full shadow-md border border-gray-200">
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tech Stack Grid */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Technology Stack</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {techStack.map((tech, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                            <div className="mb-3 text-indigo-600">{tech.icon}</div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">{tech.title}</h4>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{tech.subtitle}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{tech.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RRF Algorithm Details */}
            <div className="bg-gradient-to-br from-indigo-900 via-gray-900 to-indigo-950 rounded-2xl p-8 md:p-10 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-indigo-300 text-sm font-bold">
                            <Zap className="w-4 h-4" />
                            <span>Core Algorithm: Reciprocal Rank Fusion</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                            The Best of Both Worlds
                        </h3>
                        <p className="text-indigo-100 text-lg font-light leading-relaxed">
                            SynapseMart avoids the "Vector Only" trap. Our RRF engine combines standard Keyword match scores (for precise terms) with Semantic Vector scores (for conceptual meaning), ensuring you find what you need even with vague queries.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl font-bold text-blue-400 mb-1">384D</div>
                                <div className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Embedding Dims</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl font-bold text-purple-400 mb-1">Unit</div>
                                <div className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Vector Norm</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-md">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Live Engine</span>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span>Semantic Weight</span>
                                    <span className="font-mono text-blue-400">0.5</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-400 h-full w-[50%]"></div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span>BM25 Weight</span>
                                    <span className="font-mono text-purple-400">2.0</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-400 h-full w-[100%]"></div>
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-white/10">
                                <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Filter className="w-4 h-4 text-indigo-300" />
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Smart Routing</span>
                                    </div>
                                    <p className="text-[10px] text-indigo-100 leading-relaxed font-light">
                                        Engine automatically shifts weights based on query length and keyword density.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
