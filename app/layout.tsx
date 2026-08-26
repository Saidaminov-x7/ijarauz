export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logotip.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
