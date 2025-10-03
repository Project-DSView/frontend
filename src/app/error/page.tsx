'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

const ErrorContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('An error occurred');
  const [errorCode, setErrorCode] = useState<string>('');

  useEffect(() => {
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
    if (code) {
      setErrorCode(code);
    }
  }, [searchParams]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Authentication Error</h1>
          <p className="mb-4 text-gray-600">{errorMessage}</p>
          {errorCode && <p className="mb-4 text-sm text-gray-500">Error Code: {errorCode}</p>}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoHome}
            className="flex w-full items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go to Home</span>
          </Button>

          <Button
            onClick={handleRetry}
            variant="outline"
            className="flex w-full items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

const ErrorPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mb-6">
              <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Loading...</h1>
            </div>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
};

export default ErrorPage;
