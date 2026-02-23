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
      <body className={fredoka.className}>
        <div className="min-h-screen p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
