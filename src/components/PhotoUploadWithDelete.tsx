'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface PhotoUploadWithDeleteProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  showDeleteButton?: boolean;
}

export default function PhotoUploadWithDelete({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 6,
  showDeleteButton = true
}: PhotoUploadWithDeleteProps) {
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

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {photos.length < maxPhotos && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Upload className="w-8 h-8" />
                  <Camera className="w-8 h-8" />
                </div>
              )}
              
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
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {photo && photo.trim() !== '' && (photo.startsWith('data:image/') || photo.startsWith('http') || photo.startsWith('/')) ? (
                  photo.startsWith('data:') ? (
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide the broken image and show placeholder
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-200">
                              <div class="text-center">
                                <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-xs text-gray-500">Invalid image</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <Image
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide the broken image and show placeholder
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-200">
                              <div class="text-center">
                                <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-xs text-gray-500">Invalid image</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Invalid image</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Delete button with enhanced styling */}
              {showDeleteButton && (
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
                  aria-label="Delete photo"
                  title="Delete this photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {/* Photo number */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
              
              {/* Main photo indicator */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
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
            <li>• You can delete photos by hovering over them and clicking the delete button</li>
          </ul>
        </div>
      )}
    </div>
  );
}