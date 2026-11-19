# Diễn Đàn Khoa Học Xã Hội & Chính Trị

Website tĩnh (HTML/CSS/JS thuần, không cần build) về chính trị, khoa học xã hội và nghiên cứu liên ngành.

## Tính năng
- Trang chủ, thư viện tài liệu với bộ lọc (lĩnh vực → chuyên ngành → loại tài liệu → từ khóa)
- Phân loại sẵn 12 lĩnh vực, trong đó có mục **Nghiên cứu liên ngành**
- Tải lên Word (.doc/.docx) và PDF, có kiểm tra phần mở rộng, dung lượng và nội dung tệp
- Diễn đàn: chuyên mục, chủ đề, trả lời
- Kiểm duyệt cơ bản: lọc từ cấm (có/không dấu), chống spam liên kết, giới hạn tần suất, nút báo cáo (tự ẩn sau 3 báo cáo), hàng chờ duyệt cho tài liệu, bảng điều khiển kiểm duyệt

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub, ví dụ `khoa-hoc-xa-hoi`.
2. Tải 4 tệp `index.html`, `style.css`, `app.js`, `README.md` lên nhánh `main`.
3. Vào **Settings → Pages → Build and deployment**, chọn *Deploy from a branch*, nhánh `main`, thư mục `/ (root)`, bấm Save.
4. Sau 1–2 phút, trang chạy tại `https://<tên-github>.github.io/<tên-repo>/`.

## Cấu hình
Mở `app.js`, sửa khối `CONFIG` ở đầu tệp:
- `MOD_PASSCODE`: mã vào khu kiểm duyệt (đường dẫn `#/mod`). **Hãy đổi mã mặc định.**
- `BANNED_WORDS`: danh sách từ cấm
- `MAX_FILE_MB`, `REQUIRE_APPROVAL`, `FLAG_AUTO_HIDE`

Sửa danh sách ngành/chuyên ngành tại hằng `TAXONOMY`.

## Giới hạn quan trọng
GitHub Pages chỉ phục vụ tệp tĩnh, không có máy chủ. Vì vậy bản này lưu bài viết trong `localStorage` và tệp trong `IndexedDB` **của từng trình duyệt**: người dùng khác sẽ không thấy tài liệu/bài viết của bạn, và mã kiểm duyệt chỉ là bảo vệ ở phía trình duyệt (không an toàn thật sự).

Để dùng thật nhiều người, cần thêm backend, ví dụ **Supabase** hoặc **Firebase** (miễn phí ở quy mô nhỏ):
- Auth: đăng nhập người dùng, phân quyền moderator
- Database: bảng `docs`, `threads`, `replies` (thay các hàm `LS.get/set`)
- Storage: lưu tệp PDF/Word (thay `DB.put/get`)
- Quy tắc truy cập (RLS) để chỉ moderator được duyệt/xóa

Bộ lọc từ cấm phía trình duyệt cũng có thể bị vượt qua; khi có backend, hãy lặp lại kiểm tra ở phía máy chủ.
