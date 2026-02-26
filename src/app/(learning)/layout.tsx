import React from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default layout;
