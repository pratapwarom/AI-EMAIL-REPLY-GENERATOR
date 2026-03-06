/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  Mail, 
  Sparkles, 
  RefreshCw,
  ArrowRight,
  History,
  Trash2,
  Clock,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type HistoryItem = {
  id: string;
  original: string;
  reply: string;
  tone: string;
  timestamp: number;
};

export default function App() {
  const [inputEmail, setInputEmail] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('email_reply_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('email_reply_history', JSON.stringify(history));
  }, [history]);

  const generateReply = async () => {
    if (!inputEmail.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedReply('');

    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Write a ${tone.toLowerCase()} email reply to the following message. 
      The reply should be ${length.toLowerCase()} in length.
      Ensure the tone is ${tone.toLowerCase()} and appropriate for the context. 
      If the original email asks a question, answer it logically. 
      If it's a request, acknowledge it appropriately.
      
      Original Email:
      """
      ${inputEmail}
      """
      
      ${tone} Reply (${length}):`;

      const response = await genAI.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.text;
      if (text) {
        setGeneratedReply(text);
        
        // Add to history
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substring(7),
          original: inputEmail,
          reply: text,
          tone: tone,
          timestamp: Date.now(),
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10

        // Scroll to result on desktop
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error("No response generated");
      }
    } catch (err) {
      console.error("Error generating reply:", err);
      setError("Failed to generate reply. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (textToCopy: string = generatedReply) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setInputEmail('');
    setGeneratedReply('');
    setError(null);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const useHistoryItem = (item: HistoryItem) => {
    setInputEmail(item.original);
    setGeneratedReply(item.reply);
    setTone(item.tone);
    setShowHistory(false);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                AI Email Reply <span className="text-indigo-600">Generator</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
              >
                <History className="w-4 h-4" />
                History
              </button>
              <a href="#" className="hover:text-indigo-600 transition-colors">Templates</a>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-all">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-4 text-center bg-gradient-to-b from-indigo-50/50 to-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
              Powered by Gemini AI
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Generate Professional Email <br className="hidden sm:block" />
              Replies in <span className="text-indigo-600 italic">Seconds</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
              Stop stressing over the perfect wording. Paste any email message and let our AI create a polished, professional response tailored to your needs.
            </p>
          </motion.div>
        </section>

        {/* Input Section */}
        <section className="max-w-4xl mx-auto px-4 pb-24">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="email-input" className="block text-sm font-semibold text-slate-700">
                  Paste the email you received
                </label>
                <button 
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Clear
                </button>
              </div>
              
              <div className="relative group">
                <textarea
                  id="email-input"
                  rows={8}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-700 placeholder:text-slate-400"
                  placeholder="Paste the email message here... (e.g., 'Hi, I'm interested in your services...')"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                  {inputEmail.length} characters
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reply Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Professional', 'Friendly', 'Urgent', 'Apologetic'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          tone === t 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reply Length</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['Short', 'Medium', 'Long'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLength(l)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          length === l 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  AI will generate a professional business response.
                </p>
                <button
                  onClick={generateReply}
                  disabled={isLoading || !inputEmail.trim()}
                  className={`
                    w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all
                    ${isLoading || !inputEmail.trim() 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]'}
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Reply
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Section */}
          <AnimatePresence>
            {generatedReply && (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="mt-12"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Your AI Reply is Ready</h2>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-indigo-50 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generated Response</span>
                    <button
                      onClick={copyToClipboard}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${isCopied 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}
                      `}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="prose prose-slate max-w-none">
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                        {generatedReply}
                      </p>
                    </div>
                  </div>
                  <div className="px-8 py-6 bg-indigo-600 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-indigo-100 text-sm font-medium">
                      Satisfied with this reply?
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={generateReply}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate
                      </button>
                      <button 
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95"
                      >
                        Copy & Use
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* History Modal/Overlay */}
          <AnimatePresence>
            {showHistory && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowHistory(false)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                />
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
                >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-600" />
                      <h2 className="font-bold text-slate-900">Recent Replies</h2>
                    </div>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                    </button>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {history.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm">No history yet. Generate a reply to see it here!</p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <div 
                          key={item.id}
                          className="group p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer relative"
                          onClick={() => useHistoryItem(item)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {item.tone}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 font-medium line-clamp-2 mb-1">
                            {item.original}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {history.length > 0 && (
                    <div className="p-6 border-t border-slate-100">
                      <button 
                        onClick={clearHistory}
                        className="w-full py-3 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All History
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1 rounded-md">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">
                AI Email Reply Generator
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">v4.0.0</span>
            </div>
            <p className="text-xs text-slate-500">Professional email communication, simplified.</p>
          </div>
          
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="text-sm flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-bold text-white">Gemini API</span>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; {new Date().getFullYear()} AI Email Reply Generator. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
