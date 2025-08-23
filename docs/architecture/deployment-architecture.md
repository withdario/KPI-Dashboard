# Deployment Architecture

## Container Architecture

### Docker Configuration

```dockerfile
# Backend Dockerfile
FROM node:20-alpine AS backend
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Frontend Dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=frontend /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Docker Compose (Development)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/kpidashboard
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - '3001:80'
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=kpidashboard
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
```

## Kubernetes Deployment

### Production Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kpi-dashboard-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kpi-dashboard-backend
  template:
    metadata:
      labels:
        app: kpi-dashboard-backend
    spec:
      containers:
        - name: backend
          image: kpi-dashboard/backend:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

### Service Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kpi-dashboard-backend-service
spec:
  selector:
    app: kpi-dashboard-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker Images
        run: docker build -t kpi-dashboard/backend:${{ github.sha }} ./backend

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/kpi-dashboard-backend \
            backend=kpi-dashboard/backend:${{ github.sha }}
```
