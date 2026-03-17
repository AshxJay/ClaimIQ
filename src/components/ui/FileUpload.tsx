import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, Image, File, ShieldCheck, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { ProgressBar } from './ProgressBar'
import type { UploadingDocument } from '@/types/document'
import { ACCEPTED_DOCUMENT_TYPES, MAX_FILE_SIZE } from '@/lib/storage'

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText size={20} className="text-red-400" />,
  jpg: <Image size={20} className="text-blue-400" />,
  jpeg: <Image size={20} className="text-blue-400" />,
  png: <Image size={20} className="text-blue-400" />,
  docx: <FileText size={20} className="text-blue-500" />,
  default: <File size={20} className="text-text-muted" />,
}

interface FileUploadProps {
  uploads: UploadingDocument[]
  onFilesAdded: (files: File[]) => void
  onRemove: (id: string) => void
  onRetry: (id: string) => void
  disabled?: boolean
  className?: string
}

export function FileUpload({ uploads, onFilesAdded, onRemove, onRetry, disabled, className }: FileUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onFilesAdded(accepted)
    },
    [onFilesAdded],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_DOCUMENT_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled,
    multiple: true,
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer',
          'transition-all duration-200 outline-none',
          isDragActive && !isDragReject && 'border-brand-blue bg-brand-blue/5 shadow-glow',
          isDragReject && 'border-status-danger bg-status-danger/5',
          !isDragActive && !isDragReject && 'border-border-DEFAULT hover:border-brand-blue/50 hover:bg-bg-elevated',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center',
            isDragActive && !isDragReject ? 'bg-brand-blue/20 text-brand-blue' : 'bg-bg-elevated text-text-muted',
            isDragReject && 'bg-status-danger/20 text-status-danger',
          )}>
            {isDragReject ? <AlertCircle size={24} /> : <Upload size={24} />}
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary">
              {isDragActive && !isDragReject && 'Drop files here'}
              {isDragReject && 'Invalid file type or too large'}
              {!isDragActive && 'Drag & drop files, or click to browse'}
            </p>
            <p className="text-xs text-text-muted mt-1">
              PDF, JPG, PNG, DOCX — max 10MB each
            </p>
          </div>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {uploads.map((upload) => {
          const ext = upload.file.name.split('.').pop()?.toLowerCase() || 'default'
          const icon = fileTypeIcons[ext] || fileTypeIcons.default

          return (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-start gap-3 p-4 bg-bg-card border border-border-subtle rounded-xl"
            >
              {/* Thumbnail or icon */}
              <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0 overflow-hidden">
                {upload.file.type.startsWith('image/') && upload.status === 'complete' ? (
                  <img
                    src={URL.createObjectURL(upload.file)}
                    alt={upload.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary truncate">{upload.file.name}</span>
                  <span className="text-xs text-text-muted shrink-0">{formatFileSize(upload.file.size)}</span>
                </div>

                {upload.status === 'uploading' && (
                  <ProgressBar value={upload.progress} size="sm" animated />
                )}

                {upload.status === 'complete' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-status-success">
                      <CheckCircle2 size={12} />
                      Uploaded
                    </div>
                    {upload.documentId && (
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <ShieldCheck size={12} className="text-brand-teal" />
                        AES-256 encrypted
                      </div>
                    )}
                  </div>
                )}

                {upload.status === 'error' && (
                  <div className="flex items-center gap-1 text-xs text-status-danger">
                    <AlertCircle size={12} />
                    {upload.error || 'Upload failed'}
                  </div>
                )}

                {upload.status === 'pending' && (
                  <span className="text-xs text-text-muted">Waiting…</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {upload.status === 'error' && (
                  <button
                    onClick={() => onRetry(upload.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-brand-blue transition-colors"
                    aria-label="Retry upload"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                {upload.status !== 'uploading' && (
                  <button
                    onClick={() => onRemove(upload.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-status-danger transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
