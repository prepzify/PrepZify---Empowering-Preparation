import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  X, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Loader2, 
  User, 
  Bot,
  Volume2,
  VolumeX,
  StopCircle,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";

import { analyzeInterview } from '../../services/interviewService';
import FeedbackReport from './FeedbackReport';
import { InterviewFeedback } from '../../types';

interface LiveInterviewOverlayProps {
  mode: 'audio' | 'video';
  initialStream?: MediaStream | null;
  onClose: () => void;
  onTranscriptUpdate?: (text: string) => void;
}

export default function LiveInterviewOverlay({ mode, initialStream, onClose, onTranscriptUpdate }: LiveInterviewOverlayProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(mode === 'video');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model'; chunk: string; timestamp: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playbackStackRef = useRef<Float32Array[]>([]);
  const nextPlaybackTimeRef = useRef<number>(0);

  useEffect(() => {
    // If we already have a stream (unlikely with new flow), start immediately
    if (initialStream) {
      checkApiKeyAndStart();
    }

    // Cleanup on unmount
    return () => {
      stopSession();
    };
  }, []);

  const handleEndSession = async () => {
    if (!transcript.length) {
      onClose();
      return;
    }

    try {
      setIsAnalyzing(true);
      stopSession();
      const analysis = await analyzeInterview(transcript);
      setFeedback(analysis);
    } catch (err) {
      console.error("Analysis failed:", err);
      // Fallback: show simple exit if analysis fails
      onClose();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkApiKeyAndStart = async () => {
    try {
      // Check if platform supports key selection
      const aistudio = (window as any).aistudio;
      if (aistudio?.hasSelectedApiKey && aistudio?.openSelectKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await aistudio.openSelectKey();
          // Skill: Assume success after openSelectKey and proceed
        }
      }
      startSession();
    } catch (err) {
      console.error("Key selection flow error:", err);
      startSession(); // Fallback to process.env keys
    }
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setIsSessionActive(true);

      // 1. Request Media Permissions EARLY to preserve user gesture if called from click
      let stream = initialStream;
      if (!stream) {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: mode === 'video'
        };
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediaErr: any) {
          console.error("Media request failed in Overlay:", mediaErr);
          throw new Error(`Media Access Failed: Please ensure your camera and microphone are connected and that you have granted permission in your browser.`);
        }
      }
      streamRef.current = stream;

      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
      }

      // 2. Initialize API and Context
      const apiKey = (process.env.GEMINI_API_KEY || (window as any).process?.env?.API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.length < 10) {
        throw new Error("Gemini API key is required.");
      }
      const ai = new GoogleGenAI({ apiKey });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;
      nextPlaybackTimeRef.current = audioCtx.currentTime;

      // 3. Connect to Live API
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setupAudioInput(stream!);
            if (mode === 'video') setupVideoInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            handleServerMessage(message);
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setError(`Connection error: ${err.message || "Please check your network and try again."}`);
          },
          onclose: () => {
             console.log("Live API Closed");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a Senior Technical Interviewer. Conduct a professional, real-time mock interview in clear American English. Be encouraging but rigorous. Ask one question at a time.",
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
      });

      sessionRef.current = session;
    } catch (err: any) {
      console.error("Failed to start session:", err);
      let msg = err.message || "Failed to start live session.";
      if (msg.toLowerCase().includes("permission denied")) {
        msg = "Permission Denied: Your API Key may not have permissions for the Gemini Live API. Please check your API key settings.";
      }
      setError(msg);
      setIsConnecting(false);
    }
  };

  const setupAudioInput = (stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      if (!isMicEnabled || !sessionRef.current) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = floatTo16BitPCM(inputData);
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

      sessionRef.current.sendRealtimeInput({
        audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const setupVideoInput = () => {
    const interval = setInterval(() => {
      if (!isCamEnabled || !sessionRef.current || !videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        sessionRef.current.sendRealtimeInput({
          video: { data: base64, mimeType: 'image/jpeg' }
        });
      }
    }, 500); // 2 FPS is usually enough for Live API vision

    return () => clearInterval(interval);
  };

  const handleServerMessage = (message: any) => {
    // 1. Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      playAudioChunk(base64Audio);
    }

    // 2. Handle Interruption
    if (message.serverContent?.interrupted) {
      stopPlayback();
    }

    // 3. Handle Transcriptions
    const inputTranscript = message.inputTranscription?.transcript;
    const outputTranscript = message.outputTranscription?.transcript;

    if (inputTranscript) {
      setTranscript(prev => [...prev, { role: 'user', chunk: inputTranscript, timestamp: Date.now() }]);
      if (onTranscriptUpdate) onTranscriptUpdate(inputTranscript);
    }
    if (outputTranscript) {
      setTranscript(prev => [...prev, { role: 'model', chunk: outputTranscript, timestamp: Date.now() }]);
    }

    // Update speaking state
    setIsModelSpeaking(!!base64Audio);
  };

  const playAudioChunk = (base64: string) => {
    if (!audioContextRef.current) return;

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
    }

    // Model response audio is 24000 Hz according to skill
    const buffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    // Schedule playback for gapless audio
    const startTime = Math.max(audioContextRef.current.currentTime, nextPlaybackTimeRef.current);
    source.start(startTime);
    nextPlaybackTimeRef.current = startTime + buffer.duration;
  };

  const stopPlayback = () => {
    // In a real implementation, you'd track and stop individual sources.
    // For simplicity, we just reset the timing.
    nextPlaybackTimeRef.current = audioContextRef.current?.currentTime || 0;
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Int16Array(buffer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col gap-4"
      >
        <Card className="bg-gray-900 border-gray-800 overflow-hidden relative flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-white font-bold flex items-center gap-2">
                {mode === 'video' ? 'AI Video Interview' : 'AI Voice Interview'}
                <span className="text-xs text-gray-400 font-normal">Active Session</span>
              </h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-800">
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Visual Area */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden min-h-[300px]">
              {mode === 'video' ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover mirror ${!isCamEnabled ? 'hidden' : ''}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <canvas ref={canvasRef} width={640} height={480} className="hidden" />
                  {!isCamEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500 gap-4">
                      <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                        <User size={40} />
                      </div>
                      <p className="text-sm font-medium">Camera is disabled</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                    <motion.div 
                      animate={isModelSpeaking ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-2xl"
                    />
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl relative z-10">
                      <Bot size={64} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-white font-bold text-xl">AI Interviewer</p>
                    <p className="text-indigo-400 text-sm animate-pulse">{isModelSpeaking ? 'Interviewer is speaking...' : 'Listening...'}</p>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {error && (
                <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-8 text-center gap-4 z-20">
                  <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
                    <X size={24} className="text-white" />
                  </div>
                  <p className="text-red-200 font-medium">{error}</p>
                  <div className="flex gap-2">
                    <Button onClick={startSession} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                      Try Again
                    </Button>
                    <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Connecting Overlay */}
              {isConnecting && !error && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-4 z-20">
                  <Loader2 size={40} className="animate-spin text-indigo-500" />
                  <p className="text-gray-300 font-medium">Connecting to AI Interviewer...</p>
                </div>
              )}

              {/* Ready to Join Overlay */}
              {!isSessionActive && !error && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-6 z-20 p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                    {mode === 'video' ? <VideoIcon size={40} className="text-indigo-400" /> : <Mic size={40} className="text-indigo-400" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Ready for your interview?</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">Click below to grant camera/microphone access and begin the session.</p>
                  </div>
                  <Button 
                    onClick={checkApiKeyAndStart}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold rounded-full h-12"
                  >
                    Start Interview
                  </Button>
                </div>
              )}
            </div>

            {/* Transcript / Chat Sidebar */}
            <div className="w-full md:w-80 bg-gray-900/50 border-l border-gray-800 p-4 flex flex-col gap-4 overflow-hidden">
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} />
                  Live Transcription
               </h4>
                <div className="flex-1 overflow-auto space-y-3 custom-scrollbar pr-2">
                   {transcript.length === 0 ? (
                     <div className="text-gray-600 italic text-sm py-4">Waiting for conversation...</div>
                   ) : (
                     transcript.slice(-10).map((t, i) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         key={i} 
                         className={`text-sm p-3 rounded-lg border flex flex-col gap-1 ${
                           t.role === 'user' 
                             ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100 italic' 
                             : 'bg-gray-800/50 border-gray-700/50 text-gray-300'
                         }`}
                       >
                         <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                           {t.role === 'user' ? 'You' : 'Interviewer'}
                         </span>
                         {t.chunk}
                       </motion.div>
                     ))
                   )}
                </div>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="p-6 border-t border-gray-800 bg-gray-900 flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <Button 
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                variant="outline" 
                className={`h-14 w-14 rounded-full border-2 transition-all shadow-lg ${
                  isMicEnabled 
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                  : 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30'
                }`}
              >
                {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
              </Button>
              <span className="text-[10px] text-gray-500 font-bold uppercase">{isMicEnabled ? 'Unmuted' : 'Muted'}</span>
            </div>

            {mode === 'video' && (
              <div className="flex flex-col items-center gap-1.5">
                <Button 
                  onClick={() => setIsCamEnabled(!isCamEnabled)}
                  variant="outline" 
                  className={`h-14 w-14 rounded-full border-2 transition-all shadow-lg ${
                    isCamEnabled 
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                    : 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30'
                  }`}
                >
                  {isCamEnabled ? <VideoIcon size={24} /> : <VideoOff size={24} />}
                </Button>
                <span className="text-[10px] text-gray-500 font-bold uppercase">{isCamEnabled ? 'Video On' : 'Video Off'}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1.5">
              <Button 
                onClick={handleEndSession}
                disabled={isAnalyzing}
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20 border-4 border-gray-900 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 size={32} className="animate-spin" /> : <StopCircle size={32} />}
              </Button>
              <span className="text-[10px] text-red-500 font-black uppercase">{isAnalyzing ? 'Analyzing...' : 'End Interview'}</span>
            </div>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-white z-[60] p-6 lg:p-10"
              >
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
                      <X size={20} className="mr-2" />
                      Close Report
                    </Button>
                  </div>
                  <FeedbackReport feedback={feedback} onClose={onClose} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
