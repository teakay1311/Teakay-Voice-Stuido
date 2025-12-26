
import { VoiceProfile, Emotion } from './types';

export const VOICES: VoiceProfile[] = [
  // CUTE & ANIME (Kids & Teens)
  { id: 'be_na', baseVoice: 'Kore', name: 'Bé Na', age: '5 tuổi', gender: 'Nữ', style: 'Cute', description: 'Giọng bé mầm non, trong trẻo.', color: '#f472b6' },
  { id: 'bi_beo', baseVoice: 'Puck', name: 'Bi Béo', age: '7 tuổi', gender: 'Nam', style: 'Cute', description: 'Giọng bé trai hóm hỉnh, ngây thơ.', color: '#38bdf8' },
  { id: 'simmy', baseVoice: 'Kore', name: 'Mèo Simmy', age: '18 tuổi', gender: 'Nữ', style: 'Cute', description: 'Giọng Anime ngọt ngào.', color: '#ec4899' },
  { id: 'be_dau', baseVoice: 'Kore', name: 'Bé Dâu', age: '4 tuổi', gender: 'Nữ', style: 'Cute', description: 'Giọng bập bẹ rất dễ thương.', color: '#fda4af' },
  
  // CARTOON
  { id: 'pika', baseVoice: 'Puck', name: 'Pikachu', age: 'Linh vật', gender: 'Nam', style: 'Cartoon', description: 'Giọng tinh nghịch, năng động.', color: '#f59e0b' },
  { id: 'doraemon', baseVoice: 'Fenrir', name: 'Doraemon', age: 'Robot', gender: 'Nam', style: 'Cartoon', description: 'Giọng trầm, đặc trưng robot.', color: '#0ea5e9' },
  { id: 'luffy', baseVoice: 'Puck', name: 'Luffy', age: '19 tuổi', gender: 'Nam', style: 'Cartoon', description: 'Giọng khàn, đầy quyết tâm.', color: '#ef4444' },
  { id: 'naruto', baseVoice: 'Puck', name: 'Naruto', age: '17 tuổi', gender: 'Nam', style: 'Cartoon', description: 'Giọng sôi nổi, hào hứng.', color: '#f97316' },

  // PROFESSIONAL (Young Adults & Middle Age)
  { id: 'thanh_truc', baseVoice: 'Zephyr', name: 'BTV Thanh Trúc', age: '28 tuổi', gender: 'Nữ', style: 'News', description: 'Giọng đọc tin tức truyền cảm.', color: '#2563eb' },
  { id: 'quoc_khanh', baseVoice: 'Puck', name: 'BTV Quốc Khánh', age: '35 tuổi', gender: 'Nam', style: 'News', description: 'Giọng nam trầm, uy tín.', color: '#1e40af' },
  { id: 'anh_hung', baseVoice: 'Puck', name: 'Anh Hùng', age: '25 tuổi', gender: 'Nam', style: 'Standard', description: 'Giọng thanh niên hiện đại.', color: '#6366f1' },
  { id: 'chi_lan', baseVoice: 'Zephyr', name: 'Chị Lan', age: '40 tuổi', gender: 'Nữ', style: 'Standard', description: 'Giọng nữ trung niên điềm đạm.', color: '#8b5cf6' },
  { id: 'thanh_tung', baseVoice: 'Fenrir', name: 'Thanh Tùng', age: '32 tuổi', gender: 'Nam', style: 'Standard', description: 'Giọng nam ấm áp, lịch sự.', color: '#4338ca' },

  // STORYTELLERS (Seniors)
  { id: 'ong_nam', baseVoice: 'Fenrir', name: 'Ông Năm', age: '70 tuổi', gender: 'Nam', style: 'Storyteller', description: 'Giọng cụ già phúc hậu.', color: '#d97706' },
  { id: 'ba_sau', baseVoice: 'Charon', name: 'Bà Sáu', age: '65 tuổi', gender: 'Nữ', style: 'Storyteller', description: 'Giọng bà ngoại kể chuyện cổ tích.', color: '#be185d' },
  { id: 'ong_tu', baseVoice: 'Fenrir', name: 'Ông Tư', age: '75 tuổi', gender: 'Nam', style: 'Storyteller', description: 'Giọng lão nông hào sảng.', color: '#92400e' },
  { id: 'ba_bay', baseVoice: 'Charon', name: 'Bà Bảy', age: '80 tuổi', gender: 'Nữ', style: 'Storyteller', description: 'Giọng cụ già hiền từ, chậm rãi.', color: '#9d174d' },
  
  // SPECIAL & ENERGETIC
  { id: 'doc_truyen_ma', baseVoice: 'Charon', name: 'Kẻ Bí Ẩn', age: '45 tuổi', gender: 'Nữ', style: 'Storyteller', description: 'Giọng kịch tính, rùng rợn.', color: '#334155' },
  { id: 'mc_duong', baseVoice: 'Puck', name: 'MC Ánh Dương', age: '24 tuổi', gender: 'Nữ', style: 'Energetic', description: 'Giọng MC năng động.', color: '#f97316' },
  { id: 'son_tung', baseVoice: 'Puck', name: 'Sơn Tùng', age: '29 tuổi', gender: 'Nam', style: 'Energetic', description: 'Giọng nam trẻ trung, phong cách.', color: '#dc2626' },
];

export const EMOTIONS = Object.values(Emotion);

export const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'Tiếng Anh' },
  { code: 'ja', name: 'Tiếng Nhật' },
  { code: 'ko', name: 'Tiếng Hàn' },
];

export const VOICE_STYLES = ['Tất cả', 'Cute', 'Cartoon', 'News', 'Storyteller', 'Standard', 'Energetic'];
