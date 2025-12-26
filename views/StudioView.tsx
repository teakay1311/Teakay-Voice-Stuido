
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { VOICES, EMOTIONS, LANGUAGES } from '../constants';
import { Emotion, GenerationHistory, VoiceProfile } from '../types';
import { geminiService } from '../services/geminiService';
import { audioBufferToWav } from '../utils/audioUtils';
import { 
  Play, 
  Download, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Ear, 
  Share2, 
  Mic2, 
  Activity, 
  Trash2, 
  Settings2, 
  WifiOff, 
  CloudOff, 
  CheckCircle2,
  Type
} from 'lucide-react';

interface StudioViewProps {
  onGenerate: (item: GenerationHistory) => void;
}

const AGE_GROUPS = ['Tất cả', 'Trẻ em', 'Thiếu niên', 'Người lớn', 'Người già'];

const CollapsiblePanel: React.FC<{
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string | number;
  children: React.ReactNode;
  accentColor?: string;
}> = ({ title, icon: Icon, isOpen, onToggle, badge, children, accentColor = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-500 bg-blue-500/10",
    indigo: "text-indigo-500 bg-indigo-500/10"
  }[accentColor as 'blue' | 'indigo'];

  return (
    <div className="space-y-3">
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-6 py-4 glass rounded-3xl transition-all duration-300 ${isOpen ? 'ring-2 ring-blue-500/20' : 'hover:bg-white/5'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${colorClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {badge !== undefined && <span className="text-xs text-slate-500 font-bold bg-white/5 px-2 py-1 rounded-lg">{badge}</span>}
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>
      {isOpen && <div className="animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

const StudioView: React.FC<StudioViewProps> = ({ onGenerate }) => {
  const [text, setText] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState(() => localStorage.getItem('vocalease_pref_persona') || 'be_na');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('Tất cả');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(() => (localStorage.getItem('vocalease_pref_emotion') as Emotion) || Emotion.NEUTRAL);
  const [language, setLanguage] = useState(() => localStorage.getItem('vocalease_pref_lang') || 'Tiếng Việt');
  const [speed, setSpeed] = useState(() => parseFloat(localStorage.getItem('vocalease_pref_speed') || '1'));
  const [pitch, setPitch] = useState(() => parseFloat(localStorage.getItem('vocalease_pref_pitch') || '1'));

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  const [lastAudio, setLastAudio] = useState<{ blob: Blob, url: string, filename: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedModels] = useState<string[]>(() => JSON.parse(localStorage.getItem('vocalease_downloaded_models') || '[]'));
  
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(true);
  const [showPerformance, setShowPerformance] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync from global settings if changed
    const globalLang = localStorage.getItem('vocalease_global_lang');
    if (globalLang) setLanguage(globalLang);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('vocalease_pref_persona', selectedPersonaId);
    localStorage.setItem('vocalease_pref_emotion', selectedEmotion);
    localStorage.setItem('vocalease_pref_lang', language);
    localStorage.setItem('vocalease_pref_speed', speed.toString());
    localStorage.setItem('vocalease_pref_pitch', pitch.toString());
  }, [selectedPersonaId, selectedEmotion, language, speed, pitch]);

  const filteredVoices = useMemo(() => {
    return VOICES.filter(v => {
      if (selectedAgeGroup === 'Tất cả') return true;
      const age = parseInt(v.age);
      if (selectedAgeGroup === 'Trẻ em') return age < 13;
      if (selectedAgeGroup === 'Thiếu niên') return age >= 13 && age < 20;
      if (selectedAgeGroup === 'Người lớn') return age >= 20 && age < 60;
      if (selectedAgeGroup === 'Người già') return age >= 60;
      return true;
    });
  }, [selectedAgeGroup]);

  const selectedPersona = VOICES.find(v => v.id === selectedPersonaId) || VOICES[0];

  const playAudio = (buffer: AudioBuffer, context: AudioContext) => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
    }
    if (buffer.length > 1) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
      currentSourceRef.current = source;
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    const isAvailableOffline = downloadedModels.includes(selectedPersonaId);
    if (!isOnline && !isAvailableOffline) {
      alert("Giọng nói này chưa được tải xuống để sử dụng ngoại tuyến.");
      return;
    }

    setIsGenerating(true);
    try {
      const { audioBuffer, audioContext } = await geminiService.generateSpeech(
        text, selectedPersonaId, selectedEmotion, language, speed, pitch
      );
      audioContextRef.current = audioContext;
      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      const filename = `vocalease-${selectedPersonaId}-${Date.now()}.wav`;
      
      setLastAudio({ blob: wavBlob, url, filename });
      onGenerate({ id: crypto.randomUUID(), text, voiceId: selectedPersonaId, emotion: selectedEmotion, speed, pitch, audioBlob: wavBlob, createdAt: Date.now(), language });
      playAudio(audioBuffer, audioContext);
    } catch (error) {
      console.error(error);
      alert("Lỗi tạo giọng nói. Vui lòng kiểm tra API Key.");
    } finally { setIsGenerating(false); }
  };

  const handlePreview = async (personaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOnline && !downloadedModels.includes(personaId)) return;
    setIsPreviewing(personaId);
    try {
      const { audioBuffer, audioContext } = await geminiService.previewVoice(personaId, language);
      audioContextRef.current = audioContext;
      playAudio(audioBuffer, audioContext);
    } catch (error) {} finally { setIsPreviewing(null); }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Studio Edition</div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" /> High Fidelity
            </div>
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Voice <span className="text-blue-600">Studio</span></h2>
          <p className="text-slate-400 font-medium">Biến văn bản thành giọng nói cảm xúc với công nghệ AI tiên tiến.</p>
        </div>
        
        {!isOnline && (
          <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-500">
            <CloudOff className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Môi trường ngoại tuyến</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Editor Area */}
        <div className="xl:col-span-7 space-y-6">
          <div className="glass rounded-[2rem] p-8 border border-white/5 relative group premium-shadow overflow-hidden bg-white/5 dark:bg-slate-900/40">
             {/* Removing distracting floating icon for better UX */}
             <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                    <Type className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Trình soạn thảo nội dung</h3>
                </div>
                <div className="flex gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                  {LANGUAGES.map(lang => (
                    <button 
                      key={lang.code} 
                      onClick={() => setLanguage(lang.name)} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all duration-300 ${language === lang.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-foreground'}`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
             </div>
             
             <textarea
                className="w-full h-64 bg-transparent text-foreground placeholder-slate-600 focus:outline-none resize-none font-medium text-xl leading-relaxed custom-scrollbar relative z-10"
                placeholder="Bắt đầu nhập nội dung tại đây... Hãy sử dụng dấu câu để giọng nói tự nhiên hơn."
                value={text}
                onChange={(e) => setText(e.target.value)}
             />

             <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5 relative">
                <button 
                  onClick={() => setText('')} 
                  className="px-4 py-2 text-slate-500 hover:text-red-500 transition-colors text-xs font-bold flex items-center gap-2 group"
                >
                  <Trash2 className="w-4 h-4 transition-transform group-hover:rotate-12" /> Xóa toàn bộ
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !text.trim()}
                  className={`px-10 py-4 text-white text-xs font-black rounded-2xl shadow-2xl transition-all flex items-center gap-3 active:scale-95 ${!isOnline && !downloadedModels.includes(selectedPersonaId) ? 'bg-slate-800 cursor-not-allowed grayscale' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'}`}
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                  {isOnline ? 'CHUYỂN THÀNH GIỌNG NÓI' : 'TẠO NGOẠI TUYẾN'}
                </button>
             </div>
          </div>

          {lastAudio && (
            <div className="glass rounded-[2rem] p-6 border-l-8 border-blue-600 animate-in slide-in-from-bottom-6 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                      const ctx = audioContextRef.current || new AudioContext();
                      fetch(lastAudio.url).then(r => r.arrayBuffer()).then(ab => ctx.decodeAudioData(ab)).then(b => playAudio(b, ctx));
                    }} 
                    className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 active:scale-90 transition-transform"
                  >
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  </button>
                  <div>
                    <div className="text-xl font-black text-foreground mb-1">{selectedPersona.name}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md">{selectedEmotion}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md">{speed}X Tempo</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href={lastAudio.url} download={lastAudio.filename} className="p-4 rounded-2xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20" title="Tải xuống WAV">
                    <Download className="w-5 h-5" />
                  </a>
                  <button className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-foreground transition-all border border-white/5">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Area */}
        <div className="xl:col-span-5 space-y-4">
          <CollapsiblePanel 
            title="Thư viện giọng nói" icon={Mic2} isOpen={showVoiceLibrary} onToggle={() => setShowVoiceLibrary(!showVoiceLibrary)}
            badge={`${filteredVoices.length} Mẫu`} accentColor="blue"
          >
            <div className="glass rounded-[2rem] p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map(age => (
                  <button 
                    key={age} 
                    onClick={() => setSelectedAgeGroup(age)} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedAgeGroup === age ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                  >
                    {age}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto custom-scrollbar pr-2">
                {filteredVoices.map(v => {
                  const isActive = selectedPersonaId === v.id;
                  const isReadyOffline = downloadedModels.includes(v.id);
                  return (
                    <div 
                      key={v.id} 
                      onClick={() => setSelectedPersonaId(v.id)} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col items-center text-center ${isActive ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                    >
                      <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-sm font-black text-white shadow-lg transform group-hover:-translate-y-1 transition-transform" style={{ backgroundColor: v.color }}>
                        {v.name.charAt(0)}
                      </div>
                      <div className={`text-[10px] font-black truncate max-w-full ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>{v.name}</div>
                      
                      {isReadyOffline && (
                        <div className="absolute top-2 left-2 text-green-500 drop-shadow-md">
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </div>
                      )}

                      <button 
                        onClick={(e) => handlePreview(v.id, e)} 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/60 text-white hover:bg-blue-600 transition-all backdrop-blur-md"
                        title="Nghe thử"
                      >
                        {isPreviewing === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ear className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel 
            title="Hiệu năng & Cảm xúc" icon={Activity} isOpen={showPerformance} onToggle={() => setShowPerformance(!showPerformance)} accentColor="indigo"
          >
            <div className="glass rounded-[2rem] p-8 space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 block">Bộ lọc cảm xúc</label>
                <div className="grid grid-cols-3 gap-2">
                  {EMOTIONS.slice(0, 9).map(e => (
                    <button 
                      key={e} 
                      onClick={() => setSelectedEmotion(e)} 
                      className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${selectedEmotion === e ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6 pt-4">
                <div className="group">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    <span className="group-hover:text-blue-500 transition-colors">Tốc độ (Speed)</span>
                    <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">{speed}X</span>
                  </div>
                  <input type="range" min="0.5" max="1.8" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div className="group">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    <span className="group-hover:text-indigo-500 transition-colors">Cao độ (Pitch)</span>
                    <span className="text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">{pitch}X</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>
          </CollapsiblePanel>
        </div>

      </div>
    </div>
  );
};

export default StudioView;
