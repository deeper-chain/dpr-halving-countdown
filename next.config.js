/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 允许加载字体
              "font-src 'self' data: https://fonts.gstatic.com",
              // 允许加载样式
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // 允许执行脚本
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // 允许加载图片
              "img-src 'self' data: https:",
              // 允许 WebSocket 连接
              "connect-src 'self' wss: https:",
              // 允许加载媒体文件
              "media-src 'self' data: https:",
              // 允许 worker 脚本
              "worker-src 'self' blob:",
            ].join('; ')
          }
        ]
      }
    ];
  },
  // 优化构建配置
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      config.optimization.minimizer = [
        ...config.optimization.minimizer,
        // 添加额外的优化器
      ];
    }
    return config;
  }
};

module.exports = nextConfig; 