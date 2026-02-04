import "./globals.css";

export const metadata = {
  title: "StonkTracker",
  description: "Yahoo Finance powered stock snapshots by category."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
