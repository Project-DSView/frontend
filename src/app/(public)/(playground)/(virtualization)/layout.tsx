import React from 'react';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pt-4 pl-4 md:pt-6 md:pl-8 lg:pt-8 lg:pl-16">
      <section className="mt-2 md:mt-3 lg:mt-4">{children}</section>
    </main>
  );
}

export default layout;
