import React, { useEffect, useRef } from 'react';

const MatrixLogo = ({ text = "KEYGHOST", fontSize = 24, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    ctx.font = `800 ${fontSize}px "Space Grotesk", sans-serif`;
    const textMetrics = ctx.measureText(text);
    
    const paddingX = 16;
    const paddingY = 10;
    const cssWidth = textMetrics.width + paddingX * 2;
    const cssHeight = fontSize + paddingY * 2;

    // Set display size (css)
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    // Set actual resolution size (retina)
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    ctx.scale(dpr, dpr);

    const characters = '0123456789ABCDEFKEYGHOST';
    const matrixFontSize = 8;
    const columns = Math.floor(cssWidth / matrixFontSize);
    const drops = new Array(columns).fill(0).map(() => Math.random() * 20);

    let shimmerPos = -cssWidth;

    const draw = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const centerX = cssWidth / 2;
      const centerY = cssHeight / 2 + 1; // baseline tweak

      // 1. Create rich gradient for main text
      const textGradient = ctx.createLinearGradient(0, 0, cssWidth, 0);
      textGradient.addColorStop(0, '#ffffff');
      textGradient.addColorStop(0.35, '#34d399'); // Emerald 400
      textGradient.addColorStop(0.75, '#22d3ee'); // Cyan 400
      textGradient.addColorStop(1, '#10b981');   // Emerald 500

      ctx.font = `800 ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outer glow layer
      ctx.save();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
      ctx.fillStyle = textGradient;
      ctx.fillText(text, centerX, centerY);
      ctx.restore();

      // Sharp primary text
      ctx.fillStyle = textGradient;
      ctx.fillText(text, centerX, centerY);

      // 2. Matrix Digital Rain Inside Text Mask
      ctx.save();
      ctx.beginPath();
      ctx.fillText(text, centerX, centerY);
      ctx.clip();

      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * matrixFontSize;
        const y = (drops[i] * matrixFontSize) % (cssHeight + matrixFontSize);

        // Matrix char glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `600 ${matrixFontSize}px "JetBrains Mono"`;
        ctx.fillText(char, x, y);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fillText(char, x, y - matrixFontSize);

        drops[i] += 0.25;
      }

      // 3. Animated Light Shimmer Pass Across Text
      shimmerPos += 2;
      if (shimmerPos > cssWidth * 2) {
        shimmerPos = -cssWidth;
      }

      const shimmerGradient = ctx.createLinearGradient(shimmerPos, 0, shimmerPos + 40, 0);
      shimmerGradient.addColorStop(0, 'rgba(255,255,255,0)');
      shimmerGradient.addColorStop(0.5, 'rgba(255,255,255,0.7)');
      shimmerGradient.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = shimmerGradient;
      ctx.fillText(text, centerX, centerY);

      ctx.restore();

      // 4. Razor Sharp Crisp Stroke Outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeText(text, centerX, centerY);
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
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="block"
        style={{ filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.5))' }}
      />
    </div>
  );
};

export default MatrixLogo;

