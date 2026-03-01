import axios from 'axios';
import { FACTORY_ANALYSIS_ENDPOINT } from '@/lib/api';
import { FactoryAnalysisResponse } from '@/types/factory';

export const uploadFactoryFile = async (
  file: File
): Promise<FactoryAnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    FACTORY_ANALYSIS_ENDPOINT,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data as FactoryAnalysisResponse;
};
