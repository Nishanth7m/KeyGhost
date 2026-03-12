import React, { useEffect, useRef } from 'react';

const MatrixLogo = ({ text = "KEYGHOST", fontSize = 32, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on text dimensions
    ctx.font = `bold ${fontSize}px "Orbitron"`;
    const textMetrics = ctx.measureText(text);
    const padding = 10;
    const width = textMetrics.width + padding * 2;
    const height = fontSize + padding * 2;
    
    canvas.width = width;
    canvas.height = height;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]';
    const matrixFontSize = 10;
    const columns = Math.floor(width / matrixFontSize);
    const drops = new Array(columns).fill(0);

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw solid base text for readability
      ctx.font = `bold ${fontSize}px "Orbitron"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
      ctx.fillText(text, width / 2, height / 2);

      // 2. Draw matrix rain inside the text
      ctx.save();
      
      // Create clipping region
      ctx.beginPath();
      ctx.fillText(text, width / 2, height / 2);
      ctx.clip();

      // Draw the matrix rain
      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Brighter green for the rain
        const brightness = Math.floor(Math.random() * 55) + 200; // 200-255
        ctx.fillStyle = `rgba(0, ${brightness}, 136, 0.9)`;
        ctx.font = `${matrixFontSize}px "JetBrains Mono"`;
        
        // Draw character
        const x = i * matrixFontSize;
        const y = (drops[i] * matrixFontSize) % (height + matrixFontSize);
        ctx.fillText(char, x, y);
        
        // Add a white "head" for the rain drop
        ctx.fillStyle = '#ffffff';
        ctx.fillText(char, x, y);

        // Increment drop position
        drops[i] += 0.3;
      }
      ctx.restore();

      // 3. Add a sharp outline for extra clarity
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeText(text, width / 2, height / 2);
      
      // 4. Add a glow effect
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00ff88';
      ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
      ctx.fillText(text, width / 2, height / 2);
    };

    let animationId;
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [text, fontSize]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`inline-block align-middle ${className}`}
      style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))' }}
    />
  );
};

export default MatrixLogo;
