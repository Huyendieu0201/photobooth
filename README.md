# little moments — Photobooth

Website photobooth chạy trực tiếp trên trình duyệt, dùng HTML, CSS và JavaScript thuần.

## Cách chạy
1. Giải nén thư mục.
2. Mở bằng VS Code.
3. Khuyến nghị cài extension **Live Server**, nhấn chuột phải `index.html` → **Open with Live Server**.
4. Nhấn **Bật camera** và cho phép trình duyệt truy cập webcam.

Bạn cũng có thể triển khai lên GitHub Pages hoặc hosting có HTTPS. Trình duyệt thường chỉ cho phép webcam trên HTTPS hoặc `localhost`; mở file HTML trực tiếp (`file://`) có thể không hoạt động.

## Tính năng
- Webcam trực tiếp, đổi camera trước/sau (nếu thiết bị hỗ trợ).
- Chụp liên tiếp 2, 3 hoặc 4 ảnh; đếm ngược 3 giây có thể bật/tắt.
- 6 bộ lọc màu áp dụng cho preview và ảnh xuất.
- 4 màu khung ảnh, 3 kiểu sticker và dòng chú thích.
- Ghép ảnh thành photostrip PNG và tải về máy.
- Ảnh được xử lý cục bộ trong trình duyệt; không có backend và không tải ảnh lên máy chủ.

## Cấu trúc
- `index.html`
- `css/style.css`
- `js/app.js`
