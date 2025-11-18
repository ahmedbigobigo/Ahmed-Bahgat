import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../services/geminiService';
import { createBlob, decodeAudioData, decode } from '../services/audioUtils';

const LiveCall: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI is speaking
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // User is speaking (simple toggle for UI)
  const [error, setError] = useState<string | null>(null);

  // Refs for audio context and session management
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // Using any because session type isn't easily exported
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    setError(null);
    if (!process.env.API_KEY) {
      setError("API Key not found");
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Setup Audio Contexts
      // Input: 16kHz for Gemini
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output: 24kHz for Gemini
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const inputNode = inputAudioContextRef.current.createGain();
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      // 2. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 3. Establish Live Connection
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      };

      const sessionPromise = ai.live.connect({
        model: config.model,
        config: config.config,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setIsConnected(true);

            // Setup Audio Processing Pipeline
            if (!inputAudioContextRef.current || !stream) return;

            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              
              // Simple Voice Activity Detection for UI (User Speaking)
              const sum = inputData.reduce((a, b) => a + Math.abs(b), 0);
              const avg = sum / inputData.length;
              if (avg > 0.01) {
                setIsUserSpeaking(true);
                setTimeout(() => setIsUserSpeaking(false), 200);
              }

              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) {
                     setIsSpeaking(false);
                  }
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                
              } catch (e) {
                console.error("Error decoding audio", e);
              }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              console.log("Interrupted");
              sourcesRef.current.forEach(source => {
                try { source.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log("Session closed");
            setIsConnected(false);
          },
          onerror: (err) => {
             console.error("Session error", err);
             setError("Connection error occurred");
             disconnect();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (e: any) {
      console.error("Initialization error", e);
      setError(e.message || "Failed to initialize");
      disconnect();
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setIsSpeaking(false);
    setIsUserSpeaking(false);

    // Stop tracks
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    // Disconnect ScriptProcessor
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    // Close AudioContexts
    inputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    
    outputAudioContextRef.current?.close();
    outputAudioContextRef.current = null;

    // Close Gemini Session
    if (sessionRef.current) {
        sessionRef.current.then((session: any) => {
            try { session.close(); } catch(e) {}
        });
        sessionRef.current = null;
    }
    
    sourcesRef.current.forEach(s => {
        try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const handleToggleCall = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-arabic pt-16">
        {/* Background Ambience */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] transition-all duration-1000 ${isSpeaking ? 'scale-125 bg-cyan-500/30' : 'scale-100'}`} />
        
        <div className="z-10 flex flex-col items-center w-full max-w-md px-4">
            {/* Avatar / Visualizer */}
            <div className="relative mb-12">
                <div className={`w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isSpeaking ? 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.6)]' : isConnected ? 'border-green-500/50' : 'border-gray-700'}`}>
                     <div className="w-44 h-44 rounded-full bg-gray-900 overflow-hidden relative">
                         <img src="https://picsum.photos/id/64/400/400" alt="Ahmed Bahgat" className={`w-full h-full object-cover transition-opacity duration-500 ${isConnected ? 'opacity-100' : 'opacity-50 grayscale'}`} />
                         
                         {/* Listening Overlay */}
                         {isUserSpeaking && (
                             <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center">
                                 <div className="w-16 h-16 border-4 border-white rounded-full animate-ping" />
                             </div>
                         )}
                     </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg border ${
                        isConnected 
                            ? 'bg-green-500 text-black border-green-400' 
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                        {isConnected ? (isSpeaking ? 'Speaking' : 'Listening') : 'Offline'}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-white mb-2">مكالمة مباشرة</h1>
                <p className="text-gray-400">اتكلم مع نسختي الديجيتال بصوتي الحقيقي</p>
            </div>

            {/* Controls */}
            <div className="w-full flex flex-col gap-4">
                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center text-sm mb-4">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleToggleCall}
                    className={`w-full py-6 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
                        isConnected
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20'
                    }`}
                >
                    {isConnected ? (
                        <>
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                           <span>إنهاء المكالمة</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>ابدأ المكالمة</span>
                        </>
                    )}
                </button>
                
                <p className="text-center text-gray-600 text-xs mt-4">
                    * تأكد من السماح باستخدام الميكروفون لبدء المحادثة
                </p>
            </div>
        </div>
    </div>
  );
};

export default LiveCall;