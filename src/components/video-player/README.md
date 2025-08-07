# Video Player Component

Video Player component đã được tối ưu hóa và tách thành các file nhỏ hơn để dễ quản lý và bảo trì.

## Cấu trúc file

### Hooks (src/hooks/)

#### Video Hooks

-   **`useVideoPlayer.ts`** - Hook gốc để quản lý state cơ bản của video player (thời gian, âm lượng, trạng thái play/pause)
-   **`useVideoControls.ts`** - Hook quản lý các controls của video (play/pause, seek, mute, volume) với temporary icons
-   **`useVideoAutoPlay.ts`** - Hook xử lý auto-play dựa trên viewport và visibility

#### UI Hooks

-   **`useInViewport.ts`** - Hook kiểm tra element có trong viewport hay không
-   **`useTemporaryIcon.ts`** - Hook hiển thị icon tạm thời (play/pause, mute/unmute)

### Components (src/components/video-player/)

#### Main Component

-   **`index.tsx`** - Component chính, tổng hợp tất cả hooks và sub-components

#### Sub Components

-   **`video-overlay-icons.tsx`** - Component hiển thị overlay icons (play/pause, mute/unmute)
-   **`video-controls-top.tsx`** - Component điều khiển trên video (volume bar)
-   **`video-controls-bottom.tsx`** - Component điều khiển dưới video (progress bar, video info)
-   **`progress-bar.tsx`** - Component progress bar với dragging functionality
-   **`video-description.tsx`** - Component hiển thị mô tả video có thể expand/collapse
-   **`volume-bar.tsx`** - Component volume control với dragging functionality

## Tính năng chính

### Auto-play thông minh

-   Tự động phát khi video vào viewport (>50%)
-   Tạm dừng khi video ra khỏi viewport
-   Xử lý khi tab bị ẩn/hiện

### Controls tương tác

-   Click video để play/pause
-   Drag progress bar để seek
-   Drag volume bar để điều chỉnh âm lượng
-   Hover để hiện/ẩn controls

### Temporary Icons

-   Hiển thị icon play/pause khi click
-   Hiển thị icon mute/unmute khi thay đổi âm lượng
-   Tự động ẩn sau 500ms

### Responsive Design

-   Aspect ratio 9:16 (TikTok style)
-   Responsive icons với clamp() CSS
-   Smooth transitions và animations

## Cách sử dụng

```tsx
import VideoPlayer from "@/components/video-player";

function MyComponent() {
    return <VideoPlayer className="max-w-md" post={postData} author={authorData} />;
}
```

## Dependencies

-   React 18+
-   Next.js 13+ (với app router)
-   TailwindCSS
-   React Icons (fa6, hi2, fa)
-   next-intl

## Type Safety

Tất cả components và hooks đều được typed đầy đủ với TypeScript để đảm bảo type safety và better developer experience.
