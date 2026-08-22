import "./globals.css";
export const metadata = {
title: "NOOR-E-ILM",
  description: "Learn all subjects for Matriculation and Intermediate online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
