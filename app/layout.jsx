import './globals.css';

export const metadata = {
  title: "Resume Screening",
  description: "Simple resume screening app running on Vercel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
