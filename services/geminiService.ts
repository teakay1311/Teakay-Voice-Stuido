
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceID, Emotion, VoiceProfile } from "../types";
import { decodeBase64, decodeAudioData } from "../utils/audioUtils";
import { VOICES } from "../constants";

export class GeminiVoiceService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateSpeech(
    text: string,
    personaId: string,
    emotion: Emotion,
    language: string,
    speed: number = 1.0,
    pitch: number = 1.0
  ): Promise<{ audioBuffer: AudioBuffer; audioContext: AudioContext }> {
    const persona = VOICES.find(v => v.id === personaId) || VOICES[0];
    const qualitySetting = localStorage.getItem('vocalease_quality') || 'High Fidelity';

    if (!navigator.onLine) {
      return this.generateOfflineSpeech(text, persona, language, speed, pitch);
    }
    
    // Create a fresh instance to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    const systemInstruction = `
      You are a professional AI Speech Synthesis Engine. 
      Your goal is to produce ultra-realistic, high-fidelity human speech.
      
      TECHNICAL SPECIFICATIONS:
      - Sampling Rate: 24kHz (Target)
      - Bit Depth: 16-bit Linear PCM
      - Character Profile: ${persona.name}, ${persona.description}, Age: ${persona.age}.
      - Language: ${language}
      - Emotion: ${emotion}
      
      PERFORMANCE GUIDELINES:
      1. Vocal Clarity: Minimize digital hiss and compression artifacts. Ensure the voice sounds "close-mic'd" and present.
      2. Natural Prosody: Strictly follow the emotional context (${emotion}). If 'Excited', increase dynamic range. If 'Serious', maintain steady cadence.
      3. Acoustic Environment: Output dry studio-quality audio with zero reverb unless requested.
      4. Prosodic Phrasing: Respect grammatical structure. Add subtle breaths (100ms-200ms) before long clauses to mimic human physiology.
      5. Fidelity: Prioritize high-frequency detail for sibilants (s, z, ch) to ensure crisp articulation.
      
      The user will provide the text script. Output the audio modality directly.
    `;

    const prompt = `Perform this script: "${text}" with speed factor ${speed} and pitch shift ${pitch}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: persona.baseVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed");

    // Optimized for 24000Hz PCM which is the native high-fidelity output for this model.
    const sampleRate = 24000;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
    const audioData = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(audioData, audioContext, sampleRate, 1);

    return { audioBuffer, audioContext };
  }

  private async generateOfflineSpeech(
    text: string,
    persona: VoiceProfile,
    language: string,
    speed: number,
    pitch: number
  ): Promise<{ audioBuffer: AudioBuffer; audioContext: AudioContext }> {
    return new Promise((resolve, reject) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<string, string> = { 
        'Tiếng Việt': 'vi-VN', 
        'Tiếng Anh': 'en-US', 
        'Tiếng Nhật': 'ja-JP', 
        'Tiếng Hàn': 'ko-KR' 
      };
      
      utterance.lang = langMap[language] || 'vi-VN';
      utterance.rate = speed;
      utterance.pitch = pitch;

      const voices = synth.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
      if (targetVoice) utterance.voice = targetVoice;

      utterance.onstart = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        resolve({ audioBuffer: audioContext.createBuffer(1, 1, 24000), audioContext });
      };
      utterance.onerror = (e) => reject(e);
      synth.speak(utterance);
    });
  }

  async previewVoice(personaId: string, language: string = "Tiếng Việt"): Promise<{ audioBuffer: AudioBuffer; audioContext: AudioContext }> {
    const persona = VOICES.find(v => v.id === personaId) || VOICES[0];
    const previewText = language === 'Tiếng Việt' 
      ? `Xin chào, đây là mẫu giọng của ${persona.name}.` 
      : `Hello, this is ${persona.name}'s voice model.`;
    return this.generateSpeech(previewText, personaId, Emotion.NEUTRAL, language);
  }
}

export const geminiService = new GeminiVoiceService();
