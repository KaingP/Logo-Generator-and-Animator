# Hướng dẫn Triển khai (Deploy) dự án lên Render (Phương án 2)

Dự án này sử dụng mô hình full-stack với Frontend React (Vite) và Backend Node.js (Express) để gọi API Gemini và Veo một cách an toàn. Dưới đây là hướng dẫn từng bước để triển khai (deploy) ứng dụng của bạn lên **Render.com** hoàn toàn miễn phí.

---

## Bước 1: Đẩy mã nguồn lên GitHub của bạn

Nếu bạn chưa đẩy code lên kho lưu trữ (repository) GitHub của riêng mình, hãy làm theo các lệnh sau trong terminal tại thư mục dự án:

1. **Tạo một Repository mới** trên [GitHub](https://github.com/) (để trống, không khởi tạo README hay .gitignore).
2. **Cập nhật URL remote** sang repo mới của bạn:
   ```bash
   git remote set-url origin https://github.com/<tên-tài-khoản-github>/<tên-repo-của-bạn>.git
   ```
   *(Hoặc nếu chưa có remote `origin`, dùng: `git remote add origin <url-repo-của-bạn>`)*

3. **Commit và Push mã nguồn**:
   ```bash
   git add .
   git commit -m "Configure port for Render deployment"
   git branch -M main
   git push -u origin main
   ```

---

## Bước 2: Đăng ký & Tạo Web Service trên Render

1. Truy cập [Render.com](https://render.com/) và đăng nhập (bạn có thể liên kết trực tiếp với tài khoản GitHub).
2. Ở trang Dashboard, chọn **New** (nút màu tím) -> **Web Service**.
3. Kết nối tài khoản GitHub của bạn (nếu chưa làm) và chọn repository của dự án này từ danh sách.

---

## Bước 3: Cấu hình Web Service trên Render

Thiết lập các thông số cấu hình như sau:

* **Name**: Tên ứng dụng của bạn (ví dụ: `logo-generator-animator`). Tên này sẽ quyết định link trang web của bạn (ví dụ: `https://logo-generator-animator.onrender.com`).
* **Region**: Chọn khu vực gần bạn nhất (ví dụ: `Singapore` để có tốc độ kết nối nhanh nhất tại Việt Nam).
* **Branch**: `main`
* **Root Directory**: Để trống (mặc định là thư mục gốc).
* **Runtime**: `Node`
* **Build Command**: 
  ```bash
  npm install && npm run build
  ```
* **Start Command**: 
  ```bash
  npm start
  ```
* **Instance Type**: Chọn gói **Free** (Miễn phí).

---

## Bước 4: Thêm Biến môi trường (Environment Variables)

Đây là bước cực kỳ quan trọng để ứng dụng kết nối được với Gemini API:

1. Kéo xuống dưới cùng và chọn nút **Advanced** hoặc chuyển sang tab **Environment** sau khi tạo.
2. Thêm các biến môi trường sau:
   * **Key**: `GEMINI_API_KEY`
     * **Value**: *[Dán mã khóa API Gemini của bạn vào đây]* (Lấy key tại [Google AI Studio](https://aistudio.google.com/)).
   * **Key**: `NODE_ENV`
     * **Value**: `production`

---

## Bước 5: Triển khai và Kiểm tra

1. Nhấp vào nút **Create Web Service** ở dưới cùng.
2. Render sẽ bắt đầu tự động tải mã nguồn, cài đặt thư viện (`npm install`), build trang web tĩnh và đóng gói máy chủ backend Node.js.
3. Quá trình này thường mất khoảng 2-3 phút. Khi thấy dòng log thông báo `Server running on http://0.0.0.0:<PORT>` và trạng thái đổi sang **Live** màu xanh lá cây, nghĩa là trang web đã online thành công!
4. Render sẽ cung cấp một đường dẫn ở góc trên cùng bên trái màn hình (ví dụ: `https://logo-generator-animator.onrender.com`). Bạn có thể click vào đó để trải nghiệm trang web của mình hoạt động hoàn chỉnh với đầy đủ các tính năng tạo logo và làm hoạt ảnh video!

---

> 💡 **Lưu ý về gói Render Free**:
> Trang web chạy trên gói miễn phí của Render sẽ tự động "ngủ đông" (spin down) nếu không có lượt truy cập nào trong vòng 15-30 phút. Lần truy cập tiếp theo sau khi web ngủ đông sẽ mất khoảng 50 giây để khởi động lại máy chủ. Đây là cơ chế tự động của Render để tiết kiệm tài nguyên.
