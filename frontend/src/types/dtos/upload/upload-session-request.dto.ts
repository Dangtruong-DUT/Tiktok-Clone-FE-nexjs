export interface InitUploadSessionBody {
    file_name: string
    file_size: number
    mime_type: string
}

export interface CompletePart {
    part_number: number
    etag: string
}

export interface CompleteUploadSessionBody {
    parts?: CompletePart[]
}
