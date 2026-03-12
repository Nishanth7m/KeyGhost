import React, { useEffect, useRef } from 'react';

const TypingVisualizer = ({ metrics, isComplete }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (metrics && metrics.dwell_times && metrics.dwell_times.length > 0) {
        const maxDwell = Math.max(...metrics.dwell_times, 200);
        const barWidth = 8;
        const spacing = 12;
        const startX = 20;
        const centerY = canvas.height / 2;

        ctx.beginPath();
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;

        metrics.dwell_times.forEach((dwell, i) => {
          const x = startX + i * (barWidth + spacing);
          const h = (dwell / maxDwell) * (canvas.height * 0.8);
          
          // Draw bar
          ctx.fillStyle = '#00ff88';
          ctx.fillRect(x, centerY - h/2, barWidth, h);

          // Draw line
          if (i === 0) {
            ctx.moveTo(x + barWidth/2, centerY - h/2);
          } else {
            ctx.lineTo(x + barWidth/2, centerY - h/2);
          }

          // Draw flight dot
          if (i > 0 && metrics.flight_times && metrics.flight_times[i-1]) {
            ctx.fillStyle = '#ffb800';
            ctx.beginPath();
            ctx.arc(x - spacing/2, centerY, 3, 0, Math.PI*2);
            ctx.fill();
          }
        });
        ctx.stroke();
      }

      if (isComplete) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 16px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('FINGERPRINT CAPTURED ✓', canvas.width/2, canvas.height/2);
      }
    };

    // Draw once per metrics update
    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [metrics, isComplete]);

  return (
    <div className="relative w-full h-48 bg-[#0a0f1e] rounded-xl border border-[#1a2035] overflow-hidden shadow-inner" style={{
      backgroundImage: 'linear-gradient(#1a2035 1px, transparent 1px), linear-gradient(90deg, #1a2035 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <div className="absolute top-3 left-4 text-[#64ffda] font-mono text-xs opacity-70">YOUR TYPING RHYTHM</div>
      <canvas ref={canvasRef} width={600} height={192} className="w-full h-full" />
      {metrics && (
        <div className="absolute bottom-3 right-4 text-right font-mono text-[10px] text-[#8892b0]">
          <div>SPEED: {metrics.typing_speed.toFixed(1)} CPS</div>
          <div>RHYTHM: {(metrics.rhythm_score * 100).toFixed(0)}%</div>
          <div>KEYS: {metrics.key_count}</div>
        </div>
      )}
    </div>
  );
};

export default TypingVisualizer;
