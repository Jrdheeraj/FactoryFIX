import { useState } from 'react';
import { uploadFactoryFile } from '@/services/factoryService';

export const DataUpload = ({ onResult }: { onResult: (data: any) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const data = await uploadFactoryFile(file);
      onResult(data);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to process factory data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {loading && <p>Analyzing factory data using AI models…</p>}
    </div>
  );
};
