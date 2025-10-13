import React from 'react';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pt-8 pl-16">
      <section className="mt-4">{children}</section>
    </main>
  );
}

export default layout;
