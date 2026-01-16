import localFont from 'next/font/local';

const notoSansThai = localFont({
  src: [
    {
      path: '../../../public/fonts/NotoSansThai/NotoSansThai-VariableFont_wdth,wght.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-noto-sans-thai',
  display: 'swap',
  preload: true,
  fallback: ['sans-serif'],
});

export { notoSansThai };
