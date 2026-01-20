# Hướng Dẫn Setup và Chạy Project

## 🎯 Tổng Quan

Food Shop Frontend là một ứng dụng React hiện đại được xây dựng với Vite, hỗ trợ Docker và có đầy đủ chức năng quản lý nhà hàng và món ăn.

## 📋 Yêu Cầu Hệ Thống

### Cách 1: Chạy với Docker (Đề xuất)
- Docker Desktop 20.10+
- Docker Compose 2.0+
- 2GB RAM trở lên

### Cách 2: Chạy trực tiếp
- Node.js 20+
- npm 9+
- 4GB RAM trở lên

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Chuẩn Bị

```bash
# Clone hoặc download project
cd FoodShopFrontend

# Kiểm tra cấu trúc files
ls -la
```

### Bước 2: Cấu Hình Environment

Tạo file `.env` trong thư mục gốc:

```bash
# Copy từ file mẫu (nếu có)
cp .env.example .env

# Hoặc tạo mới
touch .env
```

Nội dung file `.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000

# Upload Configuration
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg,image/webp

# Map Configuration  
VITE_DEFAULT_LAT=21.028511
VITE_DEFAULT_LNG=105.804817
VITE_SEARCH_RADIUS_KM=10

# App Configuration
VITE_APP_NAME=Food Shop
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,vi,ko

# Exchange Rate API
VITE_EXCHANGE_RATE_API=https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx
```

### Bước 3A: Chạy với Docker

```bash
# Khởi động Docker containers
docker-compose up

# Hoặc chạy ở background
docker-compose up -d

# Xem logs
docker-compose logs -f frontend
```

Truy cập: http://localhost:5173

### Bước 3B: Chạy trực tiếp (không dùng Docker)

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Truy cập: http://localhost:5173

## 📁 Cấu Trúc Project

```
FoodShopFrontend/
├── src/
│   ├── assets/              # Hình ảnh, icons
│   ├── components/          
│   │   ├── common/          # Components dùng chung
│   │   ├── layouts/         # Layouts (Main, Owner, Admin)
│   │   ├── admin/           # Admin components
│   │   └── owner/           # Owner components
│   ├── context/             # React Context
│   │   ├── AuthContext.jsx  # Authentication
│   │   └── LanguageContext.jsx  # Đa ngôn ngữ
│   ├── pages/               # Pages
│   │   ├── public/          # 11 trang public
│   │   ├── owner/           # 5 trang owner
│   │   └── admin/           # 7 trang admin
│   ├── services/            
│   │   ├── api/             # API endpoints (8 files)
│   │   └── axios.js         # Axios config
│   ├── utils/               # Utility functions
│   ├── constants/           # Constants
│   ├── locales/             # i18n (en, vi, ko)
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static files
├── Dockerfile               # Development Dockerfile
├── Dockerfile.prod          # Production Dockerfile
├── docker-compose.yml       # Docker Compose
├── nginx.conf               # Nginx config
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
├── package.json             # Dependencies
├── README.md                # Documentation
├── DOCKER_GUIDE.md          # Docker guide
└── SETUP_INSTRUCTIONS.md    # This file
```

## 🔧 Các Lệnh Thường Dùng

### Development

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Docker

```bash
# Start containers
docker-compose up

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f

# Access container shell
docker exec -it food-shop-frontend sh
```

## 🎨 Features Chính

### 1. Authentication & Authorization
- Owner registration/login
- Admin login
- JWT token authentication
- Protected routes

### 2. Multilingual Support
- English (en)
- Vietnamese (vi)
- Korean (ko)
- Dynamic language switching

### 3. Public Features
- Browse restaurants
- Search restaurants (with 10km radius)
- View restaurant details and menu
- Browse food items
- View food categories
- Read news/courses/chef profiles

### 4. Owner Features
- Register restaurant
- Manage restaurant info
- Add/edit food items
- Upload images
- View profile

### 5. Admin Features
- Dashboard with statistics
- Manage all restaurants
- Manage food items
- Manage categories
- Create news/courses/chef content
- Toggle restaurant/food visibility

## 🌐 API Endpoints

Backend API phải chạy trước khi start frontend. Các endpoints:

### Public APIs
- `GET /api/restaurants` - Danh sách nhà hàng
- `GET /api/restaurants/search` - Tìm kiếm
- `GET /api/restaurants/{id}` - Chi tiết nhà hàng
- `GET /api/food-items` - Danh sách món ăn
- `GET /api/food-categories` - Danh mục
- `GET /api/news` - Tin tức

### Owner APIs
- `POST /api/owner/register` - Đăng ký
- `POST /api/owner/login` - Đăng nhập
- `POST /api/restaurants` - Tạo nhà hàng
- `POST /api/food-items` - Tạo món ăn

### Admin APIs
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - Statistics
- `PUT /api/admin/restaurants/{id}/status` - Toggle status
- `POST /api/food-categories` - Tạo category

## 🎯 Workflow Phát Triển

### 1. Chạy Backend API
Đảm bảo backend API đang chạy tại `http://localhost:8000`

### 2. Start Frontend

```bash
# Với Docker
docker-compose up

# Hoặc không Docker
npm run dev
```

### 3. Truy Cập
- Frontend: http://localhost:5173
- API: http://localhost:8000/api

### 4. Test Features
- Đăng ký Owner account
- Tạo restaurant
- Thêm food items
- Test admin features
- Test public browsing

## 🐛 Troubleshooting

### Lỗi: Cannot connect to API

**Giải pháp:**
1. Kiểm tra backend đang chạy
2. Kiểm tra `VITE_API_BASE_URL` trong `.env`
3. Kiểm tra CORS trên backend

### Lỗi: Port 5173 already in use

**Giải pháp:**
```bash
# Tìm process đang dùng port
lsof -i :5173

# Kill process
kill -9 <PID>

# Hoặc đổi port trong vite.config.js
```

### Lỗi: Module not found

**Giải pháp:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Docker container won't start

**Giải pháp:**
```bash
# Xem logs
docker-compose logs frontend

# Rebuild
docker-compose down -v
docker-compose up --build
```

## 📊 Performance Tips

### Development
- Sử dụng React DevTools
- Sử dụng React Query DevTools
- Hot reload đã được cấu hình sẵn

### Production
- Build size optimization
- Code splitting đã được cấu hình
- Lazy loading cho routes
- Image optimization

## 🔐 Security

### Environment Variables
- Không commit file `.env`
- Sử dụng `.env.example` cho template
- Store secrets securely

### Authentication
- JWT tokens in localStorage
- Automatic token refresh
- Protected routes
- Role-based access control

## 📱 Responsive Design

Website responsive trên tất cả devices:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🎨 Styling

- **Framework:** Tailwind CSS
- **Icons:** Lucide React
- **Colors:** 
  - Primary: Orange (#f97316)
  - Secondary: Green (#22c55e)

## 📚 Documentation

- **README.md** - Tổng quan project
- **DOCKER_GUIDE.md** - Hướng dẫn Docker chi tiết
- **SETUP_INSTRUCTIONS.md** - File này
- **PROJECT_ANALYSIS.md** - Phân tích requirements

## 🤝 Contributing

1. Tạo branch mới
2. Implement features
3. Test kỹ
4. Tạo pull request

## 📞 Support

Liên hệ team development nếu cần hỗ trợ.

---

**Happy Coding! 🚀**
