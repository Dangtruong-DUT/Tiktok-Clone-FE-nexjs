'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'
import { useTranslations } from 'next-intl'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import {
    useGetDocumentsQuery,
    useUploadDocumentMutation,
    useDeleteDocumentMutation,
    useLazyGetDocumentQuery,
    type AiDocumentAdminDto,
    type AiDocumentDetailAdminDto
} from '@/store/services/admin/admin-ai-knowledge.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Trash2, Upload, FileText, Plus, X, Eye } from 'lucide-react'
import LoadingIcon from '@/components/lottie-icons/loading'

type UploadMode = 'file' | 'text'

interface DeleteTarget {
    id: number
    title: string
}

export default function KnowledgePage() {
    const t = useTranslations('AdminPage.aiStudio.knowledge')
    const tAdmin = useTranslations('AdminPage')

    const { data, isLoading, refetch } = useGetDocumentsQuery({})
    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation()
    const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation()
    const [fetchDocument, { isFetching: isLoadingDoc }] = useLazyGetDocumentQuery()

    const [showForm, setShowForm] = useState(false)
    const [uploadMode, setUploadMode] = useState<UploadMode>('file')
    const [title, setTitle] = useState('')
    const [sourceType, setSourceType] = useState('faq')
    const [language, setLanguage] = useState('vi')
    const [rawContent, setRawContent] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
    const [viewDoc, setViewDoc] = useState<AiDocumentDetailAdminDto | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleViewDocument = async (id: number) => {
        try {
            const result = await fetchDocument(id).unwrap()
            setViewDoc(result.data)
        } catch {
            toast.error(t('toast.loadFailed'))
        }
    }

    const docBlobUrl = useMemo(() => {
        if (!viewDoc || viewDoc.file_url) return null
        const mimeType = viewDoc.content_type === 'html' ? 'text/html' : 'text/plain'
        return URL.createObjectURL(new Blob([viewDoc.raw_content], { type: mimeType }))
    }, [viewDoc])

    useEffect(() => {
        return () => {
            if (docBlobUrl) URL.revokeObjectURL(docBlobUrl)
        }
    }, [docBlobUrl])

    const documents: AiDocumentAdminDto[] = data?.data ?? []

    const SOURCE_TYPE_OPTIONS = [
        { value: 'faq', label: t('sourceTypes.faq') },
        { value: 'guide', label: t('sourceTypes.guide') },
        { value: 'policy', label: t('sourceTypes.policy') },
        { value: 'feature', label: t('sourceTypes.feature') },
        { value: 'other', label: t('sourceTypes.other') }
    ]

    const LANGUAGE_OPTIONS = [
        { value: 'vi', label: t('languages.vi') },
        { value: 'en', label: t('languages.en') }
    ]

    const resetForm = () => {
        setTitle('')
        setSourceType('faq')
        setLanguage('vi')
        setRawContent('')
        setFile(null)
        if (fileRef.current) fileRef.current.value = ''
        setShowForm(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error(t('toast.titleRequired'))
            return
        }

        const formData = new FormData()
        formData.append('title', title.trim())
        formData.append('source_type', sourceType)
        formData.append('language', language)

        if (uploadMode === 'file') {
            if (!file) {
                toast.error(t('toast.fileRequired'))
                return
            }
            formData.append('file', file)
        } else {
            if (!rawContent.trim()) {
                toast.error(t('toast.contentRequired'))
                return
            }
            formData.append('raw_content', rawContent.trim())
        }

        try {
            await uploadDocument({ formData }).unwrap()
            toast.success(t('toast.uploaded'))
            resetForm()
            refetch()
        } catch {
            toast.error(t('toast.uploadFailed'))
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        try {
            await deleteDocument(deleteTarget.id).unwrap()
            toast.success(t('toast.deleted'))
        } catch {
            toast.error(t('toast.deleteFailed'))
        } finally {
            setDeleteTarget(null)
        }
    }

    return (
        <AdminLayout
            title={t('title')}
            description={t('description')}
            breadcrumbs={[
                { label: tAdmin('breadcrumbs.admin'), href: ADMIN_ROUTES.DASHBOARD },
                { label: tAdmin('aiStudio.breadcrumb'), href: '/admin/ai-studio' },
                { label: t('breadcrumb'), href: '#' }
            ]}
        >
            <AdminContainer>
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <p className='text-sm text-muted-foreground'>
                        {t('count', { count: documents.length })}
                    </p>
                    <Button size='sm' onClick={() => setShowForm(true)} className='gap-1.5'>
                        <Plus className='size-4' />
                        {t('addDocument')}
                    </Button>
                </div>

                {/* Upload form */}
                {showForm && (
                    <Card className='mb-6'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='text-sm'>{t('newDocument')}</CardTitle>
                                <button
                                    type='button'
                                    onClick={resetForm}
                                    className='text-muted-foreground hover:text-foreground'
                                >
                                    <X className='size-4' />
                                </button>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className='pt-4'>
                            <form onSubmit={handleSubmit} className='space-y-4'>
                                {/* Mode toggle */}
                                <div className='flex gap-2'>
                                    {(['file', 'text'] as UploadMode[]).map((mode) => (
                                        <Button
                                            key={mode}
                                            type='button'
                                            size='sm'
                                            variant={uploadMode === mode ? 'default' : 'outline'}
                                            onClick={() => setUploadMode(mode)}
                                        >
                                            {mode === 'file' ? t('uploadFile') : t('pasteText')}
                                        </Button>
                                    ))}
                                </div>

                                <div className='grid grid-cols-2 gap-3'>
                                    <div className='col-span-2 space-y-1.5'>
                                        <label className='text-xs font-medium text-muted-foreground'>
                                            {t('titleLabel')} *
                                        </label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={t('titlePlaceholder')}
                                        />
                                    </div>
                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-medium text-muted-foreground'>
                                            {t('sourceTypeLabel')} *
                                        </label>
                                        <Select value={sourceType} onValueChange={setSourceType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SOURCE_TYPE_OPTIONS.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-medium text-muted-foreground'>
                                            {t('languageLabel')}
                                        </label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LANGUAGE_OPTIONS.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {uploadMode === 'file' ? (
                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-medium text-muted-foreground'>
                                            {t('fileLabel')}{' '}
                                            <span className='font-normal opacity-60'>{t('fileHint')}</span>
                                        </label>
                                        <Input
                                            ref={fileRef}
                                            type='file'
                                            accept='.pdf,.txt,.docx,.doc'
                                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                            className='cursor-pointer'
                                        />
                                    </div>
                                ) : (
                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-medium text-muted-foreground'>
                                            {t('contentLabel')} *
                                        </label>
                                        <Textarea
                                            value={rawContent}
                                            onChange={(e) => setRawContent(e.target.value)}
                                            placeholder={t('contentPlaceholder')}
                                            rows={8}
                                            className='font-mono resize-y'
                                        />
                                    </div>
                                )}

                                <div className='flex justify-end gap-2'>
                                    <Button type='button' variant='outline' size='sm' onClick={resetForm}>
                                        {t('cancel')}
                                    </Button>
                                    <Button type='submit' size='sm' disabled={isUploading} className='gap-1.5'>
                                        {isUploading ? (
                                            <LoadingIcon className='size-4' loop />
                                        ) : (
                                            <Upload className='size-4' />
                                        )}
                                        {isUploading ? t('uploading') : t('upload')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Document list */}
                {isLoading ? (
                    <div className='flex justify-center py-12'>
                        <LoadingIcon className='size-8' loop />
                    </div>
                ) : documents.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-16 text-center gap-3'>
                        <FileText className='size-10 text-muted-foreground/40' />
                        <p className='text-sm text-muted-foreground'>{t('empty')}</p>
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {documents.map((doc) => (
                            <div key={doc.id} className='flex items-center gap-3 rounded-xl border bg-card px-4 py-3'>
                                <FileText className='size-4 text-muted-foreground shrink-0' />
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-medium truncate'>{doc.title}</p>
                                    <p className='text-xs text-muted-foreground'>
                                        {doc.source_type} · {doc.language.toUpperCase()} · {doc.chunk_count} chunks
                                    </p>
                                </div>
                                <div className='flex items-center gap-2 shrink-0'>
                                    {doc.is_indexed ? (
                                        <Badge
                                            variant='default'
                                            className='text-[10px] bg-green-500/15 text-green-600 border-green-500/20'
                                        >
                                            {t('indexed')}
                                        </Badge>
                                    ) : (
                                        <Badge variant='secondary' className='text-[10px]'>
                                            {t('indexing')}
                                        </Badge>
                                    )}
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        disabled={isLoadingDoc}
                                        className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
                                        onClick={() => handleViewDocument(doc.id)}
                                    >
                                        <Eye className='size-3.5' />
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        disabled={isDeleting}
                                        className='h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                                        onClick={() => setDeleteTarget({ id: doc.id, title: doc.title })}
                                    >
                                        <Trash2 className='size-3.5' />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AdminContainer>

            {/* Document viewer dialog */}
            <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
                <DialogContent className='sm:max-w-2xl max-h-[85vh] flex flex-col'>
                    <DialogHeader>
                        <DialogTitle className='truncate pr-6'>{viewDoc?.title}</DialogTitle>
                    </DialogHeader>
                    {viewDoc && (
                        <div className='flex flex-col gap-4 overflow-hidden'>
                            <div className='flex flex-wrap gap-2 text-xs'>
                                <span className='rounded-md border bg-muted px-2 py-0.5 font-mono'>
                                    {viewDoc.source_type}
                                </span>
                                <span className='rounded-md border bg-muted px-2 py-0.5 font-mono'>
                                    {viewDoc.language.toUpperCase()}
                                </span>
                                <span className='rounded-md border bg-muted px-2 py-0.5 font-mono'>
                                    {viewDoc.content_type}
                                </span>
                                <span className='rounded-md border bg-muted px-2 py-0.5 text-muted-foreground'>
                                    {viewDoc.chunk_count} chunks
                                </span>
                                {viewDoc.is_indexed ? (
                                    <Badge
                                        variant='default'
                                        className='text-[10px] bg-green-500/15 text-green-600 border-green-500/20'
                                    >
                                        {t('indexed')}
                                    </Badge>
                                ) : (
                                    <Badge variant='secondary' className='text-[10px]'>
                                        {t('indexing')}
                                    </Badge>
                                )}
                            </div>
                            <div className='overflow-hidden rounded-lg border' style={{ height: '55vh' }}>
                                <DocViewer
                                    documents={[{
                                        uri: viewDoc.file_url ?? docBlobUrl ?? '',
                                        fileType: viewDoc.file_url
                                            ? viewDoc.file_url.split('.').pop()
                                            : viewDoc.content_type === 'html' ? 'html' : 'txt',
                                    }]}
                                    pluginRenderers={DocViewerRenderers}
                                    config={{
                                        header: { disableHeader: true },
                                        pdfZoom: { defaultZoom: 1 },
                                        pdfVerticalScrollByDefault: true,
                                    }}
                                    style={{ height: '100%', background: 'transparent' }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                            {t('deleteConfirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}
