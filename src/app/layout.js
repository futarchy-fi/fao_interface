import { IBM_Plex_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import { Toaster } from 'sonner';
import { ThemeProvider } from "../context/ThemeContext";
import { FloatingAIChat } from "../components/ui/FloatingAIChat";
import StatusHUD from "../components/StatusHUD";

const mono = IBM_Plex_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" });
const pixel = Press_Start_2P({ weight: ["400"], subsets: ["latin"], variable: "--font-pixel" });

export const metadata = {
  title: "FAO | Futarchy Autonomous Organization",
  description: "The future of governance. Award winning design.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${mono.variable} ${pixel.variable} font-mono antialiased`}>
        <ThemeProvider>
          <Providers>
            {children}
            <FloatingAIChat />
            <StatusHUD />
            <Toaster position="bottom-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
