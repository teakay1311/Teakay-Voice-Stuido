
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Cpu, 
  ChevronRight,
  ExternalLink,
  Sun,
  Download,
  CheckCircle2,
  Trash2,
  CloudDownload,
  Loader2,
  PackageCheck,
  Moon,
  Globe
} from 'lucide-react';
import { VOICES, LANGUAGES } from '../constants';

interface SettingsViewProps {
  theme: string;
  onToggleTheme: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, onToggleTheme }) => {
  const [quality, setQuality] = useState(() => localStorage.getItem('vocalease_quality') || 'High Fidelity');
  const [latency, setLatency] = useState(() => localStorage.getItem('vocalease_latency') || '1.2s');
  const [globalLang, setGlobalLang] = useState(() => localStorage.getItem('vocalease_global_lang') || 'Tiếng Việt');
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [downloadedModels, setDownloadedModels] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('vocalease_downloaded_models') || '[]');
  });

  const handleDownload = (id: string) => {
    if (isBulkDownloading) return;
    setDownloadingId(id);
    setTimeout(() => {
      const newList = [...new Set([...downloadedModels, id])];
      setDownloadedModels(newList);
      localStorage.setItem('vocalease_downloaded_models', JSON.stringify(newList));
      setDownloadingId(null);
    }, 1500);
  };

  const handleBulkDownload = async () => {
    const voicesToDownload = VOICES.filter(v => !downloadedModels.includes(v.id));
    if (voicesToDownload.length === 0) return;

    setIsBulkDownloading(true);
    setBulkProgress(0);

    for (let i = 0; i <= voicesToDownload.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setBulkProgress(Math.round((i / voicesToDownload.length) * 100));
    }

    const allIds = VOICES.map(v => v.id);
    setDownloadedModels(allIds);
    localStorage.setItem('vocalease_downloaded_models', JSON.stringify(allIds));
    setIsBulkDownloading(false);
    setBulkProgress(0);
  };

  const toggleQuality = () => {
    const next = quality === 'High Fidelity' ? 'Standard' : 'High Fidelity';
    setQuality(next);
    localStorage.setItem('vocalease_quality', next);
  };

  const toggleLatency = () => {
    const next = latency === '1.2s' ? '0.8s' : '1.2s';
    setLatency(next);
    localStorage.setItem('vocalease_latency', next);
  };

  const toggleLanguage = () => {
    const currentIdx = LANGUAGES.findIndex(l => l.name === globalLang);
    const nextIdx = (currentIdx + 1) % LANGUAGES.length;
    const nextLang = LANGUAGES[nextIdx].name;
    setGlobalLang(nextLang);
    localStorage.setItem('vocalease_global_lang', nextLang);
  };

  const removeModel = (id: string) => {
    const newList = downloadedModels.filter(m => m !== id);
    setDownloadedModels(newList);
    localStorage.setItem('vocalease_downloaded_models', JSON.stringify(newList));
  };

  const removeAllModels = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả các mô hình đã tải xuống?")) {
      setDownloadedModels([]);
      localStorage.setItem('vocalease_downloaded_models', JSON.stringify([]));
    }
  };

  const allDownloaded = downloadedModels.length === VOICES.length;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10">
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-500" />
          Cài đặt
        </h2>
        <p className="text-slate-500 text-sm font-medium">Cấu hình trải nghiệm cá nhân hóa và quản lý ngoại tuyến.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* AI System Card */}
          <div className="glass rounded-[2.5rem] p-8 transition-all hover:ring-1 hover:ring-blue-500/20 bg-white/5 dark:bg-slate-900/40">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-sm shadow-blue-500/5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">Hệ thống AI</h3>
            </div>
            
            <div className="space-y-8">
              <div onClick={toggleQuality} className="flex items-center justify-between group cursor-pointer">
                <div>
                  <div className="text-lg font-black text-foreground">Chất lượng giọng nói</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Sử dụng mô hình Gemini 2.5 Flash HD</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800 transition-colors group-hover:bg-blue-100">
                    {quality}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>

              <div onClick={toggleLatency} className="flex items-center justify-between group cursor-pointer">
                <div>
                  <div className="text-lg font-black text-foreground">Độ trễ xử lý</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Ưu tiên tốc độ phản hồi</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800 transition-colors group-hover:bg-blue-100">
                    {latency}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Interface Card */}
          <div className="glass rounded-[2.5rem] p-8 transition-all hover:ring-1 hover:ring-blue-500/20 bg-white/5 dark:bg-slate-900/40">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-sm shadow-indigo-500/5">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">Giao diện</h3>
            </div>
            
            <div className="space-y-8">
              <div onClick={onToggleTheme} className="flex items-center justify-between group cursor-pointer">
                <div>
                  <div className="text-lg font-black text-foreground">Chế độ hiển thị</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Thay đổi giữa giao diện Sáng và Tối</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800 transition-colors group-hover:bg-blue-100">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>

              <div onClick={toggleLanguage} className="flex items-center justify-between group cursor-pointer">
                <div>
                  <div className="text-lg font-black text-foreground">Ngôn ngữ</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Sử dụng mặc định trong Studio</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800 transition-colors group-hover:bg-blue-100">
                    {LANGUAGES.find(l => l.name === globalLang)?.code.toUpperCase()}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Model Management Section */}
      <div className="glass rounded-[32px] p-8 relative overflow-hidden mb-8 border border-white/5 bg-white/5 dark:bg-slate-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
              <CloudDownload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Quản lý Mô hình Ngoại tuyến</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Sử dụng AI ngay cả khi không có mạng</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {downloadedModels.length > 0 && (
              <button 
                onClick={removeAllModels}
                className="px-5 py-3 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
              >
                XÓA TẤT CẢ
              </button>
            )}
            <button
              onClick={handleBulkDownload}
              disabled={isBulkDownloading || allDownloaded}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                allDownloaded 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isBulkDownloading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> ĐANG TẢI {bulkProgress}%</>
              ) : allDownloaded ? (
                <><PackageCheck className="w-4 h-4" /> ĐÃ TẢI TOÀN BỘ</>
              ) : (
                <><CloudDownload className="w-4 h-4" /> TẢI TẤT CẢ ({VOICES.length - downloadedModels.length})</>
              )}
            </button>
          </div>
        </div>

        {isBulkDownloading && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Tiến trình đồng bộ dữ liệu</span>
              <span className="text-[10px] font-black text-blue-500">{bulkProgress}%</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                style={{ width: `${bulkProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[440px] overflow-y-auto custom-scrollbar pr-2">
          {VOICES.map(voice => {
            const isDownloaded = downloadedModels.includes(voice.id);
            const isDownloading = downloadingId === voice.id;

            return (
              <div key={voice.id} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all group ${
                isDownloaded ? 'bg-blue-500/5 border-blue-500/20' : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-blue-500/20'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base relative shadow-md" style={{ backgroundColor: voice.color }}>
                    {voice.name.charAt(0)}
                    {isDownloaded && (
                      <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-slate-900 rounded-full p-1 text-green-500 shadow-sm border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground">{voice.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{voice.style} • AI Model</div>
                  </div>
                </div>
                
                {isDownloaded ? (
                  <button 
                    onClick={() => removeModel(voice.id)}
                    disabled={isBulkDownloading}
                    className="p-3 rounded-2xl text-green-500 hover:bg-red-500/10 hover:text-red-500 transition-all disabled:opacity-30"
                    title="Xóa mô hình"
                  >
                    <CheckCircle2 className="w-6 h-6 group-hover:hidden" />
                    <Trash2 className="w-6 h-6 hidden group-hover:block" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDownload(voice.id)}
                    disabled={downloadingId !== null || isBulkDownloading}
                    className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 border border-blue-500/10"
                    title="Tải xuống"
                  >
                    {isDownloading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
