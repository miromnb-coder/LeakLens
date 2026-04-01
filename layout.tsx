
import "./globals.css";

export const metadata = {
  title: "LeakLens",
  description: "Find money leaks in screenshots and emails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
