'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface EvidenceFile {
    id: number
    url: string
    file_name: string
}

interface EvidenceGalleryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    evidenceFiles: EvidenceFile[]
    appealId?: number
}

/**
 * Image gallery dialog for viewing appeal evidence in admin panel.
 * Supports navigation, zoom, download, and shows original file names.
 */
export function EvidenceGalleryDialog({ open, onOpenChange, evidenceFiles, appealId }: EvidenceGalleryDialogProps) {
    const t = useTranslations('AdminPage.appeals.evidenceDialog')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : evidenceFiles.length - 1))
        setIsZoomed(false)
    }, [evidenceFiles.length])

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < evidenceFiles.length - 1 ? prev + 1 : 0))
        setIsZoomed(false)
    }, [evidenceFiles.length])

    const currentFile = evidenceFiles[currentIndex]

    const handleDownload = useCallback(() => {
        if (!currentFile) return
        const link = document.createElement('a')
        link.href = currentFile.url
        link.download = currentFile.file_name || `evidence-${appealId ?? 'unknown'}-${currentIndex + 1}`
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [currentFile, currentIndex, appealId])

    if (evidenceFiles.length === 0) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[720px] p-0 overflow-hidden'>
                <DialogHeader className='p-4 pb-2'>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('imageCount', { current: currentIndex + 1, total: evidenceFiles.length })}
                        {currentFile && (
                            <span className='ml-2 text-xs text-muted-foreground'>— {currentFile.file_name}</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Image viewer */}
                <div className='relative bg-neutral-950 flex items-center justify-center min-h-[400px]'>
                    <AnimatePresence mode='wait'>
                        {currentFile && (
                            <motion.div
                                key={currentFile.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className='relative w-full h-[400px] flex items-center justify-center cursor-pointer'
                                onClick={() => setIsZoomed(!isZoomed)}
                            >
                                <Image
                                    src={currentFile.url}
                                    alt={currentFile.file_name || t('imageAlt', { index: currentIndex + 1 })}
                                    fill
                                    className={`transition-transform duration-300 ${
                                        isZoomed ? 'object-contain scale-150' : 'object-contain'
                                    }`}
                                    unoptimized
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation arrows */}
                    {evidenceFiles.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white hover:bg-black/70 transition-colors'
                                aria-label={t('prev')}
                            >
                                {t('prev')}
                            </button>
                            <button
                                onClick={handleNext}
                                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white hover:bg-black/70 transition-colors'
                                aria-label={t('next')}
                            >
                                {t('next')}
                            </button>
                        </>
                    )}
                </div>

                {/* Toolbar */}
                <div className='flex items-center justify-between p-3 border-t'>
                    {/* Thumbnails */}
                    <div className='flex gap-1.5 overflow-x-auto max-w-[60%]'>
                        {evidenceFiles.map((file, index) => (
                            <button
                                key={file.id}
                                onClick={() => {
                                    setCurrentIndex(index)
                                    setIsZoomed(false)
                                }}
                                title={file.file_name}
                                className={`relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentIndex
                                        ? 'border-black ring-1 ring-black'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <Image src={file.url} alt={file.file_name} fill className='object-cover' unoptimized />
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className='flex gap-1.5'>
                        <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => setIsZoomed(!isZoomed)}
                            className='h-8 px-3 text-xs'
                        >
                            {isZoomed ? t('zoomOut') : t('zoomIn')}
                        </Button>
                        <Button size='sm' variant='ghost' onClick={handleDownload} className='h-8 px-3 text-xs'>
                            {t('download')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
