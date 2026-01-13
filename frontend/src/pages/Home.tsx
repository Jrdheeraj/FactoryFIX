import { useState } from 'react';
import { DataUpload } from '@/components/DataUpload';
import { ResultsSection } from '@/components/ResultsSection';

export const Home = () => {
  const [result, setResult] = useState<any>(null);

  return (
    <>
      <DataUpload onResult={setResult} />
      {result && <ResultsSection data={result} />}
    </>
  );
};
