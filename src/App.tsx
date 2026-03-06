/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  Mail, 
  Sparkles, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini AI
// Note: process.env.GEMINI_API_KEY is automatically injected by the platform
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [inputEmail, setInputEmail] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const generateReply = async () => {
    if (!inputEmail.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedReply('');

    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Write a professional, polite, and effective email reply to the following message. 
      Ensure the tone is appropriate for a business context. 
      If the original email asks a question, answer it logically. 
      If it's a request, acknowledge it professionally.
      
      Original Email:
      """
      ${inputEmail}
      """
      
      Professional Reply:`;

      const response = await genAI.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.text;
      if (text) {
        setGeneratedReply(text);
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

  const copyToClipboard = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setInputEmail('');
    setGeneratedReply('');
    setError(null);
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
              <a href="#" className="hover:text-indigo-600 transition-colors">How it works</a>
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

              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-md">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">
              AI Email Reply Generator
            </span>
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
