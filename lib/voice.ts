/**
 * Voice Input and Text-to-Speech System
 * Handles voice commands and audio responses
 */

export interface VoiceConfig {
  language: string;
  rate: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
  volume: number; // 0 to 1
}

const defaultConfig: VoiceConfig = {
  language: 'en-US',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

let recognition: any = null;
let isListening = false;

/**
 * Initialize speech recognition
 */
export function initSpeechRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  language: string = 'en-US'
): () => void {
  if (typeof window === 'undefined') return () => {};

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech Recognition not supported in this browser');
    return () => {};
  }

  recognition = new SpeechRecognition();
  recognition.language = language;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    console.log('🎤 Voice recognition started');
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    onError(`Speech recognition error: ${event.error}`);
  };

  recognition.onend = () => {
    isListening = false;
    console.log('🎤 Voice recognition ended');
  };

  // Return stop function
  return () => stopListening();
}

/**
 * Start listening for voice commands
 */
export function startListening(): void {
  if (recognition && !isListening) {
    recognition.start();
  }
}

/**
 * Stop listening
 */
export function stopListening(): void {
  if (recognition && isListening) {
    recognition.stop();
  }
}

/**
 * Text-to-Speech synthesis
 */
export async function speakText(
  text: string,
  config: Partial<VoiceConfig> = {}
): Promise<void> {
  if (typeof window === 'undefined') return;

  const finalConfig = { ...defaultConfig, ...config };

  const SpeechSynthesisUtterance = (window as any).SpeechSynthesisUtterance;

  if (!SpeechSynthesisUtterance || !window.speechSynthesis) {
    console.error('❌ Text-to-Speech not supported in this browser');
    return;
  }

  return new Promise((resolve) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.language = finalConfig.language;
    utterance.rate = finalConfig.rate;
    utterance.pitch = finalConfig.pitch;
    utterance.volume = finalConfig.volume;

    utterance.onend = () => {
      console.log('✅ Speech synthesis completed');
      resolve();
    };

    utterance.onerror = (event: any) => {
      console.error('❌ Speech synthesis error:', event.error);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop speaking immediately
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

/**
 * Check if text-to-speech is supported
 */
export function isTextToSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.speechSynthesis && !!window.SpeechSynthesisUtterance;
}

/**
 * Get current listening state
 */
export function getListeningState(): boolean {
  return isListening;
}
