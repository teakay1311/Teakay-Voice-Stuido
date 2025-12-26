
import React, { useState, useRef } from 'react';
import { Upload, Mic, Trash2, CheckCircle2, Loader2, Sparkles, FileAudio, Play } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Emotion } from '../types';

const ClonerView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cloneName, setCloneName] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startAnalysis = () => {
    if (!file || !cloneName) return;
    setIsAnalyzing(true);
    // Simulate complex AI analysis for the cloning process
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsComplete(true);
    }, 3500);
  };

  const handlePreview = async () => {
    if (isPreviewing) return;
    setIsPreviewing(true);
    try {
      // Vì đây là giả lập sao chép, chúng ta sử dụng một giọng nền chuyên nghiệp 
      // để tạo mẫu nghe thử với nội dung thông báo về việc sao chép thành công.
      const text = `Chào bạn, đây là mẫu giọng nói vừa được sao chép thành công của ${cloneName}. Hệ thống đã tối ưu hóa các âm sắc để đạt được độ tương đồng cao nhất. Bạn thấy kết quả thế nào?`;
      
      const { audioBuffer, audioContext } = await geminiService.generateSpeech(
        text,
        'thanh_truc', // Sử dụng giọng chuyên nghiệp làm base cho preview giả lập
        Emotion.CHEERFUL,
        'Tiếng Việt',
        1.0,
        1.0
      );

      audioContextRef.current = audioContext;
      
      if (currentSourceRef.current) {
        try { currentSourceRef.current.stop(); } catch(e) {}
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPreviewing(false);
      source.start(0);
      currentSourceRef.current = source;
      
    } catch (error) {
      console.error("Preview error:", error);
      alert("Đã có lỗi xảy ra khi tạo mẫu nghe thử.");
      setIsPreviewing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
          <Sparkles className="w-3 h-3" />
          MỚI: CÔNG NGHỆ ZERO-SHOT
        </div>
        <h2 className="text-3xl font-bold mb-2">Voice Cloner</h2>
        <p className="text-slate-400">Tạo bản sao giọng nói chính xác 99% chỉ với một đoạn ghi âm ngắn (5-30 giây).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-8 border-dashed border-2 border-black/10 dark:border-white/5 hover:border-blue-500/50 transition-all group flex flex-col items-center justify-center text-center">
          <input
            type="file"
            id="voice-upload"
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
          />
          {!file ? (
            <label htmlFor="voice-upload" className="cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="font-bold mb-2">Tải lên file mẫu</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">Hỗ trợ MP3, WAV, M4A. Thời lượng tối ưu: 15 giây.</p>
            </label>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-4 bg-black/5 dark:bg-slate-900/50 p-4 rounded-xl border border-black/5 dark:border-white/5 mb-4">
                <FileAudio className="w-8 h-8 text-blue-500" />
                <div className="text-left flex-1 truncate">
                  <div className="text-sm font-bold truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-slate-500 text-left mb-2">Chất lượng âm thanh: <span className="text-green-500 font-bold">Tốt</span></div>
              <div className="w-full bg-black/10 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[85%]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Cấu hình Clone</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Tên định danh giọng nói</label>
                <input
                  type="text"
                  placeholder="VD: Giọng của tôi, Mr. Nam..."
                  className="w-full bg-black/5 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Mục đích sử dụng</label>
                <select className="w-full bg-black/5 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground">
                  <option>Cá nhân / Kỷ niệm</option>
                  <option>Kể chuyện Podcast</option>
                  <option>Video quảng cáo</option>
                  <option>Hỗ trợ người khiếm thính</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  onClick={startAnalysis}
                  disabled={!file || !cloneName || isAnalyzing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-300 dark:disabled:from-slate-700 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Đang phân tích âm phổ...</>
                  ) : isComplete ? (
                    <><CheckCircle2 className="w-5 h-5" /> Đã sẵn sàng sử dụng</>
                  ) : (
                    <>Bắt đầu huấn luyện giọng nói</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {isComplete && (
            <div className="glass rounded-2xl p-6 bg-green-500/5 border border-green-500/20 animate-in zoom-in-95">
              <h4 className="text-green-500 font-bold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Sao chép thành công!
              </h4>
              <p className="text-xs text-slate-500 mb-4 font-medium">Giọng nói "{cloneName}" đã được thêm vào thư viện riêng của bạn và có thể sử dụng ngay trong Voice Studio.</p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={handlePreview}
                  disabled={isPreviewing}
                  className="flex-1 py-3 bg-blue-600/10 text-blue-500 text-xs font-black rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-blue-500/20"
                >
                  {isPreviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  NGHE THỬ
                </button>
                <button className="flex-[1.5] py-3 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-500 transition-all shadow-lg shadow-green-500/20">
                  DÙNG NGAY TẠI STUDIO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 p-6 glass rounded-2xl bg-amber-500/5 border border-amber-500/20">
        <h4 className="text-amber-500 text-sm font-bold mb-2">Lưu ý Đạo đức & Pháp lý</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Chúng tôi cam kết bảo vệ quyền sở hữu trí tuệ. Vui lòng chỉ sử dụng tính năng sao chép với giọng nói của chính bạn hoặc khi đã được sự cho phép bằng văn bản của người sở hữu giọng nói. Mọi hành vi mạo danh hoặc lừa đảo sẽ dẫn đến việc khóa tài khoản vĩnh viễn.
        </p>
      </div>
    </div>
  );
};

export default ClonerView;
