# DPR Second Halving Countdown / DPR 第二次减半倒计时

[English](#english) | [中文](#chinese)

## English

### Project Overview

A real-time dashboard tracking DPR's second halving event, displaying current issuance, remaining amount, daily increase, and estimated time until halving.

### System Requirements

#### Hardware Requirements
- CPU: Minimum 2 cores, recommended 4 cores
- Memory: Minimum 2GB, recommended 4GB
- Storage: Minimum 10GB SSD
- Network: 100Mbps minimum, 1Gbps recommended

#### Software Requirements
- Node.js 18 or higher
- Docker 20.10 or higher
- Kubernetes 1.22 or higher (if using K8s deployment)
- Nginx (if using reverse proxy)

#### Network Requirements
- Outbound access to WebSocket endpoint
- Port 3000 for application
- Port 80/443 for reverse proxy

### Detailed Deployment Guide

#### Docker Deployment

1. Build the Docker image:
```bash
docker build -t dpr-halving-countdown:latest .
```

2. Run with environment variables:
```bash
docker run -d \
  --name dpr-halving \
  -p 3000:3000 \
  -e NEXT_PUBLIC_WS_ENDPOINT=wss://your-node-endpoint \
  --restart unless-stopped \
  dpr-halving-countdown:latest
```

3. Verify deployment:
```bash
docker logs dpr-halving
curl http://localhost:3000/api/health
```

#### Kubernetes Deployment

1. Create namespace:
```bash
kubectl create namespace dpr
```

2. Apply configurations:
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

3. Verify deployment:
```bash
kubectl get pods -n dpr
kubectl logs -f deployment/dpr-halving-countdown -n dpr
```

### Monitoring and Alerting

#### Key Metrics
- Application Health: `/api/health`
- System Metrics: `/api/metrics`
- Custom Business Metrics:
  * Total Issuance
  * Daily Increase Rate
  * WebSocket Connection Status

#### Prometheus Integration
```yaml
scrape_configs:
  - job_name: 'dpr-halving'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['localhost:3000']
```

#### Recommended Alert Rules
```yaml
groups:
- name: dpr-halving
  rules:
  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes{container="dpr-halving"} > 1G
    for: 5m
    labels:
      severity: warning
  - alert: WebSocketDisconnected
    expr: ws_connection_status == 0
    for: 1m
    labels:
      severity: critical
```

### Performance Optimization

#### Resource Configuration
- Node.js Heap Size: `--max-old-space-size=4096`
- Container Resources:
  * CPU: 100m-500m
  * Memory: 128Mi-512Mi

#### Caching Strategy
- Browser Caching: 5 minutes
- API Response Caching: 1 minute
- Static Asset Caching: 1 week

#### Scaling Guidelines
- Horizontal scaling: 3-5 replicas recommended
- Vertical scaling: Increase resources when RPS > 1000

### Troubleshooting Guide

#### Common Issues

1. WebSocket Connection Failures
```bash
# Check WebSocket endpoint
curl -N -v wss://your-node-endpoint

# Check logs
kubectl logs -f deployment/dpr-halving-countdown -n dpr
```

2. High Memory Usage
```bash
# Check container stats
docker stats dpr-halving

# Memory profile
curl http://localhost:3000/api/debug/memory
```

3. Performance Issues
```bash
# Check resource usage
kubectl top pods -n dpr

# Network latency
ping your-node-endpoint
```

### Maintenance Procedures

#### Backup and Restore
1. Configuration Backup:
```bash
kubectl get configmap dpr-config -n dpr -o yaml > backup/config-$(date +%Y%m%d).yaml
```

2. Application Logs Backup:
```bash
kubectl logs deployment/dpr-halving-countdown -n dpr > backup/logs-$(date +%Y%m%d).log
```

#### Update Procedures
1. Update Docker Image:
```bash
docker pull dpr-halving-countdown:latest
docker stop dpr-halving
docker rm dpr-halving
# Then run new container
```

2. Update K8s Deployment:
```bash
kubectl set image deployment/dpr-halving-countdown \
  dpr-halving-countdown=dpr-halving-countdown:latest -n dpr
```

### Security Considerations

#### Network Security
- Enable TLS/SSL
- Configure CORS properly
- Use secure WebSocket connections

#### Container Security
- Run as non-root user
- Enable read-only root filesystem
- Set resource limits

## Chinese

### 项目概述

实时追踪 DPR 第二次减半事件的仪表板，显示当前发行量、剩余数量、日均增长量和预计减半时间。

### 系统要求

#### 硬件要求
- CPU: 最低2核心，推荐4核心
- 内存: 最低2GB，推荐4GB
- 存储: 最低10GB SSD
- 网络: 最低100Mbps，推荐1Gbps

#### 软件要求
- Node.js 18或更高版本
- Docker 20.10或更高版本
- Kubernetes 1.22或更高版本（如果使用K8s部署）
- Nginx（如果使用反向代理）

#### 网络要求
- 对外访问WebSocket端点
- 端口3000用于应用程序
- 端口80/443用于反向代理

### 详细部署指南

#### Docker部署

1. 构建Docker镜像：
```bash
docker build -t dpr-halving-countdown:latest .
```

2. 运行容器：
```bash
docker run -d \
  --name dpr-halving \
  -p 3000:3000 \
  -e NEXT_PUBLIC_WS_ENDPOINT=wss://your-node-endpoint \
  --restart unless-stopped \
  dpr-halving-countdown:latest
```

3. 验证部署：
```bash
docker logs dpr-halving
curl http://localhost:3000/api/health
```

#### Kubernetes部署

1. 创建命名空间：
```bash
kubectl create namespace dpr
```

2. 应用配置：
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

3. 验证部署：
```bash
kubectl get pods -n dpr
kubectl logs -f deployment/dpr-halving-countdown -n dpr
```

### 监控和告警

#### 关键指标
- 应用健康：`/api/health`
- 系统指标：`/api/metrics`
- 自定义业务指标：
  * 总发行量
  * 日均增长率
  * WebSocket连接状态

#### Prometheus集成
```yaml
scrape_configs:
  - job_name: 'dpr-halving'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['localhost:3000']
```

#### 推荐告警规则
```yaml
groups:
- name: dpr-halving
  rules:
  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes{container="dpr-halving"} > 1G
    for: 5m
    labels:
      severity: warning
  - alert: WebSocketDisconnected
    expr: ws_connection_status == 0
    for: 1m
    labels:
      severity: critical
```

### 性能优化

#### 资源配置
- Node.js Heap Size: `--max-old-space-size=4096`
- 容器资源：
  * CPU: 100m-500m
  * 内存: 128Mi-512Mi

#### 缓存策略
- 浏览器缓存：5分钟
- API响应缓存：1分钟
- 静态资源缓存：1周

#### 扩展指南
- 水平扩展：推荐3-5个副本
- 垂直扩展：当RPS>1000时增加资源

### 故障排查指南

#### 常见问题

1. WebSocket连接失败
```bash
# 检查WebSocket端点
curl -N -v wss://your-node-endpoint

# 检查日志
kubectl logs -f deployment/dpr-halving-countdown -n dpr
```

2. 高内存使用
```bash
# 检查容器状态
docker stats dpr-halving

# 内存配置文件
curl http://localhost:3000/api/debug/memory
```

3. 性能问题
```bash
# 检查资源使用
kubectl top pods -n dpr

# 网络延迟
ping your-node-endpoint
```

### 维护流程

#### 备份和恢复
1. 配置备份：
```bash
kubectl get configmap dpr-config -n dpr -o yaml > backup/config-$(date +%Y%m%d).yaml
```

2. 应用程序日志备份：
```bash
kubectl logs deployment/dpr-halving-countdown -n dpr > backup/logs-$(date +%Y%m%d).log
```

#### 更新流程
1. 更新Docker镜像：
```bash
docker pull dpr-halving-countdown:latest
docker stop dpr-halving
docker rm dpr-halving
# 然后运行新容器
```

2. 更新K8s部署：
```bash
kubectl set image deployment/dpr-halving-countdown \
  dpr-halving-countdown=dpr-halving-countdown:latest -n dpr
```

### 安全注意事项

#### 网络安全性
- 启用TLS/SSL
- 正确配置CORS
- 使用安全的WebSocket连接

#### 容器安全性
- 作为非root用户运行
- 启用只读根文件系统
- 设置资源限制
