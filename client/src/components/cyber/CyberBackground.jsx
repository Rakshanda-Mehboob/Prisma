import React, { useEffect, useRef } from 'react';

export default function CyberBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Soft organic floating shapes for wellness aesthetic
    const shapeCount = Math.min(18, Math.floor((width * height) / 60000));
    const shapes = [];

    for (let i = 0; i < shapeCount; i++) {
      const isGold = Math.random() > 0.7;
      shapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 60 + 30,
        color: isGold
          ? 'rgba(212, 160, 23, 0.04)'
          : Math.random() > 0.5
          ? 'rgba(26, 86, 50, 0.04)'
          : 'rgba(13, 148, 136, 0.04)',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw soft floating circles
      for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < -s.radius) s.x = width + s.radius;
        if (s.x > width + s.radius) s.x = -s.radius;
        if (s.y < -s.radius) s.y = height + s.radius;
        if (s.y > height + s.radius) s.y = -s.radius;

        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.8,
      }}
    />
  );
}
