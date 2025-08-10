import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type OpenModalVideoDetailType = "commentsVideoDetail" | "modalVideoDetail" | "modalLogin" | null;

interface ModalStateType {
    typeOpenModal: OpenModalVideoDetailType;
    prevPathnameOpenModal: string | null;
}

const initialState: ModalStateType = {
    typeOpenModal: null,
    prevPathnameOpenModal: null,
};

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        setOpenModal(
            state,
            action: PayloadAction<{ type: Exclude<OpenModalVideoDetailType, null>; prevPathname: string }>
        ) {
            state.typeOpenModal = action.payload.type;
            state.prevPathnameOpenModal = action.payload.prevPathname;
        },
        closeModal(state) {
            state.typeOpenModal = null;
            state.prevPathnameOpenModal = null;
        },
    },
});

export const { setOpenModal, closeModal } = modalSlice.actions;

const modalReducer = modalSlice.reducer;
export default modalReducer;
