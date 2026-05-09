"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from 'react';
import { db, auth} from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function GameDetails({ params }) {
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [mainImage, setMainImage] = useState(null);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

const fetchGameFromCloud = async () => {
        try {
            const docRef = doc(db, "games", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const foundGame = { ...docSnap.data(), id: docSnap.id };
                setGame(foundGame);
                
                if (foundGame.images && foundGame.images.length > 0) {
                    setMainImage(foundGame.images[0]);
                }
            } else {
                console.error("Taka gra nie istnieje w chmurze");
            }
        } catch (error) {
            console.error("Błąd pobierania:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGameFromCloud();
    }, [id]);

    const handleBuy = async () => {
        if (!user) {
            alert("Musisz być zalogowany, aby kupić grę");
            return;
        }

        try {
            await updateDoc(doc(db, "games", id), { isSold: true });
            fetchGameFromCloud();
            alert("Gra została kupiona");
        } catch (error) {
            alert("Błąd: " + error.message);
        }
    };

    if (loading) {
        return <div style={{ padding: "100px", textAlign: "center" }}>Ładowanie danych gry...</div>;
    }

    if (!game) {
        return (
            <div style={{ padding: "100px", textAlign: "center" }}>
                <h2>Nie znaleziono takiej gry</h2>
                <br />
                <Link href="/" className="button btnLogin" style={{ textDecoration: "none" }}>
                    Wróć do strony głównej
                </Link>
            </div>
        );
    }

    return (
        <main className="main-container product-detail-container">
            <div className="product-gallery">
                <div className="large-image">
                    {game.isSold && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'red', color: 'white', padding: '15px 30px', fontWeight: 'bold', borderRadius: '5px', zIndex: 5, fontSize: '24px' }}>
                            SPRZEDANE
                        </div>
                    )}
                    {mainImage ? (
                        <img
                            src={`https://szandala.github.io/piwo-api/images/board-games/${mainImage.split('/').pop()}`}
                            alt={game.title}
                            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "10px", objectFit: "contain" }}
                        />
                    ) : (
                        <img
                            src="/gra.jpg"
                            alt="Placeholder"
                            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "10px", objectFit: "contain" }}
                        />
                    )}
                </div>

                {game.images && game.images.length > 0 && (
                    <div className="thumbnails">
                        {game.images.map((imgUrl, index) => (
                            <div 
                                className="thumb" 
                                key={index} 
                                onClick={() => setMainImage(imgUrl)}
                                style={{ 
                                    padding: '3px', 
                                    cursor: 'pointer',
                                    border: mainImage === imgUrl ? '3px solid #3498db' : '3px solid transparent',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <img
                                    src={`https://szandala.github.io/piwo-api/images/board-games/${imgUrl.split('/').pop()}`}
                                    alt={`Miniatura ${index + 1}`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "5px" }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <section className="product-info">
                <nav className="breadcrumb">
                    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Strona główna</Link> / {game.type} / {game.title}
                </nav>

                <h1>{game.title} {game.is_expansion ? "(Dodatek)" : ""}</h1>
                <p className="price-detail">{game.price_pln} zł</p>

                <div className="product-meta">
                    <p><strong>Wydawnictwo:</strong> {game.publisher}</p>
                    <p><strong>Liczba graczy:</strong> {game.min_players}-{game.max_players} osób</p>
                    <p><strong>Czas gry:</strong> {game.avg_play_time_minutes} min</p>
                </div>

                <div className="description">
                    <h3>Opis gry:</h3>
                    {game.description && game.description.length > 0 ? (
                        <ul>
                            {game.description.map((sentence, idx) => (
                                <li key={idx} style={{ marginBottom: "8px", marginLeft: "20px" }}>{sentence}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>Brak opisu.</p>
                    )}
                </div>

                <div className="purchase-section">
                    <input type="number" defaultValue="1" min="1" className="qty-input" />
                    <button 
                        className="button btnCart" 
                        onClick={handleBuy}
                        disabled={game.isSold}
                        style={{ cursor: game.isSold ? 'not-allowed' : 'pointer', backgroundColor: game.isSold ? '#95a5a6' : '' }}
                    >
                        {game.isSold ? "NIEDOSTĘPNE" : "KUP TERAZ"}
                    </button>                </div>
            </section>
        </main>
    );
}