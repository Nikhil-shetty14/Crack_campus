import React, { useState } from 'react';
import api from '../api/config';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronRight, CheckCircle, Info, Loader2, BookOpen, Clock } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import ApiKeySetup from '../components/ApiKeySetup';

const CSECore = () => {
    const { isConfigured } = useApi();
    const [topic, setTopic] = useState('Operating Systems');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAnswers, setShowAnswers] = useState({});

    const topics = ['DBMS', 'Operating Systems', 'Computer Networks', 'OOPS', 'DSA Theory', 'Computer Architecture'];

    const fetchCSE = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/generate-cse', { topic });
            setData(response.data.questions);
            setShowAnswers({});
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAnswer = (id) => {
        setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!isConfigured) {
        return (
            <div className="pt-32 pb-20">
                <div className="text-center mb-12 px-4">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-indigo-500">CSE Core Prep</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">Please setup your API Key to access technical questions.</p>
                </div>
                <ApiKeySetup />
            </div>
        );
    }

    return (
        <div className="pt-24 px-4 max-w-6xl mx-auto min-h-screen">
            <div className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block p-4 rounded-full bg-indigo-500/10 mb-4"
                >
                    <Cpu className="h-10 w-10 text-indigo-500" />
                </motion.div>
                <h1 className="text-4xl font-black mb-4">CSE Core Subjects</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                    Prepare for technical rounds with AI-curated MCQs and descriptive theory questions.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {topics.map(t => (
                    <button
                        key={t}
                        onClick={() => setTopic(t)}
                        className={`px-6 py-2.5 rounded-full font-bold transition-all border-2 ${topic === t
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-400'
                            }`}
                    >
                        {t}
                    </button>
                ))}
                <button
                    onClick={fetchCSE}
                    disabled={loading}
                    className="px-8 py-2.5 rounded-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black hover:scale-105 transition-all shadow-xl flex items-center space-x-2"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <span>Fetch Questions</span>}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-8 flex items-center space-x-2 justify-center">
                    <Info className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            {data && (
                <div className="grid lg:grid-cols-2 gap-8 mb-20">
                    {/* MCQs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold flex items-center space-x-2 mb-4">
                            <BookOpen className="h-6 w-6 text-indigo-500" />
                            <span>Quick MCQs</span>
                        </h2>
                        {data.mcqs.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl group">
                                <h4 className="font-bold mb-4 text-lg">Q{idx + 1}. {q.question}</h4>
                                <div className="grid gap-2 mb-6">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-sm border border-transparent transition-all group-hover:border-gray-200 dark:group-hover:border-gray-700">
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => toggleAnswer(`mcq-${idx}`)}
                                    className="text-indigo-500 font-bold text-sm flex items-center space-x-1 hover:underline"
                                >
                                    <span>{showAnswers[`mcq-${idx}`] ? 'Hide Answer' : 'Show Answer'}</span>
                                    <ChevronRight className={`h-4 w-4 transform transition-transform ${showAnswers[`mcq-${idx}`] ? 'rotate-90' : ''}`} />
                                </button>
                                {showAnswers[`mcq-${idx}`] && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                        <div className="text-green-600 dark:text-green-400 font-black mb-1">Correct Answer: {q.correctAnswer}</div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{q.explanation}</p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </motion.div>

                    {/* Descriptive */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold flex items-center space-x-2 mb-4">
                            <Clock className="h-6 w-6 text-orange-500" />
                            <span>Deep Dive Concepts</span>
                        </h2>
                        {data.descriptive.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl group">
                                <h4 className="font-bold mb-4 text-lg">Q{idx + 1}. {q.question}</h4>
                                <button
                                    onClick={() => toggleAnswer(`desc-${idx}`)}
                                    className="text-orange-500 font-bold text-sm flex items-center space-x-1 hover:underline"
                                >
                                    <span>{showAnswers[`desc-${idx}`] ? 'Hide Answer' : 'Reveal Suggested Answer'}</span>
                                    <ChevronRight className={`h-4 w-4 transform transition-transform ${showAnswers[`desc-${idx}`] ? 'rotate-90' : ''}`} />
                                </button>
                                {showAnswers[`desc-${idx}`] && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                        <p className="text-sm font-medium leading-relaxed mb-4">{q.answer}</p>
                                        <div className="pt-4 border-t border-orange-500/20">
                                            <div className="text-xs uppercase font-bold text-orange-600 mb-1">Deep explanation</div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{q.explanation}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </div>
            )}

            {!data && !loading && (
                <div className="flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500">Pick a topic and click "Fetch Questions" to start</p>
                </div>
            )}
        </div>
    );
};

export default CSECore;
