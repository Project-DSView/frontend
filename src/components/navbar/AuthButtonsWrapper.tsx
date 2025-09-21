'use client';

import React, { Suspense } from 'react';
import AuthButtons from './AuthButtons';

const AuthButtonsLoading = () => (
  <div className="flex items-center space-x-2">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
    <span className="text-sm text-gray-600">Loading...</span>
  </div>
);

const AuthButtonsWrapper: React.FC = () => {
  return (
    <Suspense fallback={<AuthButtonsLoading />}>
      <AuthButtons />
    </Suspense>
  );
};

export default AuthButtonsWrapper;
