import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../../api/endpoints';
import { getAssetUrl } from '../../utils/assetHelper';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, label, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Max 5MB.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const result = await uploadImage(file);
      onChange(result.url);
      toast.success('Image uploaded successfully!', { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-xs font-bold uppercase tracking-wider text-white/40">{label}</label>}
      
      <div className="relative group">
        {value ? (
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/20">
            <img 
              src={getAssetUrl(value)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Change Image"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={handleClear}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                title="Remove Image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-primary/30 transition-all flex flex-col items-center justify-center gap-3 group/btn disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Uploading...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-brand-primary/10 transition-colors">
                  <ImageIcon className="w-6 h-6 text-white/20 group-hover/btn:text-brand-primary/40" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white/60">Upload Image</p>
                  <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">JPG, PNG, WebP up to 5MB</p>
                </div>
              </>
            )}
          </button>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
