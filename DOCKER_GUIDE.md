# Docker Setup Guide

Hướng dẫn chạy Food Shop Frontend với Docker.

## 📋 Yêu cầu

- Docker Desktop đã được cài đặt
- Docker Compose đã được cài đặt (thường đi kèm với Docker Desktop)

## 🚀 Cách chạy

### 1. Chạy lần đầu

```bash
# Di chuyển vào thư mục project
cd FoodShopFrontend

# Tạo file .env (nếu chưa có)
cp .env.example .env

# Chỉnh sửa file .env nếu cần
# nano .env

# Khởi động Docker containers
docker-compose up
```

### 2. Chạy ở chế độ background

```bash
docker-compose up -d
```

### 3. Xem logs

```bash
# Xem tất cả logs
docker-compose logs

# Xem logs real-time
docker-compose logs -f

# Xem logs của frontend service
docker-compose logs -f frontend
```

### 4. Dừng containers

```bash
# Dừng containers
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

### 5. Rebuild containers

Khi bạn thay đổi Dockerfile hoặc dependencies:

```bash
# Rebuild và khởi động lại
docker-compose up --build

# Hoặc rebuild mà không start
docker-compose build
```

## 🔧 Cấu hình

### File docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: food-shop-frontend
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_BASE_URL=http://localhost:8000/api
```

### Environment Variables

Chỉnh sửa file `.env` để thay đổi cấu hình:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_MAX_FILE_SIZE=5242880
```

## 📱 Truy cập ứng dụng

Sau khi container đã chạy, truy cập:

- **Frontend**: http://localhost:5173

## 🐛 Troubleshooting

### Lỗi port đã được sử dụng

Nếu port 5173 đã được sử dụng, chỉnh sửa `docker-compose.yml`:

```yaml
ports:
  - "3000:5173"  # Thay 5173 thành port khác
```

### Lỗi kết nối API

Kiểm tra `VITE_API_BASE_URL` trong file `.env`:

```env
# Nếu backend chạy trong Docker
VITE_API_BASE_URL=http://backend:8000/api

# Nếu backend chạy trên máy local
VITE_API_BASE_URL=http://localhost:8000/api

# Nếu backend chạy trên server
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Container không khởi động

```bash
# Xem logs để debug
docker-compose logs frontend

# Xóa tất cả và rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Lỗi node_modules

```bash
# Xóa node_modules và rebuild
rm -rf node_modules
docker-compose down -v
docker-compose up --build
```

## 🚀 Production Deployment

### Build production image

```bash
docker build -f Dockerfile.prod -t foodshop-frontend:prod .
```

### Run production container

```bash
docker run -d \
  -p 80:80 \
  --name foodshop-frontend \
  foodshop-frontend:prod
```

### With Docker Compose (Production)

Tạo file `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: food-shop-frontend-prod
    ports:
      - "80:80"
    restart: unless-stopped
```

Chạy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Các lệnh Docker hữu ích

```bash
# Liệt kê containers đang chạy
docker ps

# Liệt kê tất cả containers
docker ps -a

# Xem logs của container
docker logs food-shop-frontend

# Truy cập vào container
docker exec -it food-shop-frontend sh

# Xóa container
docker rm food-shop-frontend

# Xóa image
docker rmi foodshop-frontend

# Xóa tất cả containers đã dừng
docker container prune

# Xóa tất cả images không sử dụng
docker image prune -a
```

## 🔄 Hot Reload

Hot reload đã được cấu hình sẵn. Khi bạn thay đổi code, ứng dụng sẽ tự động reload.

Nếu hot reload không hoạt động, thêm vào `vite.config.js`:

```javascript
server: {
  watch: {
    usePolling: true,
  },
}
```

## 📝 Notes

- Volume mapping `-v .:/app` cho phép hot reload
- Volume `-v /app/node_modules` tránh conflict với host machine
- Port 5173 là port mặc định của Vite
- Environment variables phải bắt đầu với `VITE_` để được expose ra client

## 🆘 Cần trợ giúp?

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs: `docker-compose logs -f`
2. Rebuild container: `docker-compose up --build`
3. Xóa và tạo lại: `docker-compose down -v && docker-compose up`
4. Liên hệ team development
