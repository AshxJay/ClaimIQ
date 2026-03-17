/**
 * storage.ts — S3-ready document upload abstraction.
 *
 * Currently posts to REST API endpoint.
 * To switch to real S3 presigned URL upload:
 * 1. Call GET /api/claims/:id/documents/presign to get presigned URL
 * 2. PUT file directly to S3 using the presigned URL
 * 3. Only this file changes — all UI components remain untouched.
 */

import apiClient from '@/lib/api'
import type { UploadDocumentResponse } from '@/types/document'

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export async function uploadDocument(
  file: File,
  claimId: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadDocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('claimId', claimId)

  const response = await apiClient.post<{ data: UploadDocumentResponse }>(
    `/claims/${claimId}/documents`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percent: Math.round((progressEvent.loaded / progressEvent.total) * 100),
          })
        }
      },
    },
  )

  return response.data.data
}

export async function deleteDocument(claimId: string, documentId: string): Promise<void> {
  await apiClient.delete(`/claims/${claimId}/documents/${documentId}`)
}

export async function getSignedUrl(documentId: string): Promise<string> {
  const response = await apiClient.get<{ data: { signedUrl: string } }>(
    `/documents/${documentId}/signed-url`,
  )
  return response.data.data.signedUrl
}

export function getFileType(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'unknown'
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
  }
  return mimeToExt[file.type] || ext
}

export const ACCEPTED_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
