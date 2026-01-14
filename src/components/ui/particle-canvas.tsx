import { useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface ParticleCanvasProps {
  particleCount?: number;
  connectionDistance?: number;
  particleSpeed?: number;
  className?: string;
}

export function ParticleCanvas({
  particleCount = 50,
  connectionDistance = 150,
  particleSpeed = 0.5,
  className = '',
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const isMobile = useIsMobile();

  // Reduce particles on mobile for performance
  const actualParticleCount = isMobile ? Math.floor(particleCount / 2) : particleCount;
  const actualConnectionDistance = isMobile ? connectionDistance * 0.7 : connectionDistance;

  const colors = [
    'rgba(26, 84, 70, 0.6)',   // Primary teal
    'rgba(59, 130, 246, 0.5)', // Blue
    'rgba(245, 158, 11, 0.4)', // Amber
  ];

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < actualParticleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return particles;
  }, [actualParticleCount, particleSpeed]);

  const drawParticles = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    particles: Particle[]
  ) => {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < actualConnectionDistance) {
          const opacity = (1 - distance / actualConnectionDistance) * 0.2;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(26, 84, 70, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    }
  }, [actualConnectionDistance]);

  const updateParticles = useCallback((
    particles: Particle[],
    width: number,
    height: number
  ) => {
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Reinitialize particles on resize
      particlesRef.current = initParticles(rect.width, rect.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      updateParticles(particlesRef.current, rect.width, rect.height);
      drawParticles(ctx, rect.width, rect.height, particlesRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, updateParticles, drawParticles]);

  return (
    <div className={`canvas-container ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="canvas-gradient-overlay" />
    </div>
  );
}

// Lighter version with just floating dots, no connections
export function FloatingDotsCanvas({
  dotCount = 30,
  className = '',
}: {
  dotCount?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    opacity: number;
    speed: number;
    angle: number;
    color: string;
  }>>([]);
  const animationRef = useRef<number>();
  const isMobile = useIsMobile();

  const actualDotCount = isMobile ? Math.floor(dotCount / 2) : dotCount;

  const colors = [
    'rgba(26, 84, 70, 0.3)',
    'rgba(59, 130, 246, 0.25)',
    'rgba(245, 158, 11, 0.2)',
    'rgba(34, 197, 94, 0.25)',
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Initialize dots
      dotsRef.current = [];
      for (let i = 0; i < actualDotCount; i++) {
        dotsRef.current.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          radius: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.3 + 0.1,
          angle: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const dot of dotsRef.current) {
        // Gentle floating motion
        dot.angle += 0.01;
        dot.x += Math.sin(dot.angle) * dot.speed;
        dot.y += Math.cos(dot.angle * 0.5) * dot.speed * 0.5;

        // Wrap around edges
        if (dot.x < -10) dot.x = rect.width + 10;
        if (dot.x > rect.width + 10) dot.x = -10;
        if (dot.y < -10) dot.y = rect.height + 10;
        if (dot.y > rect.height + 10) dot.y = -10;

        // Draw dot with glow
        const gradient = ctx.createRadialGradient(
          dot.x, dot.y, 0,
          dot.x, dot.y, dot.radius * 3
        );
        gradient.addColorStop(0, dot.color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw center dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [actualDotCount]);

  return (
    <div className={`canvas-container ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
