import Link from 'next/link';

const page = () => {
  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center gap-y-5 text-white">
      <div className="z-10">
        <h1 className="text-secondary text-center text-9xl font-extrabold">404</h1>
        <p className="text-secondary text-center text-4xl font-extrabold">NOT FOUND...</p>
      </div>
      <div
        className={`border-primary relative z-10 rounded-3xl border p-[1px] font-bold text-white`}
      >
        <div className={'text-primary w-full rounded-3xl px-5 py-3'}>
          <Link href="/">กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
};

export default page;
