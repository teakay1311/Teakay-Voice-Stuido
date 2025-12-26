
import React from 'react';
import { GenerationHistory } from '../types';
import { Play, Download, Trash2, Calendar, MessageSquare, User, AudioLines, Clock } from 'lucide-react';
import { VOICES } from '../constants';

interface HistoryViewProps {
  history: GenerationHistory[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getVoice = (id: string) => VOICES.find(v => v.id === id) || VOICES[0];

  const handleDownload = (blob: Blob, voiceId: string, timestamp: number) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VocalEase_${voiceId}_${timestamp}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePlay = async (blob: Blob) => {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">My <span className="text-blue-600">Library</span></h2>
          <p className="text-slate-400 font-medium">Quản lý các bản thu âm và sáng tạo của bạn.</p>
        </div>
        <div className="px-6 py-3 glass rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="flex items-center gap-2 text-blue-500">
            <AudioLines className="w-5 h-5" />
            <span className="text-xl font-black">{history.length}</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Items Stored</span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="glass rounded-[3rem] p-24 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10">
          <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-8 text-blue-500 ring-8 ring-blue-600/5">
            <Clock className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black mb-3">Thư viện trống</h3>
          <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">Các bản lồng tiếng bạn tạo sẽ xuất hiện tại đây để tải xuống và quản lý.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item) => {
            const voice = getVoice(item.voiceId);
            return (
              <div key={item.id} className="glass rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all duration-300 group border border-white/5 premium-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: voice.color }}></div>
                
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ backgroundColor: voice.color }}>
                        {voice.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-foreground">{voice.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black uppercase text-blue-500 px-1.5 py-0.5 bg-blue-500/10 rounded">{item.emotion}</span>
                          <span className="text-[9px] font-black uppercase text-slate-500">{item.language}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>

                  <p className="text-base text-slate-300 line-clamp-3 mb-8 font-medium italic leading-relaxed">
                    "{item.text}"
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handlePlay(item.audioBlob)}
                        className="w-12 h-12 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                      <button 
                        onClick={() => handleDownload(item.audioBlob, item.voiceId, item.createdAt)}
                        className="w-12 h-12 bg-white/5 text-slate-400 rounded-xl hover:text-foreground hover:bg-white/10 transition-all flex items-center justify-center"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                    <button className="w-12 h-12 text-slate-600 hover:text-red-500 transition-colors flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
