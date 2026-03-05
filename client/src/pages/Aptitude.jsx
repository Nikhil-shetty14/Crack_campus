import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Timer, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useApi } from '../context/ApiContext';
import ApiKeySetup from '../components/ApiKeySetup';

const Aptitude = () => {
    const { isConfigured } = useApi();
    const [topic, setTopic] = useState('Percentage');
    const [difficulty, setDifficulty] = useState('Medium');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(300); // 5 minutes
    const [isTestStarted, setIsTestStarted] = useState(false);

    const topics = [
        'Percentage', 'Time & Work', 'Profit & Loss', 'Averages', 'Ratios',
        'Ages', 'Logical Reasoning', 'Letter & Data Series', 'Clock & Calendar'
    ];

    useEffect(() => {
        let interval;
        if (isTestStarted && !isSubmitted && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            handleAutoSubmit();
        }
        return () => clearInterval(interval);
    }, [isTestStarted, isSubmitted, timer]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/generate-aptitude', {
                topic,
                difficulty
            });
            setQuestions(response.data.questions);
            setIsTestStarted(true);
            setTimer(difficulty === 'Hard' ? 450 : 300);
        } catch (err) {
            setError(err.response?.data?.error || 'Wait for 10-15 seconds and try again. API limits might be reached.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (option) => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [currentQuestionIndex]: option });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        let finalScore = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] && answers[idx].charAt(0) === q.correctAnswer) {
                finalScore++;
            }
        });
        setScore(finalScore);
        setIsSubmitted(true);

        // Save to local storage for dashboard
        const stats = JSON.parse(localStorage.getItem('aptitude_stats') || '[]');
        stats.push({ topic, score: finalScore, total: questions.length, date: new Date().toISOString(), difficulty });
        localStorage.setItem('aptitude_stats', JSON.stringify(stats));
    };

    const handleAutoSubmit = () => {
        if (!isSubmitted) handleSubmit();
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!isConfigured) {
        return (
            <div className="pt-32 pb-20">
                <div className="text-center mb-12 px-4">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-blue-500">Aptitude Prep</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">Please setup your API Key to access practice tests.</p>
                </div>
                <ApiKeySetup />
            </div>
        );
    }

    if (!isTestStarted) {
        return (
            <div className="pt-24 px-4 max-w-4xl mx-auto min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Brain className="h-10 w-10 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold">Aptitude Practice</h2>
                            <p className="text-gray-500 dark:text-gray-400">Select a topic and difficulty to begin</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Topic</label>
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                            <div className="flex space-x-2">
                                {['Easy', 'Medium', 'Hard'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={`flex-1 py-4 px-4 rounded-xl font-bold transition-all ${difficulty === d
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={fetchQuestions}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Start Test Now'}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="pt-24 px-4 max-w-5xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Question Panel */}
                <div className="flex-1">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <div className={`flex items-center space-x-2 font-mono font-bold ${timer < 60 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                                <Timer className="h-5 w-5" />
                                <span>{formatTime(timer)}</span>
                            </div>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">
                            {currentQ.question}
                        </h3>

                        <div className="grid gap-4">
                            {currentQ.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={isSubmitted}
                                    className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${answers[currentQuestionIndex] === option
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner'
                                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                        } ${isSubmitted && option.charAt(0) === currentQ.correctAnswer
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : ''
                                        } ${isSubmitted && answers[currentQuestionIndex] === option && option.charAt(0) !== currentQ.correctAnswer
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : ''
                                        }`}
                                >
                                    <span className="font-medium">{option}</span>
                                    {isSubmitted && option.charAt(0) === currentQ.correctAnswer && <CheckCircle className="text-green-500 h-5 w-5" />}
                                    {isSubmitted && answers[currentQuestionIndex] === option && option.charAt(0) !== currentQ.correctAnswer && <XCircle className="text-red-500 h-5 w-5" />}
                                </button>
                            ))}
                        </div>

                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-l-4 border-blue-500"
                            >
                                <h4 className="font-bold mb-2 flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-blue-500" />
                                    <span>Explanation</span>
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{currentQ.explanation}</p>
                            </motion.div>
                        )}

                        <div className="flex justify-between items-center mt-10">
                            <button
                                onClick={handlePrev}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-50 font-bold"
                            >
                                Previous
                            </button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                !isSubmitted && (
                                    <button
                                        onClick={handleSubmit}
                                        className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:scale-105"
                                    >
                                        Submit Test
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold flex items-center space-x-2"
                                >
                                    <span>Next</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Status */}
                <div className="w-full md:w-64">
                    {isSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8 text-center"
                        >
                            <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2 font-bold">Your Score</h3>
                            <div className="text-4xl font-black text-blue-500 mb-4">{score} / {questions.length}</div>
                            <div className="text-xs text-gray-400">Accuracy: {(score / questions.length * 100).toFixed(1)}%</div>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 w-full py-3 bg-gray-100 dark:bg-gray-900 rounded-xl text-sm font-bold"
                            >
                                Try Another Topic
                            </button>
                        </motion.div>
                    )}

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold mb-4">Question Map</h4>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${currentQuestionIndex === idx ? 'ring-2 ring-blue-500' : ''
                                        } ${isSubmitted
                                            ? answers[idx] && answers[idx].charAt(0) === questions[idx].correctAnswer
                                                ? 'bg-green-500 text-white'
                                                : 'bg-red-500 text-white'
                                            : answers[idx] ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Aptitude;
