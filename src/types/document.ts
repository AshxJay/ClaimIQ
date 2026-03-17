export type DocumentFileType = 'pdf' | 'jpg' | 'jpeg' | 'png' | 'docx' | 'xlsx' | 'unknown'

export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error' | 'retrying'

export interface ClaimDocument {
  id: string
  claimId: string
  name: string
  originalName: string
  fileType: DocumentFileType
  mimeType: string
  size: number
  s3Key: string
  signedUrl: string
  thumbnailUrl?: string
  uploadedAt: string
  uploadedBy: string
  uploadedByName: string
  encrypted: boolean
  checksum?: string
  description?: string
}

export interface UploadingDocument {
  id: string
  file: File
  claimId: string
  status: UploadStatus
  progress: number
  error?: string
  retryCount: number
  documentId?: string
  s3Key?: string
  signedUrl?: string
}

export interface UploadDocumentResponse {
  documentId: string
  s3Key: string
  signedUrl: string
  uploadUrl?: string
}

export interface DocumentViewerState {
  open: boolean
  document: ClaimDocument | null
  page: number
  zoom: number
}
