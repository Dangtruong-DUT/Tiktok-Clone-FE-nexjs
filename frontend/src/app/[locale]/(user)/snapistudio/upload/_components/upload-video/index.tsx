'use client'

import FileInfo from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video/file-info'
import UploadFile, {
    UploadFileRef
} from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video/upload-file'
import { cn } from '@/lib/utils'
import { useRef } from 'react'
import type { VideoEncodingState } from '@/hooks/video/useVideoEncoding'

interface UploadVideoProps {
    onFileSelect: (file: File | null) => void
    file: File | null
    isUploading: boolean
    uploadProgress: number
    uploadError?: string | null
    onRetryUpload?: () => void
    encoding: VideoEncodingState
    uploadedVideoUuid?: string | null
    className?: string
    isInitialRender?: boolean
    setIsInitialRender: (value: boolean) => void
    onReset: () => void
}

export default function UploadVideo({
    onFileSelect,
    file,
    isUploading,
    uploadProgress,
    uploadError,
    onRetryUpload,
    encoding,
    uploadedVideoUuid,
    className,
    isInitialRender,
    setIsInitialRender,
    onReset,
}: UploadVideoProps) {
    const uploadFileRef = useRef<UploadFileRef>(null)

    const handleReplaceFile = () => {
        onReset()
        uploadFileRef.current?.resetAndActive()
    }

    return (
        <>
            <UploadFile
                onFileSelect={onFileSelect}
                className={cn(className, { hidden: file != null })}
                isInitialRender={isInitialRender}
                setIsInitialRender={setIsInitialRender}
                ref={uploadFileRef}
            />
            <FileInfo
                file={file}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                uploadError={uploadError}
                onRetryUpload={onRetryUpload}
                encoding={encoding}
                uploadedVideoUuid={uploadedVideoUuid}
                className={cn(className, { hidden: file == null })}
                onReplaceFile={handleReplaceFile}
            />
        </>
    )
}
