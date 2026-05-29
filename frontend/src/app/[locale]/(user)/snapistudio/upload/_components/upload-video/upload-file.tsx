'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Image from 'next/image'
import UploadGuideLine from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video/upload-guide-lines'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { getAcceptedFileAttribute, validateUploadFile } from '@/utils/validation/upload-file.util'
import { CloudUpload } from 'lucide-react'

interface UploadFileProps {
    onFileSelect: (file: File | null) => void
    className?: string
    isInitialRender?: boolean
    setIsInitialRender: (value: boolean) => void
}

export interface UploadFileRef {
    resetAndActive: () => void
}

const UploadFile = forwardRef<UploadFileRef, UploadFileProps>(
    ({ onFileSelect, className, isInitialRender, setIsInitialRender }, ref) => {
        const t = useTranslations('SnapiStudio.upload')
        const [isDragActive, setIsDragActive] = useState(false)
        const inputRef = useRef<HTMLInputElement>(null)

        useImperativeHandle(ref, () => ({
            resetAndActive: () => {
                if (inputRef.current) {
                    inputRef.current.value = ''
                    inputRef.current.click()
                    onFileSelect(null)
                }
            }
        }))

        const handleDrag = (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true)
            else if (e.type === 'dragleave') setIsDragActive(false)
        }

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragActive(false)
            const droppedFile = e.dataTransfer.files[0]
            if (!droppedFile) return
            const validation = validateUploadFile(droppedFile, 'video')
            if (!validation.isValid) {
                toast.error(
                    validation.code === 'invalid_type'
                        ? t('validation.invalidType', { accepted: validation.acceptedExtensions })
                        : t('validation.tooLarge', { maxSizeMb: validation.maxSizeMb })
                )
                return
            }
            onFileSelect(droppedFile)
            setIsInitialRender(false)
        }

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0]
            if (!selectedFile) return
            const validation = validateUploadFile(selectedFile, 'video')
            if (!validation.isValid) {
                toast.error(
                    validation.code === 'invalid_type'
                        ? t('validation.invalidType', { accepted: validation.acceptedExtensions })
                        : t('validation.tooLarge', { maxSizeMb: validation.maxSizeMb })
                )
                return
            }
            onFileSelect(selectedFile)
            setIsInitialRender(false)
        }

        return (
            <div className={cn('rounded-xl overflow-hidden', className)}>
                <div
                    className={cn(
                        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer',
                        'bg-muted/40 hover:bg-muted/60',
                        isDragActive
                            ? 'border-brand bg-brand/5 scale-[1.01]'
                            : 'border-border hover:border-brand/50',
                        isInitialRender ? 'min-h-[360px] py-12 gap-3' : 'min-h-[140px] flex-row gap-6 px-8'
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type='file'
                        accept={getAcceptedFileAttribute('video')}
                        onChange={handleFileChange}
                        className='absolute inset-0 cursor-pointer opacity-0'
                        onClick={(e) => {
                            ;(e.target as HTMLInputElement).value = ''
                        }}
                        ref={inputRef}
                    />

                    {isInitialRender ? (
                        <>
                            <div
                                className={cn(
                                    'flex size-20 items-center justify-center rounded-full transition-colors duration-200',
                                    isDragActive ? 'bg-brand/15' : 'bg-muted'
                                )}
                            >
                                <Image
                                    src='/images/upload-page/upload.svg'
                                    alt='Upload video'
                                    width={40}
                                    height={40}
                                    className='size-10'
                                />
                            </div>
                            <div className='text-center space-y-1'>
                                <p className='text-lg font-semibold'>
                                    {isDragActive ? t('dropHere') : t('selectVideo')}
                                </p>
                                <p className='text-sm text-muted-foreground'>{t('dragAndDrop')}</p>
                            </div>
                            <div className='flex items-center gap-2 mt-1'>
                                <div className='h-px w-12 bg-border' />
                                <span className='text-xs text-muted-foreground uppercase tracking-wider'>or</span>
                                <div className='h-px w-12 bg-border' />
                            </div>
                            <button
                                type='button'
                                className='relative z-10 pointer-events-none inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand/90 transition-colors'
                            >
                                <CloudUpload className='size-4' />
                                {t('selectVideo')}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-muted'>
                                <Image
                                    src='/images/upload-page/upload.svg'
                                    alt='Upload video'
                                    width={24}
                                    height={24}
                                    className='size-6'
                                />
                            </div>
                            <div>
                                <p className='font-semibold'>{t('selectVideo')}</p>
                                <p className='text-sm text-muted-foreground'>{t('dragAndDrop')}</p>
                            </div>
                        </>
                    )}
                </div>

                {isInitialRender && <UploadGuideLine className='mt-6' />}
            </div>
        )
    }
)

UploadFile.displayName = 'UploadFile'

export default UploadFile
