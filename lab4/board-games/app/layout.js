import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Świat Planszówek",
  description: "Aplikacja z grami planszowymi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        {children} 
      </body>
    </html>
  );
}