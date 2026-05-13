"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";

export default function WeatherParticles() {
  const { theme } = useTheme();
  if (theme.particles === "none") return null;
  return <ParticleCanvas type={theme.particles} />;
}

function ParticleCanvas({ type }: { type: string }) {
  const canvasRef = useCanvas(type);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}

function useCanvas(type: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || type === "none") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    switch (type) {
      case "rain":
        particles = Array.from({ length: 150 }, () => new Raindrop(width, height));
        break;
      case "snow":
        particles = Array.from({ length: 80 }, () => new Snowflake(width, height));
        break;
      case "clouds":
        particles = Array.from({ length: 12 }, () => new CloudParticle(width, height));
        break;
      case "stars":
        particles = Array.from({ length: 120 }, () => new Star(width, height));
        break;
      case "lightning": {
        for (let i = 0; i < 100; i++) particles.push(new Raindrop(width, height));
        break;
      }
      case "sun":
        particles = Array.from({ length: 30 }, () => new SunRay(width, height));
        break;
      case "fog":
        particles = Array.from({ length: 25 }, () => new FogParticle(width, height));
        break;
      default:
        particles = [];
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw(ctx);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [type]);

  return canvasRef;
}

abstract class Particle {
  abstract update(): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}

class Raindrop extends Particle {
  x: number; y: number; length: number; speed: number; opacity: number;
  constructor(w: number, h: number) {
    super();
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.length = 10 + Math.random() * 15;
    this.speed = 8 + Math.random() * 12;
    this.opacity = 0.2 + Math.random() * 0.3;
  }
  update() {
    this.y += this.speed;
    if (this.y > window.innerHeight) { this.y = -this.length; this.x = Math.random() * window.innerWidth; }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = `rgba(174, 214, 241, ${this.opacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - 2, this.y + this.length);
    ctx.stroke();
  }
}

class Snowflake extends Particle {
  x: number; y: number; r: number; speed: number; wind: number; opacity: number;
  constructor(w: number, h: number) {
    super();
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.r = 1 + Math.random() * 3;
    this.speed = 1 + Math.random() * 2;
    this.wind = Math.random() * 0.5 - 0.25;
    this.opacity = 0.4 + Math.random() * 0.5;
  }
  update() {
    this.y += this.speed;
    this.x += this.wind;
    if (this.y > window.innerHeight) { this.y = -5; this.x = Math.random() * window.innerWidth; }
    if (this.x > window.innerWidth) this.x = 0;
    if (this.x < 0) this.x = window.innerWidth;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

class CloudParticle extends Particle {
  x: number; y: number; size: number; speed: number; opacity: number;
  constructor(w: number, h: number) {
    super();
    this.x = Math.random() * w;
    this.y = Math.random() * h * 0.6;
    this.size = 40 + Math.random() * 80;
    this.speed = 0.2 + Math.random() * 0.4;
    this.opacity = 0.06 + Math.random() * 0.08;
  }
  update() {
    this.x += this.speed;
    if (this.x > window.innerWidth + this.size) { this.x = -this.size; this.y = Math.random() * window.innerHeight * 0.6; }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Star extends Particle {
  x: number; y: number; r: number; twinkle: number; phase: number;
  constructor(w: number, h: number) {
    super();
    this.x = Math.random() * w;
    this.y = Math.random() * h * 0.7;
    this.r = 0.5 + Math.random() * 1.5;
    this.twinkle = 0.3 + Math.random() * 0.7;
    this.phase = Math.random() * Math.PI * 2;
  }
  update() {}
  draw(ctx: CanvasRenderingContext2D) {
    const opacity = this.twinkle * (0.5 + 0.5 * Math.sin(Date.now() * 0.002 + this.phase));
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

class SunRay extends Particle {
  x: number; y: number; size: number; phase: number;
  constructor(w: number, h: number) {
    super();
    this.x = Math.random() * w;
    this.y = Math.random() * h * 0.5;
    this.size = 20 + Math.random() * 40;
    this.phase = Math.random() * Math.PI * 2;
  }
  update() {}
  draw(ctx: CanvasRenderingContext2D) {
    const opacity = 0.03 + 0.03 * Math.sin(Date.now() * 0.001 + this.phase);
    ctx.fillStyle = `rgba(255, 220, 100, ${opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class FogParticle extends Particle {
  x: number; y: number; size: number; speed: number; opacity: number;
  constructor(w: number, h: number) {
    super();
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = 60 + Math.random() * 120;
    this.speed = 0.1 + Math.random() * 0.2;
    this.opacity = 0.02 + Math.random() * 0.03;
  }
  update() {
    this.x += this.speed;
    if (this.x > window.innerWidth + this.size) { this.x = -this.size; this.y = Math.random() * window.innerHeight; }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(200, 200, 200, ${this.opacity})`;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size, this.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
