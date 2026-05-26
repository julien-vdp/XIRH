import React, { useEffect, useRef } from 'react';

const ParticleBackground = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationFrameId;

    let mouse = {
      x: null,
      y: null,
      radius: 120
    };

    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        if (this.x > canvas.width || this.x < 0) {
           this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
           this.directionY = -this.directionY;
        }
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          if (mouse.x < this.x && this.x < canvas.width - this.size * 5) {
            this.x += 1;
            this.directionX = -Math.abs(this.directionX);
          }
          if (mouse.x > this.x && this.x > this.size * 5) {
            this.x -= 1;
            this.directionX = Math.abs(this.directionX);
          }
          if (mouse.y < this.y && this.y < canvas.height - this.size * 5) {
            this.y += 1;
            this.directionY = -Math.abs(this.directionY);
          }
          if (mouse.y > this.y && this.y > this.size * 5) {
            this.y -= 1;
            this.directionY = Math.abs(this.directionY);
          }
        }
        
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const init = () => {
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 10000;
      const isDark = theme === 'dark';
      const pColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(99, 102, 241, 0.5)';
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 1.5) + 0.5;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 0.8) - 0.4;
        let directionY = (Math.random() * 0.8) - 0.4;
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size, pColor));
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
    };

    const connect = () => {
      const isDark = theme === 'dark';
      const rgb = isDark ? '255, 255, 255' : '99, 102, 241';
      
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = (dx * dx + dy * dy);
          
          if (distance < 12000) {
            let opacityValue = 1 - (distance / 12000);
            ctx.strokeStyle = `rgba(${rgb}, ${opacityValue * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ParticleBackground;
