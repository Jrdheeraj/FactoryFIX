import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { OverviewSection } from '@/components/OverviewSection';
import { UploadSection } from '@/components/UploadSection';
import { ProcessingSection } from '@/components/ProcessingSection';
import { ResultsSection } from '@/components/ResultsSection';
import { DataTableSection } from '@/components/DataTableSection';
import { Footer } from '@/components/Footer';
import { AIControlRoomSection } from '@/components/AIControlRoomSection';
import { useFactoryUpload } from '@/hooks/useFactoryUpload';

const Index = () => {
  const { uploadState, uploadFile, resetUpload } = useFactoryUpload();

  const showProcessing =
    uploadState.status === 'uploading' ||
    uploadState.status === 'processing';

  const showResults =
    uploadState.status === 'complete' && uploadState.data;

  // ✅ FIXED DATA MAPPING
  const factoryHealth = uploadState.data;
  const lineOptimization =
    uploadState.data?.manufacturing_line_optimization;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <HeroSection />
        <OverviewSection />

        {/* 🔥 AI Control Room */}
        <AIControlRoomSection />

        <UploadSection
          uploadState={uploadState}
          onFileUpload={uploadFile}
          onReset={resetUpload}
        />

        {showProcessing && (
          <ProcessingSection progress={uploadState.progress} />
        )}

        {showResults && factoryHealth && lineOptimization && (
          <>
            {/* ✅ Results */}
            <ResultsSection data={factoryHealth} />

            {/* ✅ Machine Table */}
            {factoryHealth.machines &&
              factoryHealth.machines.length > 0 && (
                <DataTableSection machines={factoryHealth.machines} />
              )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
