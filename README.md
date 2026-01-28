# Sendo AI Support Client

Ứng dụng web được xây dựng với React, TypeScript và Vite.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Chạy dự án](#chạy-dự-án)
- [Các thành phần chính](#các-thành-phần-chính)
- [Cấu hình ESLint](#cấu-hình-eslint)
- [Ghi chú](#ghi-chú)

## Giới thiệu

Dự án này là client cho hệ thống Sendo, sử dụng React + TypeScript, tích hợp Vite để phát triển nhanh chóng với HMR. Dự án có các tính năng như chat, đăng nhập, chế độ tối, và huấn luyện AI.

## Cài đặt

Yêu cầu:

- Node.js >= 16
- Yarn hoặc npm

Cài đặt dependencies:

```bash
yarn install
# hoặc
npm install
```

## Cấu trúc thư mục

```
src/
├── App.tsx                      # Component gốc của ứng dụng
├── main.tsx                     # Entry point, render React app
│
├── assets/                      # Tài nguyên tĩnh (images, fonts, icons)
│
├── components/                  # Shared components toàn dự án
│   ├── ui/                      # shadcn/ui components (button, card, sidebar, etc.)
│   ├── layouts/                 # Layout components (app-layout, app-sidebar)
│   └── mode-toggle.tsx          # Dark/Light mode toggle component
│
├── contexts/                    # React Context providers
│   ├── UserContext.tsx          # User authentication context
│   └── theme-provider.tsx       # Theme (dark/light mode) provider
│
├── lib/                         # Utility functions và helpers (utils.ts)
│
├── routes/                      # Route configuration (React Router)
│
├── features/                    # Feature-based modules
│   ├── Chatbox/                 # Chat Support feature
│   │   ├── components/          # Components riêng cho Chatbox
│   │   ├── hooks/               # Custom hooks cho Chatbox
│   │   ├── types/               # TypeScript types/interfaces
│   │   └── utils/               # Utility functions riêng
│   │
│   ├── TrainingAI/              # Training AI feature
│   │   ├── components/          # Components riêng cho Training AI
│   │   └── types/               # TypeScript types/interfaces
│   │
│   └── Login/                   # Authentication feature
│       └── pages/               # Login pages (Login, OAuthCallback)
│
└── public/                      # Static assets served directly
```

- `Chatbox/`: Các thành phần và logic cho tính năng chat.
- `components/ui/`: Các component UI tái sử dụng.
- `contexts/`: Context API (ví dụ: UserContext).
- `DarkMode/`: Chế độ tối.
- `lib/`: Các hàm tiện ích, API client.
- `Login/pages/`: Trang đăng nhập, xác thực OAuth.
- `routers/`: Định tuyến ứng dụng.
- `TrainingAI/`: Tính năng huấn luyện AI.

## Chạy dự án

Khởi động server phát triển:

```bash
yarn dev
# hoặc
npm run dev
```

Truy cập: http://localhost:5173

## Các thành phần chính

- **Chatbox**: Giao diện chat, quản lý tin nhắn, nhập liệu, tiêu đề chat.
- **Login**: Đăng nhập, xác thực OAuth.
- **TrainingAI**: Giao diện và logic huấn luyện AI.
- **DarkMode**: Chuyển đổi chế độ sáng/tối.
- **UI Components**: Button, Card, Input, v.v.

## Cấu hình ESLint

Dự án sử dụng ESLint với các rule cho TypeScript và React. Có thể mở rộng cấu hình theo hướng dẫn trong file `eslint.config.js`.

## Ghi chú

- Sử dụng Vite để build và phát triển.
- Có thể mở rộng thêm các plugin ESLint cho React.
- Đảm bảo cập nhật các file cấu hình khi thêm mới các tính năng lớn.
