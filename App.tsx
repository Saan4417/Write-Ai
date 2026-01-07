
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { generateMovieScript, StoryLength } from './services/geminiService';
import { ScriptOutput, AppStatus } from './types';
import { ScriptViewer } from './components/ScriptViewer';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [storyLength, setStoryLength] = useState<StoryLength>('standard');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<ScriptOutput | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setStatus(AppStatus.GENERATING);
    setError(null);
    try {
      const script = await generateMovieScript(prompt, storyLength);
      setResult(script);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err?.message?.includes('API_KEY') 
        ? 'Invalid API Key configuration.' 
        : 'Script generation failed. The idea might be too complex or blocked by safety filters.');
      setStatus(AppStatus.ERROR);
    }
  };

  const loadingPhrases = [
    "Developing characters...",
    "Brainstorming plot twists...",
    "Writing dramatic dialogues...",
    "Staging the climax...",
    "Finalizing the storyboard..."
  ];

  const [loadingText, setLoadingText] = useState(loadingPhrases[0]);

  useEffect(() => {
    let interval: any;
    if (status === AppStatus.GENERATING) {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % loadingPhrases.length;
        setLoadingText(loadingPhrases[idx]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const lengthOptions: { id: StoryLength; label: string; desc: string; icon: string }[] = [
    { id: 'concise', label: 'Short', desc: 'Punchy & Fast', icon: 'fa-feather' },
    { id: 'standard', label: 'Standard', desc: 'Balanced depth', icon: 'fa-book' },
    { id: 'extended', label: 'Long', desc: 'Epic Magnum Opus', icon: 'fa-scroll' }
  ];

  return (
    <Layout darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)}>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4 no-print">
          <h2 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight">
            Apna idea do, <span className="text-indigo-600">AI poori film</span> bana dega
          </h2>
          <p className="text-lg opacity-60 max-w-2xl mx-auto">
            Transform your logline into a professional cinematic script with character profiles and scene breakdowns.
          </p>
        </div>

        {/* Input Form */}
        <div className={`p-6 rounded-2xl shadow-xl border transition-all no-print ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Your Story Idea</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: A high-stakes heist in a floating city above the clouds..."
                className={`w-full p-4 bg-transparent border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg resize-none min-h-[140px] ${
                  darkMode ? 'text-white border-slate-700 bg-slate-900/50' : 'text-gray-800 border-gray-200 bg-gray-50/50'
                }`}
              />
            </div>

            {/* Length Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Script Length</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {lengthOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStoryLength(opt.id)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      storyLength === opt.id 
                      ? 'border-indigo-600 bg-indigo-600/10 ring-2 ring-indigo-600/20' 
                      : darkMode ? 'border-slate-700 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <i className={`fa-solid ${opt.icon} ${storyLength === opt.id ? 'text-indigo-500' : 'opacity-40'}`}></i>
                      <span className="font-bold">{opt.label}</span>
                    </div>
                    <p className="text-xs opacity-50">{opt.desc}</p>
                    {storyLength === opt.id && (
                      <div className="absolute top-2 right-2">
                        <i className="fa-solid fa-circle-check text-indigo-500 text-xs"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/10">
              <span className={`text-xs opacity-50 ${prompt.length > 500 ? 'text-orange-500' : ''}`}>
                {prompt.length} characters
              </span>
              <button
                onClick={handleGenerate}
                disabled={status === AppStatus.GENERATING || !prompt.trim()}
                className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  status === AppStatus.GENERATING 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 active:scale-95'
                }`}
              >
                {status === AppStatus.GENERATING ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i> Writing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Script
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status / Error States */}
        {status === AppStatus.GENERATING && (
          <div className="mt-12 text-center animate-pulse">
            <div className="flex justify-center mb-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-xl font-medium">{loadingText}</p>
            <p className="text-xs opacity-40 mt-2">This may take a minute for longer scripts.</p>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Result Viewer */}
        {status === AppStatus.SUCCESS && result && (
          <ScriptViewer script={result} darkMode={darkMode} />
        )}

        {/* Hero Illustration Placeholder */}
        {!result && status === AppStatus.IDLE && (
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-40 grayscale no-print">
            <div className="p-6 rounded-2xl border border-dashed border-gray-400 dark:border-slate-600 text-center">
              <i className="fa-solid fa-film text-2xl mb-2"></i>
              <p className="text-[10px] font-bold uppercase tracking-widest">Cinematic Logic</p>
            </div>
            <div className="p-6 rounded-2xl border border-dashed border-gray-400 dark:border-slate-600 text-center">
              <i className="fa-solid fa-language text-2xl mb-2"></i>
              <p className="text-[10px] font-bold uppercase tracking-widest">Bi-lingual Output</p>
            </div>
            <div className="p-6 rounded-2xl border border-dashed border-gray-400 dark:border-slate-600 text-center">
              <i className="fa-solid fa-file-pdf text-2xl mb-2"></i>
              <p className="text-[10px] font-bold uppercase tracking-widest">Studio PDF Ready</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
