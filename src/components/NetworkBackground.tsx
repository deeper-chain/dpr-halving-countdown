import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Connection {
  from: Node;
  to: Node;
  age: number;
  maxAge: number;
}

export const NetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const frameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const deltaTime = timestamp - (lastTimeRef.current || timestamp);
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    nodesRef.current.forEach(node => {
      node.x += node.vx * (deltaTime / 16);
      node.y += node.vy * (deltaTime / 16);
      
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.05)';
      ctx.fill();
    });

    connectionsRef.current = connectionsRef.current.filter(conn => conn.age < conn.maxAge);
    
    connectionsRef.current.forEach(conn => {
      const progress = conn.age / conn.maxAge;
      const alpha = 0.3 * (1 - progress);
      
      ctx.beginPath();
      ctx.moveTo(conn.from.x, conn.from.y);
      ctx.lineTo(conn.to.x, conn.to.y);
      ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(conn.from.x, conn.from.y);
      ctx.lineTo(conn.to.x, conn.to.y);
      ctx.strokeStyle = `rgba(96, 165, 250, ${alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      conn.age++;
    });

    if (timestamp % 32 === 0) {
      nodesRef.current.forEach(node1 => {
        nodesRef.current.forEach(node2 => {
          if (node1 === node2) return;
          
          const dx = node1.x - node2.x;
          const dy = node1.y - node2.y;
          const distance = dx * dx + dy * dy;
          
          if (distance < 32400 && Math.random() < 0.015) {
            connectionsRef.current.push({
              from: node1,
              to: node2,
              age: 0,
              maxAge: 120
            });
          }
        });
      });
    }

    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      const scale = Math.min(
        1,
        maxWidth / window.innerWidth,
        maxHeight / window.innerHeight
      );
      
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40"
      style={{ 
        background: 'transparent',
        willChange: 'transform'
      }}
    />
  );
}; 