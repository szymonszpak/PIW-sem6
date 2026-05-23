"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "../../firebase";
import { useCart } from "../context/CartContext";
import { doc, updateDoc } from "firebase/firestore";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

export default function Navbar() {
  const { cart, dispatch } = useCart();
  const [user, setUser] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
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

  const handleBuyCart = async () => {
    if (!user) {
      alert("Musisz być zalogowany, aby kupić grę");
      return;
    }

    try {
      for (const item of cart) {
        await updateDoc(doc(db, "games", item.id.toString()), { isSold: true });
      }

      alert("Gra została kupiona");
      dispatch({ type: "CLEAR_CART" });
      setIsCartOpen(false);
      window.location.reload();
    } catch (error) {
      alert("Błąd: " + error.message);
    }
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
          <div style={{ position: "relative" }}>
            <button
              className="button btnCart"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              KOSZYK ({cart.length})
            </button>

            {isCartOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: "0",
                marginTop: "10px",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                width: "320px",
                zIndex: 1000,
                padding: "15px",
                color: "#333",
                cursor: "default"
              }}>
                <h3 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px", fontSize: "16px" }}>
                  Twój koszyk
                </h3>

                {cart.length === 0 ? (
                  <p style={{ textAlign: "center", margin: "20px 0", color: "#7f8c8d" }}>
                    Twój koszyk jest pusty
                  </p>
                ) : (
                  <>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "250px", overflowY: "auto" }}>
                      {cart.map((item) => (
                        <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", padding: "10px 0" }}>
                          <span style={{ fontSize: "14px", fontWeight: "bold" }}>{item.title}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "14px", color: "#27ae60", fontWeight: "bold" }}>
                              {item.price_pln} zł
                            </span>
                            <button
                              onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                              style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "18px", padding: "0 5px" }}
                              title="Usuń z koszyka"
                            >
                              &times;
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "10px", borderTop: "2px solid #eee", fontWeight: "bold", fontSize: "16px" }}>
                      <span>Suma:</span>
                      <span style={{ color: "#27ae60" }}>
                        {cart.reduce((sum, item) => sum + item.price_pln, 0).toFixed(2)} zł
                      </span>
                    </div>

                    <button
                      onClick={handleBuyCart}
                      className="button btnBuy"
                      style={{
                        width: "100%",
                        marginTop: "15px",
                        padding: "10px"
                      }}
                    >
                      Kup Teraz
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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