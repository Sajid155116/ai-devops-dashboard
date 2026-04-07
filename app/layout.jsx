import "./globals.css";

export const metadata = {
  title: "AI DevOps Dashboard",
  description: "Authentication pages"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}