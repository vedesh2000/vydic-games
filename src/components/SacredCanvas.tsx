import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface SacredCanvasHandle {
  triggerBurst: (x: number, y: number, color: string, intensity?: 'flip' | 'match' | 'victory') => void;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  isPetal: boolean;
  rotation: number;
  vRot: number;
}

interface AuraRing {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface Ember {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
  phase: number;
}

const MAX_PARTICLES = 180;
const MAX_RINGS = 16;
const EMBER_COUNT = 38;

export const SacredCanvas = forwardRef<SacredCanvasHandle, { isTitleScreen?: boolean }>(
  ({ isTitleScreen = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>(
      Array.from({ length: MAX_PARTICLES }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 3,
        color: '#F59E0B',
        alpha: 1,
        life: 0,
        maxLife: 1,
        isPetal: false,
        rotation: 0,
        vRot: 0,
      }))
    );
    const ringsRef = useRef<AuraRing[]>(
      Array.from({ length: MAX_RINGS }, () => ({
        active: false,
        x: 0,
        y: 0,
        radius: 0,
        maxRadius: 100,
        color: '#F59E0B',
        alpha: 0,
      }))
    );
    const hitstopRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
      triggerBurst(x: number, y: number, color: string, intensity: 'flip' | 'match' | 'victory' = 'match') {
        const count = intensity === 'victory' ? 55 : intensity === 'match' ? 26 : 10;
        if (intensity === 'match') {
          hitstopRef.current = 0.045; // 45ms hitstop on divine match
        } else if (intensity === 'victory') {
          hitstopRef.current = 0.07;
        }

        // Spawn expanding aura ring
        const rings = ringsRef.current;
        for (let i = 0; i < rings.length; i++) {
          if (!rings[i].active) {
            rings[i].active = true;
            rings[i].x = x;
            rings[i].y = y;
            rings[i].radius = 12;
            rings[i].maxRadius = intensity === 'victory' ? 240 : intensity === 'match' ? 115 : 55;
            rings[i].color = color;
            rings[i].alpha = intensity === 'flip' ? 0.45 : 0.85;
            break;
          }
        }

        // Spawn pooled particles
        const pool = particlesRef.current;
        let spawned = 0;
        const palette = [color, '#FEF08A', '#F59E0B', '#FB923C'];
        for (let i = 0; i < pool.length && spawned < count; i++) {
          if (!pool[i].active) {
            const p = pool[i];
            const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5) * 0.4;
            const speed =
              intensity === 'victory'
                ? 90 + Math.random() * 220
                : intensity === 'match'
                ? 60 + Math.random() * 140
                : 35 + Math.random() * 65;

            p.active = true;
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed - (intensity === 'match' ? 25 : 0);
            p.size = intensity === 'flip' ? 2.5 + Math.random() * 2 : 3.5 + Math.random() * 4.5;
            p.color = palette[spawned % palette.length];
            p.alpha = 1;
            p.life = 0;
            p.maxLife = intensity === 'flip' ? 0.35 + Math.random() * 0.2 : 0.65 + Math.random() * 0.45;
            p.isPetal = spawned % 2 === 0;
            p.rotation = Math.random() * Math.PI * 2;
            p.vRot = (Math.random() - 0.5) * 6;
            spawned++;
          }
        }
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      const embers: Ember[] = Array.from({ length: EMBER_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -(10 + Math.random() * 22),
        vx: (Math.random() - 0.5) * 12,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      }));

      let mandalaAngle = 0;
      let lastTime = performance.now();
      let animId = 0;

      const render = (now: number) => {
        const rawDt = (now - lastTime) / 1000;
        lastTime = now;
        // Clamp frame delta time as required by game simulation rules
        const dt = Math.min(Math.max(rawDt, 0.001), 0.05);

        ctx.clearRect(0, 0, width, height);

        // Handle brief simulation hitstop on heavy match impacts
        let simDt = dt;
        if (hitstopRef.current > 0) {
          hitstopRef.current -= dt;
          simDt = dt * 0.15;
        }

        mandalaAngle += simDt * (isTitleScreen ? 0.12 : 0.05);

        // 1. Draw subtle Sacred Lotus / Sri Yantra Mandala in center background
        const cx = width * 0.5;
        const cy = height * 0.52;
        const baseRadius = Math.min(width, height) * (isTitleScreen ? 0.36 : 0.42);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(mandalaAngle);
        ctx.strokeStyle = isTitleScreen ? 'rgba(245, 158, 11, 0.11)' : 'rgba(245, 158, 11, 0.055)';
        ctx.lineWidth = 1.2;

        // Concentric sacred circles
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
        ctx.arc(0, 0, baseRadius * 0.74, 0, Math.PI * 2);
        ctx.stroke();

        // 16 Lotus Petals
        const petals = 16;
        for (let i = 0; i < petals; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI * 2) / petals);
          ctx.beginPath();
          ctx.ellipse(0, -baseRadius * 0.86, baseRadius * 0.09, baseRadius * 0.14, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();

        // 2. Update & draw rising Temple Deepam Embers
        for (let i = 0; i < embers.length; i++) {
          const e = embers[i];
          e.phase += simDt * 2;
          e.y += e.vy * simDt;
          e.x += (e.vx + Math.sin(e.phase) * 8) * simDt;

          if (e.y < -10) {
            e.y = height + 10;
            e.x = Math.random() * width;
          }
          if (e.x < -10) e.x = width + 10;
          if (e.x > width + 10) e.x = -10;

          ctx.fillStyle = `rgba(251, 191, 36, ${e.alpha * (0.7 + 0.3 * Math.sin(e.phase))})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Update & draw expanding Aura Rings
        const rings = ringsRef.current;
        for (let i = 0; i < rings.length; i++) {
          const r = rings[i];
          if (!r.active) continue;
          r.radius += (r.maxRadius - r.radius) * Math.min(1, simDt * 8);
          r.alpha -= simDt * 1.45;
          if (r.alpha <= 0.01) {
            r.active = false;
            continue;
          }
          ctx.save();
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 4. Update & draw pooled Marigold Petal & Spark Particles
        const pool = particlesRef.current;
        for (let i = 0; i < pool.length; i++) {
          const p = pool[i];
          if (!p.active) continue;

          p.life += simDt;
          if (p.life >= p.maxLife) {
            p.active = false;
            continue;
          }

          p.vy += 150 * simDt; // gentle gravity
          p.vx *= 1 - 1.5 * simDt;
          p.x += p.vx * simDt;
          p.y += p.vy * simDt;
          p.rotation += p.vRot * simDt;
          p.alpha = 1 - p.life / p.maxLife;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.isPetal) {
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 1.35, p.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
          }
          ctx.restore();
        }

        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);
      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
      };
    }, [isTitleScreen]);

    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    );
  }
);
