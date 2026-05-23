import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";

export const metadata = {
  title: "Świat Planszówek",
  description: "Aplikacja z grami planszowymi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <CartProvider>
          <Navbar />
          {children} 
        </CartProvider>
      </body>
    </html>
  );
}