import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zoo École - Apprends en t'amusant !",
  description: "Application éducative gamifiée pour élèves de 3e année",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={fredoka.className}>
        <div className="min-h-screen min-h-[100dvh] p-3 sm:p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
