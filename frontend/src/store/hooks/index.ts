import { AppDispatch, AppStore, RootState } from '@/store'
import { useDispatch, useSelector, useStore } from 'react-redux'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
