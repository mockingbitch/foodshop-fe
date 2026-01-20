# ⚡ Quick Start Guide

Hướng dẫn nhanh để chạy Food Shop Frontend trong 5 phút!

## 🎯 Chạy Ngay Với Docker (Đề Xuất)

### Bước 1: Tạo File .env

Tạo file `.env` trong thư mục gốc:

```bash
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_MAX_FILE_SIZE=5242880
VITE_DEFAULT_LAT=21.028511
VITE_DEFAULT_LNG=105.804817
VITE_SEARCH_RADIUS_KM=10
VITE_APP_NAME=Food Shop
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,vi,ko
EOF
```

### Bước 2: Chạy Docker

```bash
docker-compose up
```

### Bước 3: Truy Cập

Mở browser: **http://localhost:5173**

Xong! 🎉

---

## 🖥️ Chạy Không Dùng Docker

### Bước 1: Cài Dependencies

```bash
npm install
```

### Bước 2: Tạo File .env

```bash
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_MAX_FILE_SIZE=5242880
EOF
```

### Bước 3: Chạy Dev Server

```bash
npm run dev
```

### Bước 4: Truy Cập

Mở browser: **http://localhost:5173**

Xong! 🎉

---

## 📋 Checklist

Trước khi chạy, đảm bảo:

- [ ] Đã cài Docker Desktop (nếu dùng Docker)
- [ ] Đã cài Node.js 20+ (nếu không dùng Docker)
- [ ] Backend API đang chạy tại http://localhost:8000
- [ ] Đã tạo file `.env`
- [ ] Port 5173 chưa được sử dụng

---

## 🚨 Troubleshooting Nhanh

### Lỗi: "Port 5173 already in use"

```bash
# Kill process đang dùng port
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Lỗi: "Cannot connect to backend"

Kiểm tra backend đang chạy:
```bash
curl http://localhost:8000/api/health
```

### Lỗi Docker: "Cannot start container"

```bash
docker-compose down -v
docker-compose up --build
```

---

## 📱 Test Nhanh

Sau khi chạy thành công, test các trang:

- **Home:** http://localhost:5173/
- **Restaurants:** http://localhost:5173/restaurants
- **Food Items:** http://localhost:5173/food-items
- **Owner Login:** http://localhost:5173/owner/login
- **Admin Login:** http://localhost:5173/admin/login

---

## 🎨 Features Có Sẵn

✅ Routing với 24 pages  
✅ Authentication (Owner & Admin)  
✅ Đa ngôn ngữ (EN, VI, KO)  
✅ API integration sẵn  
✅ Responsive design  
✅ Docker support  
✅ Tailwind CSS  
✅ Hot reload  

---

## 📚 Tài Liệu Đầy Đủ

- **README.md** - Tổng quan project
- **SETUP_INSTRUCTIONS.md** - Hướng dẫn chi tiết
- **DOCKER_GUIDE.md** - Docker guide
- **PROJECT_ANALYSIS.md** - Requirements analysis

---

## 🆘 Cần Giúp?

Nếu gặp vấn đề:

1. Đọc **SETUP_INSTRUCTIONS.md**
2. Đọc **DOCKER_GUIDE.md**
3. Check logs: `docker-compose logs -f`
4. Liên hệ team development

---

**Chúc bạn code vui vẻ! 🚀**
