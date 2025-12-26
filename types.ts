
export type VoiceID = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export type VoiceStyle = 'Standard' | 'Cute' | 'Cartoon' | 'News' | 'Storyteller' | 'Energetic';

export enum Emotion {
  NEUTRAL = 'Bình thường',
  CHEERFUL = 'Vui vẻ',
  SAD = 'Buồn bã',
  ANGRY = 'Giận dữ',
  EXCITED = 'Hào hứng',
  SERIOUS = 'Nghiêm túc',
  WHISPER = 'Thì thầm',
  CUTE = 'Đáng yêu (Aegyo)',
  DRAMATIC = 'Kịch tính'
}

export interface VoiceProfile {
  id: string; // Unique persona ID
  baseVoice: VoiceID;
  name: string;
  age: string;
  gender: 'Nam' | 'Nữ';
  style: VoiceStyle;
  description: string;
  color: string;
}

export interface GenerationHistory {
  id: string;
  text: string;
  voiceId: string;
  emotion: Emotion;
  speed: number;
  pitch: number;
  audioBlob: Blob;
  createdAt: number;
  language: string;
}

export interface OfflineModelStatus {
  voiceId: string;
  isDownloaded: boolean;
  size: string;
}
