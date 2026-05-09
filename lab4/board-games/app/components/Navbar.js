"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "../../firebase";

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsModalOpen(false);
    } catch (error) {
      alert("Błąd logowania Google: " + error.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsModalOpen(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      alert("Błąd weryfikacji (" + error.message + ")");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            ŚWIAT PLANSZÓWEK
          </Link>
        </div>
        <div className="nav-button" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: 'bold' }}>
                Witaj, {user.email?.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="button btnLogin">WYLOGUJ</button>
            </>
          ) : (
            <button onClick={() => setIsModalOpen(true)} className="button btnLogin">ZALOGUJ</button>
          )}
          <button className="button btnCart">KOSZYK</button>
        </div>
      </nav>

      {isModalOpen && (
        <div className="modal-overlay" style={{ opacity: 1, visibility: 'visible' }}>
          <div className="modal-window" style={{ transform: 'scale(1)' }}>
            <span onClick={() => setIsModalOpen(false)} className="close-btn">&times;</span>
            <h2 style={{ marginBottom: "20px" }}>{isLoginMode ? "Zaloguj się" : "Zarejestruj się"}</h2>

            <form className="add-game-form" onSubmit={handleEmailAuth}>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hasło:</label>
                <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="button btnAcceptAdd" style={{ marginTop: "10px" }}>
                {isLoginMode ? "Zaloguj" : "Zarejestruj"}
              </button>
            </form>

            <div style={{ textAlign: "center", margin: "15px 0" }}>LUB</div>

            <button onClick={handleGoogleLogin} className="button" style={{ width: "100%", backgroundColor: "#db4437", color: "white", marginBottom: "15px" }}>
              Zaloguj przez Google
            </button>

            <p style={{ textAlign: "center", fontSize: "14px", marginTop: "10px" }}>
              {isLoginMode ? "Nie masz konta?" : "Masz już konto?"}{" "}
              <span 
                style={{ color: "#3498db", cursor: "pointer", fontWeight: "bold" }} 
                onClick={() => setIsLoginMode(!isLoginMode)}
              >
                {isLoginMode ? "Zarejestruj się" : "Zaloguj się"}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}