"use client";
import { useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);

  const migrateData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://szandala.github.io/piwo-api/board-games.json");
      const data = await response.json();

      if (data && data.board_games) {
        for (const game of data.board_games) {
          const gameRef = doc(db, "games", game.id.toString());
          
          await setDoc(gameRef, {
            ...game,
            author: "admin", 
            isSold: false
          });
        }
        alert("Udało się. Wszystkie gry są już w Firebase");
      }
    } catch (error) {
      console.error(error);
      alert("Błąd migracji: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h1>Panel Migracji Danych</h1>
      <p style={{ marginBottom: "30px" }}>Kliknij przycisk poniżej, aby przenieść gry z JSON do chmury Firestore.</p>
      
      <button 
        onClick={migrateData} 
        disabled={loading}
        className="button btnAcceptAdd" 
        style={{ padding: "20px", fontSize: "18px" }}
      >
        {loading ? "Wysyłanie do chmury..." : "Pobierz JSON i wyślij do Firestore"}
      </button>
    </div>
  );
}