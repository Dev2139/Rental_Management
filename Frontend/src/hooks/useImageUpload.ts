import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const uploadImages = async (files: FileList | File[], userId: string): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];

    try {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not an image`,
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds 5MB limit`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: 'Upload failed',
            description: uploadError.message,
            variant: 'destructive',
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        urls.push(publicUrl);
      }

      setUploadedUrls(prev => [...prev, ...urls]);
      
      if (urls.length > 0) {
        toast({
          title: 'Images uploaded',
          description: `Successfully uploaded ${urls.length} image(s)`,
        });
      }

      return urls;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setUploadedUrls(prev => prev.filter(u => u !== url));
  };

  const clearImages = () => {
    setUploadedUrls([]);
  };

  return {
    uploading,
    uploadedUrls,
    uploadImages,
    removeImage,
    clearImages,
    setUploadedUrls,
  };
};
