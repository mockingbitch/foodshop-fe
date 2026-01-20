# Food Shop Frontend

React-based frontend application for Food Shop project with Docker support.

## 📋 Project Overview

This is a comprehensive food discovery platform that allows users to:
- Browse and search restaurants
- Explore food items and categories
- Read news, courses, and chef profiles
- Restaurant owners can register and manage their restaurants and menu items
- Admins can manage content and moderate listings

### Key Features

- **24 Pages** (Public, Owner, and Admin sections)
- **Multilingual Support** (English, Vietnamese, Korean)
- **Docker Support** for easy deployment
- **Modern UI** with Tailwind CSS
- **Responsive Design** for all devices
- **API Integration** ready with Axios
- **State Management** with Zustand and React Query

## 🛠 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form** - Form management
- **Leaflet** - Maps integration
- **Docker** - Containerization

## 📁 Project Structure

```
FoodShopFrontend/
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # React components
│   │   ├── common/          # Reusable components
│   │   ├── layouts/         # Layout components
│   │   ├── admin/           # Admin-specific components
│   │   └── owner/           # Owner-specific components
│   ├── context/             # React context providers
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── pages/               # Page components
│   │   ├── public/          # Public pages
│   │   ├── owner/           # Owner pages
│   │   └── admin/           # Admin pages
│   ├── services/            # API services
│   │   ├── api/             # API endpoints
│   │   └── axios.js         # Axios configuration
│   ├── utils/               # Utility functions
│   │   ├── helpers.js
│   │   └── storage.js
│   ├── constants/           # Constants and configs
│   ├── locales/             # Translation files
│   │   ├── en.json
│   │   ├── vi.json
│   │   └── ko.json
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Public assets
├── Dockerfile               # Development Dockerfile
├── Dockerfile.prod          # Production Dockerfile
├── docker-compose.yml       # Docker Compose config
├── nginx.conf               # Nginx configuration
├── package.json             # Dependencies
└── vite.config.js           # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (if running without Docker)
- Docker and Docker Compose (if using Docker)

### Option 1: Run with Docker (Recommended)

1. Clone the repository:
```bash
cd FoodShopFrontend
```

2. Create environment file:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
```

3. Start the application:
```bash
# Development mode
docker-compose up

# Or in detached mode
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:5173

5. Stop the application:
```bash
docker-compose down
```

### Option 2: Run Locally (Without Docker)

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

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

# Vietcombank Exchange Rate API
VITE_EXCHANGE_RATE_API=https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx
```

## 📱 Pages Overview

### Public Pages (12 pages)
- Home Page
- Restaurant List & Search
- Restaurant Detail & Menu
- Food Items List & Detail
- Food Categories List & Detail
- News/Course/Chef List & Detail

### Owner Pages (5 pages)
- Owner Register & Login
- Owner Profile
- Restaurant Registration & Edit
- Food Item Create & Edit

### Admin Pages (7 pages)
- Admin Login
- Admin Dashboard
- Restaurant Management
- Food Item Management
- Category Management
- News/Course/Chef Management

## 🌐 API Integration

The application is configured to work with the backend API. All API endpoints are defined in `src/services/api/`:

- `authApi.js` - Authentication
- `restaurantApi.js` - Restaurant CRUD
- `foodApi.js` - Food items CRUD
- `categoryApi.js` - Categories CRUD
- `newsApi.js` - News/Course/Chef CRUD
- `uploadApi.js` - File uploads
- `commonApi.js` - Common utilities
- `adminApi.js` - Admin operations

## 🎨 Styling

The project uses Tailwind CSS for styling with a custom configuration:

- Primary color: Orange (#f97316)
- Secondary color: Green (#22c55e)
- Custom utility classes defined in `src/index.css`

## 🔒 Authentication

The app supports two types of users:

1. **Restaurant Owner** - Can register, add restaurants, and manage food items
2. **Admin** - Can manage all content, moderate listings, and manage categories

Authentication is handled through JWT tokens stored in localStorage.

## 🌍 Internationalization

The app supports 3 languages:
- English (en)
- Vietnamese (vi)
- Korean (ko)

Translation files are located in `src/locales/`.

## 🐳 Docker Commands

### Development

```bash
# Start containers
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build
```

### Production

```bash
# Build production image
docker build -f Dockerfile.prod -t foodshop-frontend:prod .

# Run production container
docker run -p 80:80 foodshop-frontend:prod
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 📞 Support

For support, please contact the development team.

---

**Note:** Make sure the backend API is running before starting the frontend application. Update the `VITE_API_BASE_URL` in `.env` to point to your backend server.
