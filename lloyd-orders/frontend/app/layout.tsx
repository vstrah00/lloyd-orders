import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lloyd Orders",
  description: "Simple beach bar ordering system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
