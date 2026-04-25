"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from 'react';

export default function GameDetails({ params }) {
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [mainImage, setMainImage] = useState(null);

    useEffect(() => {
        const savedGames = JSON.parse(localStorage.getItem("myBoardGames") || "[]");
        const foundLocalGame = savedGames.find((g) => g.id.toString() === id);

        if (foundLocalGame) {
            setGame(foundLocalGame);
            if (foundLocalGame.images && foundLocalGame.images.length > 0) {
                setMainImage(foundLocalGame.images[0]);
            }
            setLoading(false);
        } else {
            fetch("https://szandala.github.io/piwo-api/board-games.json")
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.board_games) {
                        const foundGame = data.board_games.find((g) => g.id.toString() === id);
                        setGame(foundGame);
                        if (foundGame && foundGame.images && foundGame.images.length > 0) {
                            setMainImage(foundGame.images[0]);
                        }
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id]);

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
                    <button className="button btnCart">DODAJ DO KOSZYKA</button>
                </div>
            </section>
        </main>
    );
}