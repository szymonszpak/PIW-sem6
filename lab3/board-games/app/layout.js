import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Świat Planszówek",
  description: "Aplikacja z grami planszowymi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <nav className="navbar">
          <div className="logo">
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              ŚWIAT PLANSZÓWEK
            </Link>
          </div>
          <div className="nav-button">
            <button className="button btnLogin">ZALOGUJ</button>
            <button className="button btnCart">KOSZYK</button>
          </div>
        </nav>
        {children} 
      </body>
    </html>
  );
}