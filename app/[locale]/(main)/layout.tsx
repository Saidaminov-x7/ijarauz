interface MainLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}