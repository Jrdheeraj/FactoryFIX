import { useState } from 'react';
import { DataUpload } from '@/components/DataUpload';
import { ResultsSection } from '@/components/ResultsSection';
import { FactoryAnalysisResponse } from '@/types/factory';

export const Home = () => {
  const [result, setResult] =
    useState<FactoryAnalysisResponse | null>(null);

  return (
    <>
      <DataUpload onResult={setResult} />
      {result && <ResultsSection data={result} />}
    </>
  );
};
