'use client';

import React, { Suspense } from 'react';
import AuthButtons from './AuthButtons';

const AuthButtonsLoading = () => (
  <div className="flex items-center space-x-2">
    <div className="border-muted-foreground/30 border-t-foreground h-4 w-4 animate-spin rounded-full border-2"></div>
    <span className="text-muted-foreground text-sm">Loading...</span>
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
