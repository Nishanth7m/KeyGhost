import React, { useRef, useState, useEffect } from 'react';
import { KeystrokeEngine } from '../../lib/keystrokeEngine';

const KeystrokeInput = ({ onTypingComplete, onRealtimeUpdate, mode = 'login', placeholder = 'Password', type = 'password', value, onChange, className = '' }) => {
  const inputRef = useRef(null);
  const engineRef = useRef(new KeystrokeEngine());
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      engineRef.current.attachTo(inputRef.current);
    }
    return () => {
      engineRef.current.detach();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleInput = (e) => {
    if (onChange) onChange(e);

    if (!engineRef.current.isRecording) {
      engineRef.current.start();
      setIsTyping(true);
      if (onRealtimeUpdate) {
        intervalRef.current = setInterval(() => {
          onRealtimeUpdate(engineRef.current.getRealtimeMetrics());
        }, 100);
      }
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const events = engineRef.current.stop();
      const finalValue = inputRef.current.value;
      setIsTyping(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (onTypingComplete) onTypingComplete(events, finalValue);

      // Clear input after completion in training mode to prepare for next sample
      if (mode === 'training' && inputRef.current) {
        inputRef.current.value = '';
        // Trigger onChange if provided to keep controlled components in sync
        if (onChange) {
          onChange({ target: { value: '' } });
        }
      }
    }, 500);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className={`w-full bg-[#0a0f1e] border ${mode === 'training' && isTyping ? 'border-accent-green shadow-glow-green animate-pulse-fast' : 'border-[#1a2035]'} rounded-lg px-4 py-3 text-[#f0f4ff] focus:outline-none focus:border-accent-cyan focus:shadow-glow-cyan transition-all duration-300 font-mono ${className}`}
        autoComplete="off"
      />
      {mode === 'training' && isTyping && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default KeystrokeInput;
