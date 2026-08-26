import LayoutServer from './layout-server'

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <LayoutServer params={params}>{children}</LayoutServer>;
}

export function generateStaticParams() {
  return ['uz', 'en', 'ru'].map((locale) => ({ locale }));
}