import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Docs - Rich Text Editor",
  description: "An open source Google Docs alternative built with Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
