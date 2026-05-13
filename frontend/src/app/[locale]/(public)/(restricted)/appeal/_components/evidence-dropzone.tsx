'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImagePlus, X, Upload, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface EvidenceDropzoneProps {
    files: File[]
    onFilesChange: (files: File[]) => void
    maxFiles?: number
    maxSizeMB?: number
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

/**
 * Drag & drop evidence image upload zone with thumbnail previews.
 * Validates file type (images only) and size (default 5MB max per file).
 */
export const EvidenceDropzone = memo(function EvidenceDropzone({
    files,
    onFilesChange,
    maxFiles = 5,
    maxSizeMB = 5
}: EvidenceDropzoneProps) {
    const t = useTranslations('AppealPage.evidence')
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    useEffect(() => {
        const urls = files.map((file) => URL.createObjectURL(file))
        setPreviewUrls(urls)
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [files])

    const maxSizeBytes = maxSizeMB * 1024 * 1024

    const validateAndAddFiles = useCallback(
        (newFiles: FileList | File[]) => {
            setError(null)
            const validFiles: File[] = []

            for (const file of Array.from(newFiles)) {
                if (!ACCEPTED_TYPES.includes(file.type)) {
                    setError(t('invalidType'))
                    continue
                }
                if (file.size > maxSizeBytes) {
                    setError(t('tooLarge', { maxSizeMb: maxSizeMB }))
                    continue
                }
                validFiles.push(file)
            }

            const combined = [...files, ...validFiles].slice(0, maxFiles)
            onFilesChange(combined)
        },
        [files, maxFiles, maxSizeBytes, maxSizeMB, onFilesChange, t]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            validateAndAddFiles(e.dataTransfer.files)
        },
        [validateAndAddFiles]
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                validateAndAddFiles(e.target.files)
            }
            if (inputRef.current) {
                inputRef.current.value = ''
            }
        },
        [validateAndAddFiles]
    )

    const removeFile = useCallback(
        (index: number) => {
            const next = files.filter((_, i) => i !== index)
            onFilesChange(next)
            setError(null)
        },
        [files, onFilesChange]
    )

    return (
        <div className='space-y-3'>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => files.length < maxFiles && inputRef.current?.click()}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                aria-label={t('dropzoneLabel')}
                className={cn(
                    'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 transition-all duration-300 cursor-pointer',
                    isDragging
                        ? 'border-slate-900 bg-slate-50 scale-[1.01]'
                        : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50',
                    files.length >= maxFiles && 'opacity-50 cursor-not-allowed pointer-events-none'
                )}
            >
                <motion.div
                    animate={{ y: isDragging ? -4 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className='rounded-full bg-slate-100 p-3'
                >
                    {isDragging ? (
                        <Upload className='h-6 w-6 text-slate-900' />
                    ) : (
                        <ImagePlus className='h-6 w-6 text-slate-500' />
                    )}
                </motion.div>

                <div className='text-center'>
                    <p className='text-sm font-medium text-slate-700'>
                        {isDragging ? t('dropHere') : t('dragAndDrop')}
                    </p>
                    <p className='mt-1 text-xs text-slate-500'>{t('fileInfo', { maxFiles, maxSizeMb: maxSizeMB })}</p>
                </div>

                <input
                    ref={inputRef}
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={handleInputChange}
                    className='hidden'
                    aria-hidden='true'
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className='flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700'
                    >
                        <AlertCircle className='h-4 w-4 flex-shrink-0' />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='grid grid-cols-3 gap-3 sm:grid-cols-5'
                    >
                        {files.map((file, index) => (
                            <motion.div
                                key={`${file.name}-${file.size}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                className='group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50'
                            >
                                <Image
                                    src={previewUrls[index] ?? ''}
                                    alt={file.name}
                                    fill
                                    className='object-cover'
                                    unoptimized
                                />
                                <button
                                    type='button'
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFile(index)
                                    }}
                                    className='absolute right-1 top-1 rounded-full bg-slate-900/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-900'
                                    aria-label={t('removeFile')}
                                >
                                    <X className='h-3 w-3' />
                                </button>
                                <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-1.5 pb-1 pt-4'>
                                    <p className='truncate text-[10px] text-white'>{file.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {files.length > 0 && (
                <p className='text-xs text-slate-500 text-center'>
                    {t('fileCount', { current: files.length, max: maxFiles })}
                </p>
            )}
        </div>
    )
})
