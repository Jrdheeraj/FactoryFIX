import { motion } from 'framer-motion';
import { CloudUpload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { UploadState } from '@/types/factory';

interface UploadSectionProps {
  uploadState: UploadState;
  onFileUpload: (file: File) => void;
  onReset: () => void;
}

const ACCEPTED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const UploadSection = ({ uploadState, onFileUpload, onReset }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && 
        !file.name.endsWith('.csv') && 
        !file.name.endsWith('.xls') && 
        !file.name.endsWith('.xlsx')) {
      return 'Invalid file type. Please upload a CSV, XLS, or XLSX file.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 50MB.';
    }
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFileError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileError(null);
    onReset();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isProcessing = uploadState.status === 'uploading' || uploadState.status === 'processing';

  return (
    <section id="upload" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 texture-industrial" />
      <div className="absolute top-0 left-0 right-0 h-px separator-industrial" />

      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Data Analysis
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Upload Your <span className="text-primary">Factory Data</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload your machine sensor data, production logs, or quality reports. 
            Our AI will analyze the data and provide actionable insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
              ${isDragging 
                ? 'border-primary bg-primary/10 scale-[1.02]' 
                : 'border-border hover:border-primary/50 bg-card/50'
              }
              ${isProcessing ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            {!selectedFile ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CloudUpload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Drag & Drop Your File
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isProcessing}
                />
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4" /> CSV
                  </span>
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4" /> XLS
                  </span>
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4" /> XLSX
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Maximum file size: 50MB
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <FileSpreadsheet className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={handleClear}
                    className="ml-auto p-2 rounded-full hover:bg-muted transition-colors"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {(fileError || uploadState.error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-foreground">{fileError || uploadState.error}</span>
            </motion.div>
          )}

          {/* Upload Button */}
          {selectedFile && uploadState.status === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <Button 
                variant="industrial" 
                size="xl" 
                onClick={handleUpload}
                className="w-full sm:w-auto"
              >
                <CloudUpload className="w-5 h-5 mr-2" />
                Analyze Factory Data
              </Button>
            </motion.div>
          )}

          {/* Progress Bar */}
          {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="progress-industrial">
                <div 
                  className="progress-industrial-fill"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                {uploadState.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                {' '}{uploadState.progress}%
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {uploadState.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Analysis Complete! View results below.</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
