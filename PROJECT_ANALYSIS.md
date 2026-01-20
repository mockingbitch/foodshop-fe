# Phân Tích Số Lượng Màn Hình Frontend & API Backend
## Food Project - Detailed Count Analysis (Updated)

**Lưu ý:** Tài liệu này đã được cập nhật theo các yêu cầu bổ sung từ requirement.txt

---

## Tổng Quan

| Loại | Số Lượng | Ghi Chú |
|------|----------|---------|
| **Frontend Pages** | 20 pages | Đã loại bỏ Cart, Checkout, Order pages và Course pages riêng |
| **API Endpoints** | 55+ endpoints | Đã gộp News/Course/Chef thành 1 module, loại bỏ Order APIs |
| **React Components** | 40+ | Reusable components |
| **API Controllers** | 11 controllers | Đã gộp Course vào News, loại bỏ Order controller |

---

## Frontend Pages (React.js) - Chi Tiết

### 1. Restaurant Management Pages (6 pages)

| # | Page Route | Page Name | Loại | Mô Tả |
|---|------------|-----------|------|-------|
| 1 | `/restaurants` | Restaurant List | Public | Danh sách tất cả nhà hàng với filters |
| 2 | `/restaurants/search` | Restaurant Search | Public | Tìm kiếm nhà hàng với distance filter (10km) |
| 3 | `/restaurants/:id` | Restaurant Detail | Public | Chi tiết nhà hàng + 5 images + menu + best sellers |
| 4 | `/restaurants/:id/menu` | Restaurant Menu | Public | Menu của nhà hàng cụ thể |
| 5 | `/owner/restaurant/register` | Restaurant Registration | Protected (Owner) | Form đăng ký nhà hàng: chọn country → show code, type, images (Outside 2, Inside 5), links, delivery, remark |
| 6 | `/owner/restaurant/:id/edit` | Restaurant Edit | Protected (Owner) | Chỉnh sửa thông tin nhà hàng |

**Tổng: 6 pages**

### 2. Food Management Pages (6 pages)

| # | Page Route | Page Name | Loại | Mô Tả |
|---|------------|-----------|------|-------|
| 7 | `/food-items` | Food Listing | Public | Danh sách món ăn với filters (best seller, category, vegetarian) |
| 8 | `/food-items/:id` | Food Detail | Public | Chi tiết món ăn + 5 extra images + reviews + related products |
| 9 | `/food-categories` | Food Category List | Public | Danh sách danh mục món ăn |
| 10 | `/food-categories/:id` | Food Category Detail | Public | Chi tiết category + 5 images + video links |
| 11 | `/owner/food-items/create` | Food Item Create | Protected (Owner) | Form upload món ăn: chọn ngôn ngữ → nhà hàng (auto show city/name) → category → 1 ảnh chính → price (USD auto convert) → food code auto generate |
| 12 | `/owner/food-items/:id/edit` | Food Item Edit | Protected (Owner) | Chỉnh sửa món ăn |

**Tổng: 6 pages**

### 3. News/Course/Chef Pages (Gộp chung - 3 pages)

**Lưu ý:** News, Course và Chef được gộp thành 1 module tin tức với field `type` để phân biệt (news, course, chef)

| # | Page Route | Page Name | Loại | Mô Tả |
|---|------------|-----------|------|-------|
| 13 | `/news` | News/Course/Chef List | Public | Danh sách tin tức (filter by type: news, course, chef) |
| 14 | `/news/:id` | News/Course/Chef Detail | Public | Chi tiết tin tức (hiển thị khác nhau tùy type) |
| 15 | `/admin/news/create` | News/Course/Chef Create | Protected (Admin) | Form tạo tin tức (chọn type: news/course/chef) |

**Tổng: 3 pages** (đã gộp Course vào News)

### 4. Category Management Pages (3 pages)

| # | Page Route | Page Name | Loại | Mô Tả |
|---|------------|-----------|------|-------|
| 17 | `/admin/categories/create` | Category Create | Protected (Admin) | Form tạo category (popup workflow, 5 images, multilingual) |
| 18 | `/admin/categories/:id/edit` | Category Edit | Protected (Admin) | Chỉnh sửa category |
| 19 | `/admin/categories` | Category Management | Protected (Admin) | Danh sách và quản lý categories |

**Tổng: 3 pages**

### 4. User & Profile Pages (2 pages) - Chỉ cho Restaurant Owner

**Lưu ý:** Không có user đăng ký/login cho customer. Chỉ có restaurant owner đăng ký và quản lý nhà hàng.

| # | Page Route | Page Name | Loại | Mô Tả |
|---|------------|-----------|------|-------|
| 16 | `/owner/register` | Restaurant Owner Register | Public | Đăng ký tài khoản chủ nhà hàng |
| 17 | `/owner/login` | Restaurant Owner Login | Public | Đăng nhập cho chủ nhà hàng |
| 18 | `/owner/profile` | Owner Profile | Protected (Owner) | Xem và chỉnh sửa profile chủ nhà hàng |

**Tổng: 3 pages** (đã loại bỏ customer register/login)

### 5. Admin Management Pages (4 pages)

| # | Page Route | Page Name | Loại | Mô Tả |
|---|------------|-----------|------|-------|
| 19 | `/admin/dashboard` | Admin Dashboard | Protected (Admin) | Dashboard quản lý (statistics, restaurants, food items) |
| 20 | `/admin/restaurants` | Admin Restaurant List | Protected (Admin) | Xem danh sách nhà hàng, edit status (ẩn/hiện) |
| 21 | `/admin/restaurants/:id/food-items` | Admin Food Items List | Protected (Admin) | Xem món ăn của nhà hàng, edit status (ẩn/hiện) |
| 22 | `/admin/login` | Admin Login | Public | Đăng nhập admin |

**Tổng: 4 pages**

### 6. Additional Pages (1 page)

| # | Page Route | Page Name | Loại | Mô Tả |
|---|------------|-----------|------|-------|
| 23 | `/` | Home Page | Public | Trang chủ với featured restaurants, news/course/chef |

**Tổng: 1 page**

---

## 📈 Tổng Kết Frontend Pages

| Category | Số Lượng | Chi Tiết |
|----------|----------|----------|
| **Public Pages** | 12 pages | Accessible without authentication |
| **Protected Pages (Owner)** | 5 pages | Require restaurant_owner login |
| **Protected Pages (Admin)** | 7 pages | Require admin login |
| **TỔNG CỘNG** | **24 pages** | Bao gồm tất cả các trang và sub-pages |

### Phân Loại Theo Chức Năng:

- **Restaurant Management:** 6 pages
- **Food Management:** 6 pages
- **News/Course/Chef Management:** 3 pages (gộp chung, filter by type)
- **Category Management:** 3 pages (Admin only)
- **User & Profile (Owner only):** 3 pages
- **Admin Management:** 4 pages
- **Additional:** 1 page (Home)

### Thay Đổi So Với Phiên Bản Trước:

- ❌ **Đã loại bỏ:** Cart, Checkout, Order History pages (không có shopping cart online)
- ❌ **Đã loại bỏ:** Customer/Student register/login pages
- ✅ **Đã gộp:** Course và Chef vào News module (dùng field `type` để phân biệt)
- ✅ **Đã thêm:** Admin pages để quản lý status (ẩn/hiện) của restaurants và food items

---

## 🔌 Backend API Endpoints (Laravel) - Chi Tiết

### 1. Restaurant APIs (9 endpoints)

**Lưu ý:** Restaurant có thêm fields: `phone`, `zalo`, `delivery_available` (có ship hay không). Khách hàng liên lạc trực tiếp qua phone/zalo.

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/restaurants` | `index()` | Lấy danh sách nhà hàng (chỉ hiển thị status = 'active') |
| GET | `/api/restaurants/search` | `search()` | Tìm kiếm nhà hàng (by name, category) |
| GET | `/api/restaurants/nearby` | `getNearby()` | Tìm nhà hàng trong bán kính 10km |
| GET | `/api/restaurants/{id}` | `show($id)` | Lấy chi tiết nhà hàng + 5 images + menu + phone/zalo |
| POST | `/api/restaurants` | `store()` | Restaurant owner đăng ký nhà hàng (chọn country → auto code, type, images: Outside 2, Inside 5, links, delivery, remark) |
| PUT | `/api/restaurants/{id}` | `update($id)` | Restaurant owner cập nhật thông tin nhà hàng |
| DELETE | `/api/restaurants/{id}` | `destroy($id)` | Restaurant owner xóa nhà hàng |
| PUT | `/api/admin/restaurants/{id}/status` | `updateStatus($id)` | Admin cập nhật status (ẩn/hiện) nhà hàng |
| GET | `/api/admin/restaurants` | `adminIndex()` | Admin xem danh sách tất cả nhà hàng (kể cả status = 'hidden') |

**Controller:** `RestaurantController`  
**Tổng: 9 endpoints**

**Database Schema Updates:**
- Thêm fields: `phone` (string), `zalo` (string), `delivery_available` (boolean), `status` (enum: 'active', 'hidden')
- Thêm field: `restaurant_type_id` (foreign key to restaurant_types table)
- Thêm field: `code` (string, unique) - Liên kết theo code, không dùng ID
- Thêm field: `remark` (text, multilingual JSON) - Điều kiện giao hàng, điều kiện thanh toán
- Images: `outside_image_1`, `outside_image_2` (Max 2), `inside_image_1` to `inside_image_5` (Max 5)
- Links: `youtube_link`, `facebook_link`, `webpage_link`

**Restaurant Type Table:**
- Table: `restaurant_types` (nhập tay vào DB, không cần view)
- Fields: `id`, `code` (string: 'general', 'snack_bar', 'buffet'), `name` (multilingual JSON)
- Values: General, Snack Bar, Buffet

**Yêu Cầu Bổ Sung:**
- Chọn country → tự động show country code ở dưới (ccTLDs - country domain codes)
- Restaurant có type: General, snack bar, buffet (trong table, không cần view nhập)
- Images: Outside - Max 2 pic, Inside - Max 5 pic
- Có code... liên kết theo code, không dùng ID
- Remark: Điều kiện giao hàng, điều kiện thanh toán (đa ngôn ngữ - 현지어 / 영문)

### 2. Food Item APIs (9 endpoints)

**Lưu ý:** Food Item có field `status` để admin ẩn/hiện. Admin chỉ edit status, không thêm mới.

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/food-items` | `index()` | Lấy danh sách món ăn (chỉ hiển thị status = 'active') |
| GET | `/api/food-items/search` | `search()` | Tìm kiếm món ăn (by name, code, restaurant) |
| GET | `/api/food-items/by-category/{categoryId}` | `getByCategory($categoryId)` | Lấy món ăn theo category |
| GET | `/api/food-items/best-seller` | `getBestSeller()` | Lấy danh sách best seller |
| GET | `/api/food-items/{id}` | `show($id)` | Lấy chi tiết món ăn + 5 extra images |
| POST | `/api/food-items` | `store()` | Restaurant owner upload món ăn (chọn ngôn ngữ → nhà hàng → auto city/name → category → 1 ảnh chính → price với USD auto convert → food code auto generate) |
| POST | `/api/food-items/{id}/confirm-code` | `confirmFoodCode($id)` | Manager confirm Food Code (chuyển status từ pending → confirmed) |
| GET | `/api/admin/food-items/pending-codes` | `getPendingFoodCodes()` | Admin xem danh sách Food Code chờ confirm |
| PUT | `/api/food-items/{id}` | `update($id)` | Restaurant owner cập nhật món ăn |
| DELETE | `/api/food-items/{id}` | `destroy($id)` | Restaurant owner xóa món ăn |
| PUT | `/api/admin/food-items/{id}/status` | `updateStatus($id)` | Admin cập nhật status (ẩn/hiện) món ăn |
| GET | `/api/admin/restaurants/{restaurantId}/food-items` | `getRestaurantFoodItems($restaurantId)` | Admin xem món ăn của nhà hàng (kể cả status = 'hidden') |

**Controller:** `FoodItemController`  
**Tổng: 11 endpoints** (thêm 2 endpoints cho Food Code confirmation)

**Database Schema Updates:**
- Thêm field: `status` (enum: 'active', 'hidden')
- Thêm field: `food_code` (string, unique) - Format: KR-0001-0102 (quốc gia, mã nhà hàng, mã category, mã món ăn)
- Thêm field: `food_code_status` (enum: 'pending', 'confirmed') - Cần Manager confirm
- Thêm field: `main_image` (string) - 1 ảnh chính (không phải 5 ảnh)
- Thêm field: `extra_images` (JSON array) - 5 extra images (optional)
- Thêm field: `price_usd` (decimal) - Giá USD (tự động tính từ price local)
- Thêm field: `customer_rating` (float) - Lưu sau khi người dùng review
- Thêm field: `customer_review_count` (integer)

**Yêu Cầu Bổ Sung:**
- **Workflow nhập món ăn:**
  1. Chọn ngôn ngữ (Language)
  2. Chọn nhà hàng (Restaurant Code) → Tự động show:
     - Tên thành phố (City Name - 자동)
     - Tên nhà hàng (Restaurant Name - 자동)
  3. Chọn category (Food Category II)
  4. Nhập tên món ăn (Food Name - 자동, theo ngôn ngữ đã chọn)
  5. Upload 1 ảnh chính (One food photo - 음식사진 한장)
  6. Nhập: Serving size (인분), Weight (대략 무게 - gram), Price (가격 - 현지 화폐)
  7. Food Code tự động tạo: KR-0001-0102 (quốc gia-mã nhà hàng-mã category-mã món ăn)
  8. Food Code cần Manager confirm (Confirm by Manager)
  9. Customer Rating: Lưu sau khi người dùng review (không nhập trong form này)

- **Giá tiền (Price):**
  - Hiển thị tiền địa phương (Local currency)
  - USD tự động show ra theo công thức ngoại hối (dùng JSON giá của Vietcombank API)
  - Tức là nhập 1 giá USD, sau đó show ra giá VND hoặc đơn vị khác
  - API: Vietcombank exchange rate API

- **Food Code Structure:**
  - Format: `{COUNTRY_CODE}-{RESTAURANT_CODE}-{CATEGORY_CODE}-{FOOD_CODE}`
  - Ví dụ: KR-0001-0102
  - Tự động generate, cần Manager confirm trước khi active

### 3. Food Category APIs (6 endpoints)

**Lưu ý:** 
- 5 images là chung cho tất cả languages
- Name và description nhập theo từng language (popup/dropdown)
- Category có parent category (self-referencing)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/food-categories` | `index()` | Lấy danh sách categories (có parent category) |
| GET | `/api/food-categories/{id}` | `show($id)` | Lấy chi tiết category + 5 images + multilingual name/description |
| POST | `/api/food-categories` | `store()` | Admin tạo category (upload 5 images chung, nhập name/description theo language) |
| PUT | `/api/food-categories/{id}` | `update($id)` | Admin cập nhật category |
| DELETE | `/api/food-categories/{id}` | `destroy($id)` | Admin xóa category |
| POST | `/api/food-categories/{id}/translations` | `addTranslation($id)` | Admin thêm/sửa translation cho category (name, description theo language) |

**Controller:** `FoodCategoryController`  
**Tổng: 6 endpoints**

**Database Schema:**
- Table: `food_categories`
- Fields: `id`, `parent_id` (nullable, foreign key to food_categories), `code` (4 digits), `image_1` to `image_5`, `created_at`, `updated_at`
- Table: `food_category_translations`
- Fields: `id`, `food_category_id`, `language_code` (VN, US, KR...), `name`, `description`, `video_link`

### 4. News/Course/Chef APIs (Gộp chung - 6 endpoints)

**Lưu ý:** News, Course và Chef được gộp thành 1 module với field `type` (news, course, chef)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/news` | `index()` | Lấy danh sách tin tức (filter by type: news/course/chef) |
| GET | `/api/news/by-type/{type}` | `getByType($type)` | Lấy tin tức theo type (news, course, chef) |
| GET | `/api/news/{id}` | `show($id)` | Lấy chi tiết tin tức (hiển thị khác nhau tùy type) |
| POST | `/api/news` | `store()` | Admin tạo tin tức (chọn type: news/course/chef) |
| PUT | `/api/news/{id}` | `update($id)` | Cập nhật tin tức |
| DELETE | `/api/news/{id}` | `destroy($id)` | Xóa tin tức |

**Controller:** `NewsController` (đã gộp Course và Chef vào)  
**Tổng: 6 endpoints**

**Database Schema:**
- Table: `news` (hoặc `posts`)
- Fields: `id`, `type` (enum: 'news', 'course', 'chef'), `category_id`, `title`, `content`, `image`, `status`, `created_at`, `updated_at`

### 7. Menu APIs (5 endpoints)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/restaurants/{restaurantId}/menus` | `getMenus($restaurantId)` | Lấy menu của nhà hàng |
| GET | `/api/menus/{id}` | `show($id)` | Lấy chi tiết menu item |
| POST | `/api/menus` | `store()` | Tạo menu item |
| PUT | `/api/menus/{id}` | `update($id)` | Cập nhật menu item |
| DELETE | `/api/menus/{id}` | `destroy($id)` | Xóa menu item |

**Controller:** `MenuController`  
**Tổng: 5 endpoints**


### 9. Search & Filter APIs (4 endpoints)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/search/restaurants` | `searchRestaurants()` | Tìm kiếm nhà hàng tổng hợp (name, category, price, rating) |
| GET | `/api/search/food-items` | `searchFoodItems()` | Tìm kiếm món ăn tổng hợp |
| GET | `/api/search/food-items/by-category` | `searchFoodByCategory()` | Lấy món ăn theo category |
| GET | `/api/search/restaurants/by-distance` | `searchByDistance()` | Tìm nhà hàng theo khoảng cách (default: 10km) |

**Controller:** `SearchController`  
**Tổng: 4 endpoints**

### 9. Authentication & User APIs (6 endpoints) - Chỉ cho Restaurant Owner & Admin

**Lưu ý:** Không có customer/student register/login. Chỉ có restaurant owner và admin.

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| POST | `/api/owner/register` | `registerOwner()` | Đăng ký tài khoản chủ nhà hàng |
| POST | `/api/owner/login` | `loginOwner()` | Đăng nhập chủ nhà hàng |
| POST | `/api/admin/login` | `loginAdmin()` | Đăng nhập admin |
| POST | `/api/auth/logout` | `logout()` | Đăng xuất |
| GET | `/api/auth/me` | `me()` | Lấy thông tin user hiện tại (owner/admin) |
| PUT | `/api/owner/profile` | `updateOwnerProfile()` | Cập nhật profile chủ nhà hàng |

**Controller:** `AuthController`  
**Tổng: 6 endpoints**

### 10. File Upload APIs (3 endpoints)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| POST | `/api/upload/images` | `uploadImages()` | Upload multiple images (5 images for category/food item) |
| POST | `/api/upload/restaurant-images` | `uploadRestaurantImages()` | Upload 5 restaurant images (Outside, Inside) |
| POST | `/api/upload/food-images` | `uploadFoodImages()` | Upload main image + 5 extra images cho food item |

**Controller:** `FileUploadController`  
**Tổng: 3 endpoints**


| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/admin/food-codes/pending` | `getPendingCodes()` | Lấy danh sách Food Code chờ confirm |
| POST | `/api/admin/food-codes/{id}/confirm` | `confirmCode($id)` | Manager confirm Food Code |
| POST | `/api/admin/food-codes/{id}/reject` | `rejectCode($id)` | Manager reject Food Code |

**Controller:** `AdminFoodCodeController`  
**Tổng: 3 endpoints**

### 7. Admin Management APIs (5 endpoints)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/admin/dashboard/stats` | `getStats()` | Statistics tổng quan (restaurants, food items, news, etc.) |
| GET | `/api/admin/restaurants` | `getRestaurants()` | Admin xem danh sách tất cả nhà hàng |
| GET | `/api/admin/restaurants/{id}/food-items` | `getRestaurantFoodItems($id)` | Admin xem món ăn của nhà hàng |
| PUT | `/api/admin/restaurants/{id}/status` | `updateRestaurantStatus($id)` | Admin cập nhật status nhà hàng (ẩn/hiện) |
| PUT | `/api/admin/food-items/{id}/status` | `updateFoodItemStatus($id)` | Admin cập nhật status món ăn (ẩn/hiện) |

**Controller:** `AdminController`  
**Tổng: 5 endpoints**

### 11. Review & Rating APIs (4 endpoints)

### 12. Restaurant Type APIs (1 endpoint)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/restaurant-types` | `index()` | Lấy danh sách restaurant types (General, Snack Bar, Buffet) |

**Controller:** `RestaurantTypeController`  
**Tổng: 1 endpoint**

**Lưu ý:** Restaurant types được nhập tay vào database, không cần CRUD views.

### 13. Exchange Rate APIs (1 endpoint)

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/exchange-rates` | `getExchangeRates()` | Lấy tỷ giá ngoại hối từ Vietcombank API (USD → VND và các đơn vị khác) |

**Controller:** `ExchangeRateController`  
**Tổng: 1 endpoint**

**Lưu ý:** 
- Tích hợp với Vietcombank Exchange Rate API
- Tự động convert giá USD sang VND và các đơn vị khác
- Hiển thị trong form nhập món ăn khi nhập giá

| Method | Endpoint | Controller Method | Mô Tả |
|--------|----------|-------------------|-------|
| GET | `/api/food-items/{foodItemId}/reviews` | `getReviews($foodItemId)` | Lấy reviews của món ăn |
| POST | `/api/food-items/{foodItemId}/reviews` | `storeReview($foodItemId)` | Tạo review cho món ăn |
| GET | `/api/restaurants/{restaurantId}/reviews` | `getRestaurantReviews($restaurantId)` | Lấy reviews của nhà hàng |
| POST | `/api/restaurants/{restaurantId}/reviews` | `storeRestaurantReview($restaurantId)` | Tạo review cho nhà hàng |

**Controller:** `ReviewController`  
**Tổng: 4 endpoints**

---

## Tổng Kết API Endpoints

| Controller | Số Lượng Endpoints | Chi Tiết |
|------------|-------------------|----------|
| `RestaurantController` | 9 | CRUD + search + nearby + admin status management |
| `FoodItemController` | 11 | CRUD + search + best seller + by category + admin status management + food code confirmation |
| `FoodCategoryController` | 6 | CRUD + multilingual translations + parent category |
| `NewsController` | 6 | CRUD cho news/course/chef (gộp chung, filter by type) |
| `MenuController` | 5 | CRUD cho menu items |
| `SearchController` | 4 | Search tổng hợp |
| `AuthController` | 6 | Owner/Admin register/login, logout, profile |
| `FileUploadController` | 3 | Upload images |
| `AdminController` | 5 | Admin dashboard, restaurant/food items management, status control |
| `ReviewController` | 4 | Reviews cho food & restaurant |
| `LanguageController` | 2 | Get languages (không có CRUD, nhập tay vào DB) |
| `CountryController` | 2 | Get countries (không có CRUD, nhập tay vào DB) |
| `RestaurantTypeController` | 1 | Get restaurant types (không có CRUD, nhập tay vào DB) |
| `ExchangeRateController` | 1 | Get Vietcombank exchange rates |
| `AdminFoodCodeController` | 3 | Food Code confirmation workflow |
| **TỔNG CỘNG** | **65 endpoints** | Bao gồm tất cả các endpoints (đã loại bỏ Order, Course riêng, thêm Food Code confirmation, Restaurant Types, Exchange Rates) |

### Phân Loại Theo HTTP Method:

| HTTP Method | Số Lượng | Tỷ Lệ |
|-------------|----------|-------|
| **GET** | 28 endpoints | 46% |
| **POST** | 18 endpoints | 30% |
| **PUT** | 13 endpoints | 21% |
| **DELETE** | 2 endpoints | 3% |

### Phân Loại Theo Authentication:

| Loại | Số Lượng | Chi Tiết |
|------|----------|----------|
| **Public APIs** | 20 endpoints | Không cần authentication (GET restaurants, foods, news, categories) |
| **Owner APIs** | 12 endpoints | Chỉ restaurant owner (upload/edit restaurant, food items) |
| **Admin APIs** | 11 endpoints | Chỉ admin (upload category, news, manage status) |
| **Public Auth APIs** | 3 endpoints | Owner/Admin register/login (public) |
| **Protected Auth APIs** | 3 endpoints | Logout, profile (cần authentication) |

---

## Mapping: Frontend Pages ↔ Backend APIs

### Page: Restaurant List (`/restaurants`)
- **API sử dụng:**
  - `GET /api/restaurants` - Lấy danh sách
  - `GET /api/search/restaurants` - Search với filters
  - `GET /api/restaurants/nearby` - Find nearby (10km)

### Page: Restaurant Search (`/restaurants/search`)
- **API sử dụng:**
  - `GET /api/restaurants/search` - Search by name/category
  - `GET /api/restaurants/nearby` - Find within 10km
  - `GET /api/restaurants/{id}` - Detail khi click restaurant

### Page: Restaurant Detail (`/restaurants/:id`)
- **API sử dụng:**
  - `GET /api/restaurants/{id}` - Restaurant info + 5 images
  - `GET /api/restaurants/{restaurantId}/menus` - Menu
  - `GET /api/food-items/best-seller?restaurant_id={id}` - Best sellers
  - `GET /api/restaurants/{restaurantId}/reviews` - Reviews

### Page: Food Listing (`/food-items`)
- **API sử dụng:**
  - `GET /api/food-items` - List tất cả
  - `GET /api/food-items/search` - Search
  - `GET /api/food-items/best-seller` - Filter best seller
  - `GET /api/food-items/by-category/{categoryId}` - Filter by category

### Page: Food Detail (`/food-items/:id`)
- **API sử dụng:**
  - `GET /api/food-items/{id}` - Detail + 5 extra images
  - `GET /api/food-items/{foodItemId}/reviews` - Reviews
  - `POST /api/food-items/{foodItemId}/reviews` - Create review
  - `GET /api/search/food-items` - Related products

### Page: Food Category (`/food-categories`)
- **API sử dụng:**
  - `GET /api/food-categories` - List categories
  - `GET /api/food-categories/{id}` - Detail + 5 images + video links

### Page: Restaurant Registration (`/owner/restaurant/register`)
- **API sử dụng:**
  - `GET /api/countries` - Load countries
  - `GET /api/countries/{id}` - Get country code (ccTLDs)
  - `GET /api/restaurant-types` - Load restaurant types (General, Snack Bar, Buffet)
  - `POST /api/restaurants` - Create restaurant (chọn country → auto code, type, images: Outside 2, Inside 5)
  - `POST /api/upload/restaurant-images` - Upload images (Outside max 2, Inside max 5)

### Page: Food Item Create (`/owner/food-items/create`)
- **API sử dụng:**
  - `GET /api/languages` - Load languages
  - `GET /api/restaurants` - Load restaurants (owner's restaurants)
  - `GET /api/restaurants/{id}` - Get restaurant info (auto show city, name)
  - `GET /api/food-categories` - Load categories
  - `POST /api/food-items` - Create food item (1 main image, price với USD auto convert)
  - `POST /api/upload/food-image` - Upload 1 ảnh chính
  - `GET /api/exchange-rates` - Get Vietcombank exchange rates (để convert USD → VND)

### Page: Category Create (`/admin/categories/create`)
- **API sử dụng:**
  - `POST /api/food-categories` - Create category
  - `POST /api/food-categories/{id}/images` - Upload 5 images

### Page: News/Course/Chef List (`/news`)
- **API sử dụng:**
  - `GET /api/news` - List tin tức (filter by type: news/course/chef)
  - `GET /api/news/by-type/{type}` - Filter theo type cụ thể

### Page: News/Course/Chef Detail (`/news/:id`)
- **API sử dụng:**
  - `GET /api/news/{id}` - Detail tin tức (hiển thị khác nhau tùy type)

### Page: Admin Restaurant List (`/admin/restaurants`)
- **API sử dụng:**
  - `GET /api/admin/restaurants` - List tất cả nhà hàng (kể cả hidden)
  - `PUT /api/admin/restaurants/{id}/status` - Update status (ẩn/hiện)

### Page: Admin Food Items List (`/admin/restaurants/:id/food-items`)
- **API sử dụng:**
  - `GET /api/admin/restaurants/{restaurantId}/food-items` - List món ăn của nhà hàng
  - `PUT /api/admin/food-items/{id}/status` - Update status (ẩn/hiện)

### Page: Owner Profile (`/owner/profile`)
- **API sử dụng:**
  - `GET /api/auth/me` - Get current owner info
  - `PUT /api/owner/profile` - Update owner profile

### Page: Admin Dashboard (`/admin/dashboard`)
- **API sử dụng:**
  - `GET /api/admin/dashboard/stats` - Statistics (restaurants, food items, news)

---

## Summary Table

### Frontend Pages Summary:

| Category | Pages | Route Prefix |
|----------|-------|--------------|
| Restaurant | 6 | `/restaurants`, `/owner/restaurant` |
| Food | 6 | `/food-items`, `/owner/food-items`, `/food-categories` |
| News/Course/Chef | 3 | `/news`, `/admin/news` (gộp chung, filter by type) |
| Category | 3 | `/admin/categories` |
| Owner | 3 | `/owner/register`, `/owner/login`, `/owner/profile` |
| Admin | 4 | `/admin/login`, `/admin/dashboard`, `/admin/restaurants` |
| Additional | 1 | `/` (Home) |
| **TOTAL** | **26 pages** | Đã loại bỏ Cart, Checkout, Order, Customer pages |

### Backend APIs Summary:

| Category | Endpoints | Controller |
|----------|-----------|------------|
| Restaurant | 9 | `RestaurantController` (thêm admin status management) |
| Food Item | 11 | `FoodItemController` (thêm admin status management, food code confirmation) |
| Food Category | 6 | `FoodCategoryController` (thêm parent category, multilingual) |
| News/Course/Chef | 6 | `NewsController` (gộp chung, filter by type) |
| Menu | 5 | `MenuController` |
| Search | 4 | `SearchController` |
| Auth | 6 | `AuthController` (chỉ owner/admin, không có customer) |
| File Upload | 3 | `FileUploadController` |
| Admin | 5 | `AdminController` (dashboard, status management) |
| Review | 4 | `ReviewController` |
| Language | 2 | `LanguageController` (GET only, không có CRUD) |
| Country | 2 | `CountryController` (GET only, không có CRUD) |
| **TOTAL** | **61 endpoints** | 12 controllers (đã loại bỏ Order, Course riêng) |

---

## React Components Estimated Count

| Component Category | Số Lượng Components | Examples |
|-------------------|---------------------|----------|
| **Layout Components** | 5 | Header, Footer, Sidebar, Container, ProtectedRoute |
| **UI Components** | 10 | Button, Input, Select, Card, Modal, ImageGallery, Rating, SearchBar, FilterButtons, LoadingSpinner |
| **Restaurant Components** | 7 | RestaurantCard, RestaurantList, RestaurantDetail, RestaurantSearchForm, RestaurantImageGallery, RestaurantMenu, RestaurantBestSeller |
| **Food Components** | 7 | FoodItemCard, FoodItemList, FoodItemDetail, FoodItemImageGallery, FoodCategoryCard, FoodCategoryForm, FoodNewsCard |
| **Course Components** | 5 | CourseCard, CourseList, CourseDetail, CourseEnrollmentForm, StudentList |
| **Form Components** | 7 | RestaurantRegistrationForm, FoodItemForm, CategoryForm, NewsForm, OwnerRegisterForm, OwnerLoginForm, AdminLoginForm |
| **Admin Components** | 4 | AdminDashboard, AdminRestaurantList, AdminFoodItemList, StatusToggle |
| **TOTAL** | **41 components** | Đã loại bỏ Order components, Course components riêng |

---

## Development Effort Estimation

### Frontend (React.js):

| Task | Estimated Hours |
|------|-----------------|
| Setup Project & Routing | 4h |
| Layout Components | 8h |
| UI Components | 12h |
| Restaurant Pages (6 pages) | 24h |
| Food Pages (6 pages) | 24h |
| News/Course/Chef Pages (3 pages) | 16h |
| Category Pages (3 pages) | 12h |
| Owner Pages (3 pages) | 12h |
| Admin Pages (4 pages) | 16h |
| Additional Pages (1 page) | 4h |
| State Management Setup | 8h |
| API Integration | 12h |
| Authentication Flow (Owner/Admin only) | 6h |
| File Upload Handling | 8h |
| Testing & Bug Fixes | 16h |
| **TOTAL FRONTEND** | **190 hours (~5 weeks)** |

### Backend (Laravel):

| Task | Estimated Hours |
|------|-----------------|
| Project Setup & Database | 4h |
| Models & Migrations | 12h |
| Restaurant APIs (9 endpoints) | 18h |
| Food Item APIs (9 endpoints) | 20h |
| Food Category APIs (6 endpoints) | 16h (thêm parent category, multilingual) |
| News/Course/Chef APIs (6 endpoints) | 14h (gộp chung, filter by type) |
| Menu APIs (5 endpoints) | 12h |
| Search APIs (4 endpoints) | 12h |
| Auth APIs (6 endpoints) | 12h (chỉ owner/admin) |
| File Upload APIs (3 endpoints) | 12h |
| Admin APIs (5 endpoints) | 12h (status management) |
| Review APIs (4 endpoints) | 8h |
| Language/Country APIs (4 endpoints) | 4h (GET only) |
| Authentication & Authorization | 10h |
| Multilingual Support | 8h |
| Distance Calculation (10km) | 4h |
| Testing & Bug Fixes | 18h |
| **TOTAL BACKEND** | **202 hours (~5 weeks)** |

---

## 📋 Tóm Tắt Các Yêu Cầu Bổ Sung (Từ requirement.txt)

### 1. News/Course/Chef Gộp Chung
- ✅ News, Course và Chef là dạng tin tức, do admin quản lý
- ✅ Gộp vào 1 bảng với field `type` (news, course, chef) để phân biệt
- ✅ Không cần view riêng cho Course và Chef, chỉ cần check field `type`
- ✅ Category có 2 loại: "news" và "course" (dùng cho filter)

### 2. Không Có Shopping Cart Online
- ❌ Đã loại bỏ: Cart, Checkout, Order pages
- ❌ Đã loại bỏ: Order APIs và Order History
- ✅ Khách hàng liên lạc trực tiếp với nhà hàng qua phone/zalo

### 3. Delivery Link - Thông Tin Liên Lạc
- ✅ Restaurant có thêm fields: `phone`, `zalo`, `delivery_available` (có ship hay không)
- ✅ Khách hàng xem thông tin và liên lạc trực tiếp
- ❌ Không có "add to cart" product

### 4. User Đăng Ký/Login - Chỉ Cho Restaurant Owner
- ❌ Không có customer/student đăng ký và login
- ✅ Chỉ có restaurant owner đăng ký và thêm nhà hàng
- ✅ Admin có tài khoản riêng để quản lý

### 5. Admin Quản Lý Status
- ✅ Admin thêm tin tức (news/course/chef) và category
- ✅ Admin xem danh sách nhà hàng và món ăn
- ✅ Restaurant và Food Item có field `status` (active/hidden)
- ✅ Admin có thể edit field `status` để ẩn/hiện nhà hàng và món ăn
- ❌ Admin KHÔNG thêm mới nhà hàng và món ăn (chỉ owner thêm)
- ✅ Admin chỉ edit status, không edit thông tin khác

### 6. Language và Country - Nhập Tay
- ✅ Không cần view để nhập Language và Country
- ✅ Nhập tay trực tiếp vào database (dùng script insert)
- ✅ 2 bảng có field `code` để lưu flag: VN, US, KR, ...
- ✅ Chỉ có GET APIs, không có CRUD APIs

### 7. Category Workflow - Multilingual
- ✅ 5 images là chung cho tất cả languages
- ✅ Sau khi chọn 5 images, click để mở popup/dropdown
- ✅ Trong popup: chọn language → nhập name, description cho language đó
- ✅ Có thể nhập nhiều languages (mỗi language một lần)
- ✅ Video link cũng theo language

### 8. Category - Parent Category
- ✅ Category có parent category (self-referencing)
- ✅ Khi tạo category, có thể chọn 1 category khác làm parent
- ✅ Nhà hàng có thể chọn category nào cũng được (không bắt buộc parent)

### 9. Restaurant Type - Nhập Tay
- ✅ Restaurant có type: General, Snack Bar, Buffet
- ✅ Type được nhập tay vào table `restaurant_types`, không cần view nhập
- ✅ Chỉ có GET API, không có CRUD APIs

### 10. Restaurant Entry Form - Chi Tiết
- ✅ Chọn country → tự động show country code (ccTLDs - country domain codes)
- ✅ Chọn restaurant type (General, Snack Bar, Buffet)
- ✅ Images: Outside - Max 2 pic, Inside - Max 5 pic
- ✅ Links: Youtube, Facebook, Webpage
- ✅ Delivery: Yes/No
- ✅ Remark: Điều kiện giao hàng, điều kiện thanh toán (đa ngôn ngữ - 현지어 / 영문)
- ✅ Liên kết theo code, không dùng ID

### 11. Food Item Entry Form - Chi Tiết
- ✅ **Workflow nhập món ăn:**
  1. Chọn ngôn ngữ (Language)
  2. Chọn nhà hàng (Restaurant Code) → Tự động show:
     - Tên thành phố (City Name - 자동)
     - Tên nhà hàng (Restaurant Name - 자동)
  3. Chọn category (Food Category II)
  4. Nhập tên món ăn (Food Name - 자동, theo ngôn ngữ đã chọn)
  5. Upload 1 ảnh chính (One food photo - 음식사진 한장)
  6. Nhập: Serving size (인분), Weight (대략 무게 - gram), Price (가격 - 현지 화폐)
  7. Food Code tự động tạo: KR-0001-0102 (quốc gia-mã nhà hàng-mã category-mã món ăn)
  8. Food Code cần Manager confirm (Confirm by Manager)
  9. Customer Rating: Lưu sau khi người dùng review (không nhập trong form này)

- ✅ **Giá tiền (Price):**
  - Hiển thị tiền địa phương (Local currency)
  - USD tự động show ra theo công thức ngoại hối (dùng JSON giá của Vietcombank API)
  - Tức là nhập 1 giá USD, sau đó show ra giá VND hoặc đơn vị khác
  - API: Vietcombank exchange rate API

- ✅ **Food Code Structure:**
  - Format: `{COUNTRY_CODE}-{RESTAURANT_CODE}-{CATEGORY_CODE}-{FOOD_CODE}`
  - Ví dụ: KR-0001-0102
  - Tự động generate, cần Manager confirm trước khi active
  - Status: pending → confirmed

---

## 🔄 So Sánh Trước và Sau

| Hạng Mục | Trước | Sau | Thay Đổi |
|----------|-------|-----|----------|
| **Frontend Pages** | 31 pages | 26 pages | -5 pages (loại bỏ Cart, Checkout, Order, Customer pages) |
| **API Endpoints** | 76 endpoints | 61 endpoints | -15 endpoints (loại bỏ Order, Course riêng) |
| **Controllers** | 14 controllers | 12 controllers | -2 controllers (gộp Course vào News) |
| **React Components** | 47 components | 41 components | -6 components (loại bỏ Order components) |
| **User Types** | Customer, Student, Owner, Admin | Owner, Admin | Chỉ còn 2 loại user |
| **News Module** | News riêng, Course riêng | Gộp chung (type: news/course/chef) | Đơn giản hóa |
| **Order System** | Có shopping cart, checkout | Không có | Loại bỏ hoàn toàn |
| **Delivery** | Online order | Liên lạc trực tiếp (phone/zalo) | Thay đổi cách thức |

---

**Tài liệu này đã được cập nhật theo các yêu cầu bổ sung từ requirement.txt. Tất cả các thay đổi đã được phản ánh trong phân tích số lượng màn hình và API endpoints.**

---

## 📝 Thay Đổi Chính So Với Phiên Bản Trước

### Đã Loại Bỏ:
- ❌ Shopping Cart & Checkout pages
- ❌ Order APIs và Order History
- ❌ Customer/Student register/login
- ❌ Course và CourseDetail controllers riêng (gộp vào News)
- ❌ Student enrollment functionality

### Đã Gộp/Thay Đổi:
- ✅ News, Course, Chef → Gộp thành 1 module với field `type`
- ✅ Category có parent category (self-referencing)
- ✅ Category: 5 images chung, name/description theo language (popup workflow)

### Đã Thêm:
- ✅ Restaurant: fields `phone`, `zalo`, `delivery_available`
- ✅ Restaurant & Food Item: field `status` (active/hidden) cho admin quản lý
- ✅ Admin pages để xem và edit status của restaurants và food items
- ✅ Language và Country tables (nhập tay, không có CRUD views)

### Quyền Truy Cập:
- **Public:** Xem restaurants, foods, news/course/chef, categories
- **Restaurant Owner:** Đăng ký, login, thêm/sửa restaurants và food items
- **Admin:** Đăng nhập, thêm news/category, quản lý status (ẩn/hiện) restaurants và food items
