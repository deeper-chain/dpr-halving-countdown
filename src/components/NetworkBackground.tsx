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

  // 限制最大节点数和连接数
  const MAX_NODES = 50;
  const MAX_CONNECTIONS = 100;

  // 初始化节点
  const initNodes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 清空现有节点
    nodesRef.current = [];
    
    // 创建新节点，限制数量
    for (let i = 0; i < MAX_NODES; i++) {
      nodesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 1
      });
    }
  }, []);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false }); // 优化透明度处理
    if (!canvas || !ctx) return;

    const deltaTime = timestamp - (lastTimeRef.current || timestamp);
    lastTimeRef.current = timestamp;

    // 使用 clearRect 替代 fillRect 来清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a192f'; // 设置背景色
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 优化节点更新
    nodesRef.current.forEach(node => {
      node.x += node.vx * (deltaTime / 16);
      node.y += node.vy * (deltaTime / 16);
      
      // 优化边界检查
      if (node.x < 0) { node.x = 0; node.vx *= -1; }
      if (node.x > canvas.width) { node.x = canvas.width; node.vx *= -1; }
      if (node.y < 0) { node.y = 0; node.vy *= -1; }
      if (node.y > canvas.height) { node.y = canvas.height; node.vy *= -1; }
    });

    // 批量绘制节点
    ctx.beginPath();
    nodesRef.current.forEach(node => {
      ctx.moveTo(node.x + node.radius, node.y);
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    });
    ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
    ctx.fill();

    // 限制连接数量
    connectionsRef.current = connectionsRef.current
      .filter(conn => conn.age < conn.maxAge)
      .slice(0, MAX_CONNECTIONS);
    
    // 批量绘制连接
    ctx.beginPath();
    connectionsRef.current.forEach(conn => {
      ctx.moveTo(conn.from.x, conn.from.y);
      ctx.lineTo(conn.to.x, conn.to.y);
      conn.age++;
    });
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
    ctx.stroke();

    // 优化连接检测频率
    if (timestamp % 64 === 0 && connectionsRef.current.length < MAX_CONNECTIONS) {
      const randomNode = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
      const nearbyNodes = nodesRef.current.filter(node2 => {
        if (node2 === randomNode) return false;
        const dx = randomNode.x - node2.x;
        const dy = randomNode.y - node2.y;
        return dx * dx + dy * dy < 32400;
      });

      if (nearbyNodes.length > 0 && Math.random() < 0.1) {
        connectionsRef.current.push({
          from: randomNode,
          to: nearbyNodes[Math.floor(Math.random() * nearbyNodes.length)],
          age: 0,
          maxAge: 120
        });
      }
    }

    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes(); // 重新初始化节点
    };

    // 使用防抖优化 resize 处理
    let resizeTimeout: number;
    const handleResize = () => {
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      resizeTimeout = window.requestAnimationFrame(resizeCanvas);
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas();
    initNodes();
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      // 清理数据
      nodesRef.current = [];
      connectionsRef.current = [];
    };
  }, [animate, initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40"
      style={{ 
        background: 'transparent',
        willChange: 'transform',
        imageRendering: 'crisp-edges' // 优化渲染质量
      }}
    />
  );
}; 