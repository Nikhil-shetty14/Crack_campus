import React, { useState } from 'react';
import { Key, ExternalLink, Sparkles, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { motion } from 'framer-motion';

const ApiKeySetup = () => {
    const [inputValue, setInputValue] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);
    const { saveApiKey } = useApi();
    const [api] = useState(() => axios.create({ baseURL: 'http://localhost:5000' }));

    const handleConnect = async (e) => {
        e.preventDefault();
        const key = inputValue.trim();
        if (!key) return;

        setIsValidating(true);
        setError(null);

        try {
            const response = await api.post('/api/validate-key', { apiKey: key });

            // If there's a warning (busy server but valid key), we can still proceed
            if (response.data.warning) {
                console.warn(response.data.warning);
            }

            saveApiKey(key);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || "Invalid API Key or connection failed. Please try again.");
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-[#0a0e14] border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative"
            >
                {/* Background glow effects */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Key className="h-6 w-6 text-yellow-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Setup API Key</h2>
                    </div>

                    <p className="text-gray-400 mb-8 leading-relaxed">
                        To use the AI Mentor, you need a free Google Gemini API key. Get one
                        from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1 underline decoration-blue-400/30 underline-offset-4">
                            <span>Google AI Studio</span>
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                    </p>

                    <form onSubmit={handleConnect} className="space-y-6">
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Paste your Gemini API key here..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full h-16 px-6 bg-[#161b22] border border-gray-800 rounded-2xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono tracking-widest"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isValidating}
                            className="w-full h-16 bg-[#1f2937] hover:bg-[#2d3748] border border-gray-700 rounded-2xl flex items-center justify-center space-x-3 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 group"
                        >
                            {isValidating ? (
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            ) : (
                                <>
                                    <CheckCircle className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    <span className="text-lg">Connect & Start</span>
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium flex items-center space-x-2"
                        >
                            <span className="flex-1">{error}</span>
                        </motion.div>
                    )}

                    {/* Features list box */}
                    <div className="mt-10 p-6 bg-[#0d1520] border border-blue-900/20 rounded-2xl">
                        <div className="flex items-center space-x-2 mb-4">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">What you'll get:</h4>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Daily problem suggestions based on your weak areas",
                                "Mistake explanations after quizzes",
                                "Custom practice sets by topic & difficulty",
                                "Step-by-step hints (not full solutions)",
                                "Free-form DSA Q&A chat"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-400 group">
                                    <span className="text-blue-500 mr-2 opacity-50">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ApiKeySetup;
