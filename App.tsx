
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Mic, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  LayoutGrid, 
  Volume2, 
  Sparkles,
  Sun,
  Moon,
  WifiOff,
  Cpu
} from 'lucide-react';
import StudioView from './views/StudioView';
import ClonerView from './views/ClonerView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import { GenerationHistory } from './types';

const Sidebar = ({ theme, toggleTheme, isOnline }: { theme: string, toggleTheme: () => void, isOnline: boolean }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutGrid, label: 'Voice Studio' },
    { path: '/cloner', icon: Mic, label: 'Voice Cloner' },
    { path: '/history', icon: HistoryIcon, label: 'Library' },
    { path: '/settings', icon: SettingsIcon, label: 'Preferences' },
  ];

  return (
    <aside className="w-72 glass h-screen sticky top-0 flex flex-col p-8 border-r border-white/5 z-50 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-50"></div>
      
      <div className="flex items-center gap-4 mb-16">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 transform -rotate-6">
          <Volume2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground leading-none">VOCAL<span className="text-blue-500">EASE</span></h1>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Studio Pro</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                  : 'text-slate-500 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:translate-x-1'}`} />
              <span className="font-bold text-sm">{item.label}</span>
              {isActive && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 space-y-5">
        {!isOnline && (
          <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 animate-pulse">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-black uppercase">Offline Mode</span>
          </div>
        )}

        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/5 text-slate-400 hover:text-foreground transition-all border border-white/5"
        >
          <span className="text-xs font-bold uppercase tracking-widest">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span>
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 group cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-50"></div>
          <div className="flex items-center gap-2 mb-2 text-indigo-400 relative">
            <Sparkles className="w-4 h-4 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Enterprise API</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 font-medium leading-relaxed relative">Experience unlimited high-fidelity generations.</p>
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 relative">
            UPGRADE NOW
          </button>
        </div>
      </div>
    </aside>
  );
};

function App() {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('vocal_ease_theme') || 'dark');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const saved = localStorage.getItem('vocal_ease_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("History load error", e);
      }
    }
    document.documentElement.className = theme;
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('vocal_ease_theme', newTheme);
    document.documentElement.className = newTheme;
  };

  const addToHistory = (item: GenerationHistory) => {
    setHistory(prev => [item, ...prev]);
    const currentLocal = JSON.parse(localStorage.getItem('vocal_ease_history') || '[]');
    const { audioBlob, ...rest } = item; // Don't store blob in LS
    localStorage.setItem('vocal_ease_history', JSON.stringify([rest, ...currentLocal.slice(0, 49)]));
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-background text-foreground selection:bg-blue-500/30">
        <Sidebar theme={theme} toggleTheme={toggleTheme} isOnline={isOnline} />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="min-h-screen p-10 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<StudioView onGenerate={addToHistory} />} />
              <Route path="/cloner" element={<ClonerView />} />
              <Route path="/history" element={<HistoryView history={history} />} />
              <Route path="/settings" element={<SettingsView theme={theme} onToggleTheme={toggleTheme} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
