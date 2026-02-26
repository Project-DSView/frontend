import React from 'react';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background">
      <section className="mt-2 md:mt-3 lg:mt-4">{children}</section>
    </main>
  );
}

export default layout;
