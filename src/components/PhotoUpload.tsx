'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 6 
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files');
      return;
    }

    if (photos.length + imageFiles.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setIsUploading(true);

    try {
      // Upload files to server
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.urls) {
        onPhotosChange([...photos, ...result.urls]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [photos, onPhotosChange, maxPhotos]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const removePhoto = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  }, [photos, onPhotosChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={photos.length < maxPhotos ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={photos.length >= maxPhotos}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading photos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              {photos.length >= maxPhotos ? (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            {photos.length >= maxPhotos ? (
              <div>
                <p className="text-sm font-medium text-gray-700">Maximum photos reached</p>
                <p className="text-xs text-gray-500 mt-1">
                  You can upload up to {maxPhotos} photos
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop photos here' : 'Upload photos'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Drag and drop or click to select ({photos.length}/{maxPhotos})
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {photo.startsWith('data:') ? (
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide the broken image on error
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Remove button */}
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
              
              {/* Photo number */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      {photos.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Photo Tips:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Upload high-quality photos of your work or services</li>
            <li>• Include photos that showcase your skills and professionalism</li>
            <li>• Make sure photos are well-lit and clearly show your work</li>
            <li>• The first photo will be used as your main profile image</li>
          </ul>
        </div>
      )}
    </div>
  );
}