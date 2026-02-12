# Hướng dẫn sử dụng – Food Shop

Tài liệu hướng dẫn sử dụng hệ thống **Food Shop** dành cho người dùng nghiệp vụ: khách xem thông tin, chủ nhà hàng và quản trị viên.

---

## 1. Giới thiệu hệ thống

**Food Shop** là nền tảng giúp:

- **Khách truy cập** tìm kiếm, xem thông tin nhà hàng và món ăn.
- **Chủ nhà hàng** đăng ký tài khoản, quản lý thông tin nhà hàng và thực đơn của mình.
- **Quản trị viên** quản lý toàn bộ nhà hàng, món ăn, danh mục và tin tức trên hệ thống.

Hệ thống hỗ trợ **đa ngôn ngữ** (Tiếng Việt, English, 한국어). Người dùng có thể chọn ngôn ngữ hiển thị trên giao diện.

---

## 2. Đối tượng sử dụng

| Đối tượng | Mô tả |
|-----------|--------|
| **Khách (Public)** | Bất kỳ ai truy cập website: xem trang chủ, tìm nhà hàng, xem món ăn, danh mục món, tin tức. Không cần đăng nhập. |
| **Chủ nhà hàng (Owner)** | Người đăng ký/đăng nhập để quản lý nhà hàng và món ăn của mình. Chỉ thấy và sửa được dữ liệu thuộc tài khoản của mình. |
| **Quản trị viên (Admin)** | Người đăng nhập bằng tài khoản admin để quản lý toàn bộ nội dung hệ thống (nhà hàng, món, danh mục, tin tức). |

---

## 3. Hướng dẫn cho Khách (người xem thông tin)

### 3.1. Trang chủ

- Vào **Trang chủ** để xem:
  - Ô **tìm kiếm** nhà hàng: nhập từ khóa, nhấn tìm → chuyển sang danh sách nhà hàng có kết quả tìm kiếm.
  - Các **slider nhà hàng** (gợi ý gần đây / nổi bật): kéo ngang để xem thêm, bấm vào thẻ nhà hàng để xem chi tiết.

### 3.2. Xem danh sách nhà hàng

- Vào **Nhà hàng** (menu) để xem toàn bộ nhà hàng.
- Có **phân trang**: dùng nút Trang trước / Trang sau hoặc chọn số trang để xem thêm.
- Bấm vào một nhà hàng → sang **Trang chi tiết nhà hàng**.

### 3.3. Tìm kiếm nhà hàng

- Vào **Tìm kiếm nhà hàng** (hoặc dùng ô tìm trên trang chủ).
- Nhập từ khóa (tên, địa chỉ, …) và thực hiện tìm kiếm.
- Kết quả hiển thị dạng danh sách; bấm vào nhà hàng để xem chi tiết.

### 3.4. Trang chi tiết nhà hàng

- Hiển thị: ảnh, tên, mô tả, địa chỉ, đánh giá, thông tin liên hệ (nếu có).
- Phần **Best Sellers (Món bán chạy)**: danh sách món được đánh dấu bán chạy.
- Phần **Menu (Thực đơn)**: toàn bộ món ăn của nhà hàng (xem dạng lưới hoặc danh sách, có phân trang).
- Bấm vào một món → mở **xem nhanh** (modal) hoặc vào **Trang chi tiết món**.

### 3.5. Trang thực đơn nhà hàng

- Từ trang chi tiết nhà hàng có thể vào **Thực đơn** (Menu).
- Có phần **Best Sellers** riêng phía trên, sau đó là **toàn bộ thực đơn** (lưới hoặc danh sách).
- Bấm vào món để xem chi tiết món.

### 3.6. Xem danh sách món ăn (toàn hệ thống)

- Vào **Món ăn** (menu) để xem danh sách món của nhiều nhà hàng.
- Có phân trang. Bấm vào món → **Trang chi tiết món**.

### 3.7. Trang chi tiết món ăn

- Hiển thị: ảnh, tên, mô tả, giá, đánh giá, số lượng phục vụ, thuộc nhà hàng nào, v.v.
- Có **Breadcrumb** và nút **Quay lại** (quay lại trang trước).
- Nếu vào từ trang nhà hàng, có link quay lại nhà hàng đó.

### 3.8. Danh mục món ăn & Tin tức

- **Danh mục món ăn**: xem danh sách danh mục (ví dụ: Khai vị, Món chính), bấm vào danh mục để xem các món thuộc danh mục đó.
- **Tin tức**: xem danh sách tin, bấm vào tin để xem nội dung chi tiết.

---

## 4. Hướng dẫn cho Chủ nhà hàng (Owner)

### 4.1. Đăng ký tài khoản

- Vào **Đăng ký** (link thường ở Header hoặc trang Đăng nhập).
- Nhập: **Họ tên**, **Email**, **Số điện thoại** (tùy chọn), **Mật khẩu**, **Xác nhận mật khẩu**.
- Nhấn **Đăng ký**. Nếu thành công, hệ thống tự đăng nhập và chuyển vào **Dashboard** chủ nhà hàng.

### 4.2. Đăng nhập

- Vào **Đăng nhập** chủ nhà hàng.
- Nhập **Email** và **Mật khẩu**.
- Có thể tick **Ghi nhớ đăng nhập**:
  - **Có tick**: lần sau mở trình duyệt vẫn còn đăng nhập (trong thời hạn hệ thống quy định).
  - **Không tick**: thoát trình duyệt sẽ hết phiên đăng nhập.
- Nút **Google** / **Facebook**: hiện thông báo chưa hỗ trợ đăng nhập bằng mạng xã hội.
- Sau khi đăng nhập thành công → chuyển vào **Dashboard**.

### 4.3. Dashboard (Bảng điều khiển)

- Chỉ hiển thị **nhà hàng** và **món ăn** thuộc tài khoản của bạn (không thấy nhà hàng/món của chủ khác).
- Có hai tab:
  - **Nhà hàng của tôi**: danh sách nhà hàng bạn đã đăng ký; bấm vào nhà hàng để xem chi tiết hoặc sửa.
  - **Món ăn của tôi**: danh sách món thuộc các nhà hàng của bạn; có link xem chi tiết / sửa món.
- Từ Dashboard có thể vào **Thêm nhà hàng**, **Thêm món**, **Hồ sơ cá nhân**.

### 4.4. Đăng ký nhà hàng mới

- Vào **Thêm nhà hàng** (hoặc tương đương).
- Điền form: tên, mô tả, quốc gia, loại nhà hàng, địa chỉ, thành phố, điện thoại, email, ảnh (ngoài/trong), giờ mở cửa, link mạng xã hội (nếu có), v.v.
- Nhấn **Lưu / Gửi**. Sau khi tạo xong có thể vào **Chi tiết nhà hàng** hoặc **Sửa nhà hàng**.

### 4.5. Xem & sửa nhà hàng

- Từ Dashboard → chọn một nhà hàng → **Chi tiết nhà hàng** (owner).
- Trên trang chi tiết có link **Sửa nhà hàng** → vào form chỉnh sửa thông tin đã nhập lúc đăng ký.
- Có thể **Thêm món** cho nhà hàng (tạo món mới và gắn với nhà hàng này).

### 4.6. Thêm món ăn

- Vào **Thêm món** (có thể chọn nhà hàng nếu có nhiều nhà hàng).
- Điền: tên, mô tả, danh mục món, giá, ảnh, số phần ăn, món chay hay không, bán chạy hay không, v.v.
- Nhấn **Lưu**. Món sẽ xuất hiện trong thực đơn nhà hàng tương ứng (và trên Dashboard món của bạn).

### 4.7. Xem & sửa món ăn

- Từ Dashboard (tab Món ăn) hoặc từ **Chi tiết nhà hàng** → bấm vào một món → **Chi tiết món** (owner).
- Trên trang chi tiết món có link **Sửa món** → chỉnh sửa thông tin món và lưu lại.

### 4.8. Hồ sơ cá nhân

- Vào **Hồ sơ** (Profile) để xem và cập nhật thông tin cá nhân (tên, email, số điện thoại, v.v.) của tài khoản chủ nhà hàng.
- Sau khi sửa, nhấn **Lưu** để áp dụng.

### 4.9. Đăng xuất

- Chọn **Đăng xuất** (thường ở menu góc phải hoặc sidebar) → thoát tài khoản, chuyển về trang chủ hoặc trang đăng nhập.

---

## 5. Hướng dẫn cho Quản trị viên (Admin)

### 5.1. Đăng nhập Admin

- Vào **Đăng nhập Admin** (đường dẫn riêng cho admin, không dùng trang đăng nhập chủ nhà hàng).
- Nhập **Email** và **Mật khẩu** tài khoản admin.
- Có thể tick **Ghi nhớ đăng nhập** tương tự chủ nhà hàng.
- Đăng nhập thành công → chuyển vào **Dashboard Admin**.

### 5.2. Dashboard Admin

- Tổng quan hệ thống (số liệu, shortcut) và menu điều hướng tới các chức năng: **Nhà hàng**, **Món ăn**, **Danh mục**, **Tin tức**.

### 5.3. Quản lý nhà hàng

- Vào **Quản lý nhà hàng** → xem danh sách **tất cả** nhà hàng trên hệ thống (của mọi chủ).
- Bấm vào một nhà hàng có thể xem chi tiết và **danh sách món** của nhà hàng đó.
- Có thể cập nhật trạng thái nhà hàng (ví dụ: duyệt, ẩn) nếu hệ thống hỗ trợ.

### 5.4. Quản lý món ăn theo nhà hàng

- Từ **Quản lý nhà hàng** → chọn nhà hàng → **Món ăn của nhà hàng**.
- Xem danh sách món thuộc nhà hàng đó, có thể duyệt/ẩn trạng thái món (tùy tính năng backend).

### 5.5. Quản lý danh mục món ăn

- Vào **Danh mục** → xem danh sách danh mục (Khai vị, Món chính, …).
- **Thêm danh mục mới**: điền tên, mô tả, mã (nếu có), ảnh (nếu có) → Lưu.
- **Sửa danh mục**: chọn danh mục → Sửa → chỉnh thông tin → Lưu.

### 5.6. Quản lý tin tức

- Vào **Tin tức** → xem danh sách tin.
- **Thêm tin**: điền tiêu đề, nội dung, loại tin, ảnh (nếu có) → Lưu.
- **Sửa tin**: chọn tin → Sửa → chỉnh nội dung → Lưu.

### 5.7. Đăng xuất Admin

- Chọn **Đăng xuất** trong khu vực admin → thoát tài khoản admin, chuyển về trang đăng nhập admin hoặc trang chủ.

---

## 6. Một số tính năng nghiệp vụ chính

| Tính năng | Mô tả |
|-----------|--------|
| **Best Sellers (Món bán chạy)** | Trên trang nhà hàng và trang thực đơn có **mục riêng** “Best Sellers” phía trên, hiển thị các món được đánh dấu bán chạy; bên dưới vẫn là toàn bộ thực đơn. |
| **Ghi nhớ đăng nhập** | Khi đăng nhập (Owner hoặc Admin), tick “Ghi nhớ đăng nhập” để lần sau mở trình duyệt vẫn còn đăng nhập trong thời hạn quy định; không tick thì thoát trình duyệt sẽ hết phiên. |
| **Đa ngôn ngữ** | Giao diện hỗ trợ Tiếng Việt, English, 한국어. Người dùng chọn ngôn ngữ trên website (ví dụ tại Header). |
| **Phân quyền** | Chủ nhà hàng chỉ thấy và sửa được nhà hàng/món của mình; Admin thấy và quản lý toàn bộ. |
| **Chi tiết món** | Có hai cách vào: (1) Từ trang nhà hàng / thực đơn (đường dẫn có id nhà hàng), (2) Từ danh sách món toàn hệ thống. Trang chi tiết có nút Quay lại và breadcrumb phù hợp. |

---

## 7. Lưu ý khi sử dụng

- **Khách**: không cần tài khoản để xem nhà hàng, món ăn, danh mục, tin tức.
- **Chủ nhà hàng**: cần đăng ký và đăng nhập để quản lý nhà hàng và món; mật khẩu nên đủ mạnh và không chia sẻ.
- **Admin**: chỉ dùng tài khoản admin cho người được ủy quyền; không dùng chung với tài khoản chủ nhà hàng.
- Nếu **quên mật khẩu** hoặc **đăng nhập lỗi**: liên hệ bộ phận hỗ trợ hoặc quản trị hệ thống (khôi phục mật khẩu tùy theo quy định triển khai).
- **Đăng nhập Google/Facebook**: hiện chưa hỗ trợ; khi bấm sẽ có thông báo “Chưa hỗ trợ”.

---

*Tài liệu này mô tả cách sử dụng hệ thống Food Shop theo nghiệp vụ, áp dụng cho người dùng cuối (khách, chủ nhà hàng, quản trị viên).*
