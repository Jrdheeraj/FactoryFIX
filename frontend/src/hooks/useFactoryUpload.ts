import { useState, useCallback } from 'react';
import axios from 'axios';
import { UploadState, FactoryHealthResponse } from '@/types/factory';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

export const useFactoryUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });

  const uploadFile = useCallback(async (file: File) => {
    setUploadState({ status: 'uploading', progress: 0 });

    const progressInterval = setInterval(() => {
      setUploadState(prev => {
        if (prev.progress >= 30) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, progress: prev.progress + 5 };
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadState({ status: 'uploading', progress: 40 });

      const response = await axios.post(
        `${API_URL}/factory-analysis/csv`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 50) / (progressEvent.total || 100)
            );
            setUploadState(prev => ({
              ...prev,
              progress: 40 + percentCompleted,
            }));
          },
        }
      );

      /* 🔥 CRITICAL FIX: MAP BACKEND RESPONSE */
      const mappedData: FactoryHealthResponse = {
        ...response.data.factory_health,
        manufacturing_line_optimization:
          response.data.manufacturing_line_optimization,
        analysis_timestamp: response.data.analysis_timestamp,
      };

      setUploadState({
        status: 'complete',
        progress: 100,
        data: mappedData,
      });
    } catch (error) {
      console.error('Backend API error:', error);

      setUploadState({
        status: 'error',
        progress: 0,
        error:
          error instanceof Error
            ? error.message
            : 'Upload failed. Please try again.',
      });
    } finally {
      clearInterval(progressInterval);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({ status: 'idle', progress: 0 });
  }, []);

  return { uploadState, uploadFile, resetUpload };
};
