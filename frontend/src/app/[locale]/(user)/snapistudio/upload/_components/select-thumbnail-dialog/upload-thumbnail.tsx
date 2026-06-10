'use client'

import { Button } from '@/components/ui/button'
import { CloudUpload } from 'lucide-react'
import Image from 'next/image'
import { ChangeEvent, DragEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { getAcceptedFileAttribute, validateUploadFile } from '@/utils/validation/upload-file.util'

interface UploadThumbnailFromDeviceProps {
    setCoverImage: (image: File) => void
    className?: string
}

export default function UploadThumbnailFromDevice({ setCoverImage, className }: UploadThumbnailFromDeviceProps) {
    const t = useTranslations('SnapiStudio.upload.thumbnailUpload')
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        const selectedFile = files?.[0]
        if (!selectedFile) {
            return
        }

        const validation = validateUploadFile(selectedFile, 'image')
        if (!validation.isValid) {
            if (validation.code === 'invalid_type') {
                toast.error(t('validation.invalidType', { accepted: validation.acceptedExtensions }))
                return
            }
            toast.error(t('validation.tooLarge', { maxSizeMb: validation.maxSizeMb }))
            return
        }

        setFile(selectedFile)
    }

    const handleOpenFileDialog = () => {
        if (inputRef.current) {
            inputRef.current.value = ''
            inputRef.current.click()
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) {
            e.target.value = ''
            return
        }

        const validation = validateUploadFile(selectedFile, 'image')
        if (!validation.isValid) {
            if (validation.code === 'invalid_type') {
                toast.error(t('validation.invalidType', { accepted: validation.acceptedExtensions }))
            } else {
                toast.error(t('validation.tooLarge', { maxSizeMb: validation.maxSizeMb }))
            }
            e.target.value = ''
            return
        }

        setFile(selectedFile)
        e.target.value = ''
    }

    const onConfirm = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (file) {
            setCoverImage(file)
        }
    }

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null)
            return
        }

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [file])

    return (
        <div className={className}>
            {file && (
                <div className='min-h-[346px] flex items-center justify-center'>
                    <Image
                        width={243}
                        height={324}
                        src={previewUrl ?? ''}
                        alt={t('previewAlt')}
                        className='w-[243px] h-[324px] object-cover'
                    />
                </div>
            )}
            {!file && (
                <div
                    className='min-h-[346px] flex items-center justify-center'
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={handleOpenFileDialog}
                >
                    <div className=' flex flex-col items-center justify-between '>
                        <CloudUpload size={60} />
                        <span className='text-2xl font-semibold mt-2'>{t('dragAndDrop')}</span>
                        <div className='text-lg mt-1'>
                            <span>{t('or')} </span>
                            <span className='text-blue-500'>{t('selectFile')}</span>
                        </div>
                        <span className='text-sm text-muted-foreground mt-5'>{t('supportedFormats')}</span>
                    </div>
                </div>
            )}
            {file && (
                <footer className='flex items-center justify-end p-4 border-t bg-background'>
                    <Button
                        size='lg'
                        variant='secondary'
                        type='button'
                        className='cursor-pointer mr-2'
                        onClick={handleOpenFileDialog}
                    >
                        {t('uploadNew')}
                    </Button>
                    <Button size='lg' type='button' variant='brand' onClick={onConfirm}>
                        {t('confirm')}
                    </Button>
                </footer>
            )}
            <input
                type='file'
                ref={inputRef}
                accept={getAcceptedFileAttribute('image')}
                className='hidden'
                onChange={handleFileChange}
            />
        </div>
    )
}
