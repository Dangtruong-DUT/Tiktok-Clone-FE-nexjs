import useSidebar from "../_context/sidebar.context";
import { SidebarActiveType } from "../_types/sidebar.types";

/**
 * Custom hook to check if a specific sidebar item is active
 * @param type - The sidebar active type to check
 * @returns boolean indicating if the type is currently active
 */
export function useIsSidebarActive(type: SidebarActiveType): boolean {
    const { activeState } = useSidebar();
    return activeState.type === type;
}

/**
 * Custom hook to get current active state and setters
 * @returns object with current active state and helper functions
 */
export function useSidebarActiveState() {
    const { activeState, setActiveState, resetToRouteActive } = useSidebar();

    const setActive = (type: SidebarActiveType, route?: string) => {
        setActiveState({ type, route });
    };

    const isActive = (type: SidebarActiveType): boolean => {
        return activeState.type === type;
    };

    return {
        activeState,
        setActive,
        isActive,
        resetToRouteActive,
    };
}
