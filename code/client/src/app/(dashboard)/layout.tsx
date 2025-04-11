import Nav from '@/components/Nav';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full min-h-screen">
      <Nav />
      <div className="ml-64 flex flex-1 justify-center bg-offset p-8">
        <div className="min-w-[600px] max-w-[1200px] flex-1 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}
