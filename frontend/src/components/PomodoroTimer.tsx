import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (mode === 'work') {
              setMode('break');
              setMinutes(5);
            } else {
              setMode('work');
              setMinutes(25);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="bg-surface-container p-6 rounded-[2rem] border border-outline-variant shadow-lg group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${mode === 'work' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <Timer size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Focus Session</span>
        </div>
        <div className="flex gap-1">
           {['work', 'break'].map(m => (
             <button 
                key={m}
                onClick={() => {
                  setMode(m as any);
                  setMinutes(m === 'work' ? 25 : 5);
                  setSeconds(0);
                  setIsActive(false);
                }}
                className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter transition-all ${mode === m ? 'bg-on-surface text-surface' : 'bg-surface-container-highest text-on-surface-variant'}`}
             >
                {m}
             </button>
           ))}
        </div>
      </div>

      <div className="text-center py-6">
        <div className="text-5xl font-black text-on-surface tracking-tighter tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-2">{mode === 'work' ? 'Time to grind' : 'Take a breath'}</p>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={toggleTimer}
          className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          className="p-3 bg-surface-container-highest text-on-surface-variant rounded-xl hover:text-indigo-400 transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
