import React from 'react';
import Toggle from '@/components/toggle';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pt-8 pl-16">
      <article>
        <div className="inline-block">
          <Toggle />
        </div>
      </article>
      <section className="mt-4">{children}</section>
    </main>
  );
}

export default layout;
