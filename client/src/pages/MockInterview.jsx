import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, Sparkles, AlertCircle, Quote } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import ApiKeySetup from '../components/ApiKeySetup';

const MockInterview = () => {
    const { isConfigured } = useApi();
    const [question, setQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState(null);

    const fetchQuestion = async () => {
        setLoading(true);
        setError(null);
        setEvaluation(null);
        setUserAnswer('');
        try {
            const response = await api.get('/api/get-interview-question');
            setQuestion(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch interview question. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async (e) => {
        e.preventDefault();
        if (!userAnswer.trim()) return;
        setEvaluating(true);
        setError(null);
        try {
            const response = await api.post('/api/evaluate-answer', {
                question: question.question,
                userAnswer
            });
            setEvaluation(response.data.evaluation);

            // Save to dashboard stats
            const stats = JSON.parse(localStorage.getItem('interview_stats') || '[]');
            stats.push({
                topic: question.topic,
                score: response.data.evaluation.correctness,
                date: new Date().toISOString()
            });
            localStorage.setItem('interview_stats', JSON.stringify(stats));

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to evaluate answer. Try again.');
        } finally {
            setEvaluating(false);
        }
    };

    useEffect(() => {
        if (isConfigured) {
            fetchQuestion();
        }
    }, [isConfigured]);

    if (!isConfigured) {
        return (
            <div className="pt-32 pb-20">
                <div className="text-center mb-12 px-4">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-purple-500">Mock Interview</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">Please setup your API Key to access real-time AI feedback.</p>
                </div>
                <ApiKeySetup />
            </div>
        );
    }

    return (
        <div className="pt-24 px-4 max-w-4xl mx-auto min-h-screen">
            <div className="flex items-center space-x-3 mb-10">
                <div className="p-3 bg-purple-500/10 rounded-2xl">
                    <MessageSquare className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-black">Mock Interview</h2>
                    <p className="text-gray-500 dark:text-gray-400">Answer technical questions and get real-time AI feedback.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-8 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="relative mb-12">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="p-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed"
                        >
                            <Loader2 className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Generating your technical question...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Quote className="h-32 w-32 rotate-180" />
                            </div>

                            <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-tighter mb-4">
                                Topic: {question?.topic}
                            </div>

                            <h3 className="text-2xl md:text-3xl font-extrabold mb-10 leading-snug">
                                {question?.question}
                            </h3>

                            <form onSubmit={handleEvaluate} className="relative">
                                <textarea
                                    className="w-full h-40 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500 outline-none transition-all resize-none shadow-inner"
                                    placeholder="Type your technical explanation here..."
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    disabled={evaluating || evaluation}
                                />
                                {!evaluation && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={evaluating || !userAnswer.trim()}
                                        className="absolute bottom-4 right-4 p-4 rounded-xl bg-purple-600 text-white shadow-xl flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        {evaluating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                        <span className="font-bold">Submit Answer</span>
                                    </motion.button>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {evaluation && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl space-y-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black">AI Feedback</h4>
                                <p className="text-white/60 text-sm">Verdict: {evaluation.verdict}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                                <div className="text-3xl font-black">{evaluation.correctness}/10</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-white/50">Correctness</div>
                            </div>
                            <div className="text-center bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                                <div className="text-3xl font-black">{evaluation.confidence}/10</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-white/50">Confidence</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/10 rounded-2xl border border-white/20">
                        <h5 className="font-bold mb-3 flex items-center space-x-2">
                            <span>Suggestions for Improvement</span>
                        </h5>
                        <p className="text-white/80 leading-relaxed italic">{evaluation.suggestions}</p>
                    </div>

                    <button
                        onClick={fetchQuestion}
                        className="w-full py-4 bg-white text-purple-700 font-extrabold rounded-2xl shadow-xl hover:bg-gray-50 transition-colors"
                    >
                        Next Question
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default MockInterview;
