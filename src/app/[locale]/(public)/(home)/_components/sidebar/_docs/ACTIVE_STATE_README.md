# Sidebar Active State Management

Hệ thống quản lý active state cho sidebar được thiết kế để xử lý các trường hợp phức tạp bao gồm:

-   Navigation routes thông thường
-   Intercepting routes
-   Special actions (Search, More, Profile)

## Cấu trúc

### 1. Types (`_types/sidebar.types.ts`)

-   `SidebarActiveType`: Enum định nghĩa tất cả các loại active state
-   `SidebarActiveState`: Interface cho active state với type và route tùy chọn

### 2. Context (`_context/sidebar.context.tsx`)

-   Quản lý state cho drawer và active state
-   Tự động cập nhật active state dựa trên route hiện tại
-   Reset active state khi drawer đóng

### 3. Hooks (`_hooks/useSidebarActive.ts`)

-   `useIsSidebarActive(type)`: Check xem một type có active không
-   `useSidebarActiveState()`: Hook đầy đủ với các helper functions

## Cách sử dụng

### Trong Navigation Items

```tsx
import { useIsSidebarActive } from "../_hooks/useSidebarActive";
import { SidebarActiveType } from "../_types/sidebar.types";

const isActive = useIsSidebarActive(SidebarActiveType.HOME);
```

### Trong Special Actions

```tsx
import { useSidebarActiveState } from "../_hooks/useSidebarActive";

const { setActive, isActive } = useSidebarActiveState();

// Set active when opening drawer/modal
const handleClick = () => {
    setActive(SidebarActiveType.SEARCH);
    // open drawer logic
};

// Check if active
const isSearchActive = isActive(SidebarActiveType.SEARCH);
```

### Trong Custom Components

```tsx
import { SidebarActiveType } from "../_types/sidebar.types";
import useSidebar from "../_context/sidebar.context";

const { activeState, setActiveState } = useSidebar();

// Custom logic
if (someCondition) {
    setActiveState({
        type: SidebarActiveType.CUSTOM,
        route: "/custom-route",
    });
}
```

## Behavior

### Auto Route Detection

-   Tự động detect route và set active state tương ứng
-   Hỗ trợ locale routes (en, vi)
-   Handle profile routes với pattern `/@username`

### Special States

-   `SEARCH`: Active khi search drawer mở
-   `MORE`: Active khi settings drawer mở
-   `PROFILE`: Active khi ở profile page hoặc click profile link
-   `NONE`: Default state khi không match route nào

### State Transitions

1. **Route Change**: Tự động update active state
2. **Drawer Open**: Set special active state (SEARCH/MORE)
3. **Drawer Close**: Reset về route-based active state
4. **Manual Set**: Có thể set manually cho custom logic

## Mở rộng

### Thêm Active Type mới

1. Thêm vào `SidebarActiveType` enum
2. Update logic trong `getActiveStateFromRoute()` nếu cần
3. Sử dụng trong component tương ứng

### Custom Active Logic

```tsx
// Trong component riêng
const { setActiveState } = useSidebar();

useEffect(() => {
    // Custom condition
    if (customCondition) {
        setActiveState({
            type: SidebarActiveType.CUSTOM_TYPE,
            route: currentRoute,
        });
    }
}, [customCondition]);
```

## Best Practices

1. **Use Hooks**: Ưu tiên sử dụng hooks thay vì direct context
2. **Reset State**: Luôn reset về route-based state khi không cần special state
3. **Type Safety**: Sử dụng enum thay vì string literals
4. **Performance**: Hooks đã được optimize, không cần memo thêm
