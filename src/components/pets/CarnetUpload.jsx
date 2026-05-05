import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CarnetUpload({ onUpload, isLoading = false, existingFiles = [] }) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState(existingFiles)

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFilesSelect(droppedFiles)
  }

  const handleFilesSelect = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error(`${file.name} est trop volumineux (max 10MB)`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles.map(f => ({
        file: f,
        title: f.name.replace(/\.[^.]*$/, ''),
        isNew: true
      }))])
    }
  }

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleTitleChange = (index, newTitle) => {
    setFiles(prev => {
      const updated = [...prev]
      updated[index].title = newTitle
      return updated
    })
  }

  const handleUpload = async () => {
    const newFiles = files.filter(f => f.isNew)
    if (newFiles.length === 0) {
      toast.error('Aucun nouveau fichier à uploader')
      return
    }

    try {
      const filesToUpload = newFiles.map(f => ({
        title: f.title || f.file.name,
        file: f.file
      }))

      await onUpload(filesToUpload)
      setFiles(files.filter(f => !f.isNew))
      toast.success('Fichiers uploadés avec succès')
    } catch {
      toast.error('Erreur lors de l\'upload')
    }
  }

  const newFiles = files.filter(f => f.isNew)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Carnet de santé
      </h3>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="font-medium">Déposez vos fichiers ici</p>
        <p className="text-sm text-gray-500 mt-1">ou</p>
        <input
          type="file"
          multiple
          onChange={(e) => handleFilesSelect(Array.from(e.target.files || []))}
          className="hidden"
          id="file-input"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label htmlFor="file-input">
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => document.getElementById('file-input').click()}
          >
            Choisir des fichiers
          </Button>
        </label>
        <p className="text-xs text-gray-400 mt-2">
          Formats: PDF, JPG, PNG, DOC (max 10MB par fichier)
        </p>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm">Fichiers ({files.length})</h4>
          {files.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-500 block mb-1">Titre du document</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleTitleChange(idx, e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Ex: Vaccin rage 2025"
                  disabled={!item.isNew}
                />
                {item.isNew && (
                  <p className="text-xs text-gray-400 mt-1">{item.file.name}</p>
                )}
              </div>
              {item.isNew && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveFile(idx)}
                  className="mb-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {newFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full mt-4"
        >
          {isLoading ? 'Upload en cours...' : `Uploader ${newFiles.length} fichier${newFiles.length > 1 ? 's' : ''}`}
        </Button>
      )}
    </Card>
  )
}
