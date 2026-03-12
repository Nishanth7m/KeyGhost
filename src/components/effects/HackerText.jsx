import React, { useState, useEffect, useRef } from 'react';

const HackerText = ({ text, speed = 50, delay = 0, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  const iterationsRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const startAnimation = () => {
      intervalRef.current = setInterval(() => {
        setDisplayText((prev) => {
          return text
            .split('')
            .map((char, index) => {
              if (index < iterationsRef.current) {
                return text[index];
              }
              return characters.charAt(Math.floor(Math.random() * characters.length));
            })
            .join('');
        });

        if (iterationsRef.current >= text.length) {
          clearInterval(intervalRef.current);
        }

        iterationsRef.current += 1 / 3;
      }, speed);
    };

    const timeout = setTimeout(startAnimation, delay);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [text, speed, delay]);

  return <span className={className}>{displayText}</span>;
};

export default HackerText;
