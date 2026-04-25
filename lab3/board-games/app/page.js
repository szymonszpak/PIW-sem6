"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [games, setGames] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const defaultForm = {
    id: null,
    title: "",
    price: "",
    category: "Strategiczna",
    players: "1 gracz",
    publisher: "Rebel",
    playTime: "Do 30 min",
    image: ""
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetch("https://szandala.github.io/piwo-api/board-games.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.board_games) setGames(data.board_games);
      })
      .catch((err) => console.error(err));
  }, []);

  const uniqueCategories = [...new Set(games.map(g => g.type?.toLowerCase()).filter(Boolean))];
  const uniquePublishers = [...new Set(games.map(g => g.publisher).filter(Boolean))];

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleCheckboxChange = (state, setState, value) => {
    if (state.includes(value)) {
      setState(state.filter(item => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const filteredGames = games.filter((game) => {
    const matchSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPrice = game.price_pln <= maxPrice;

    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(game.type?.toLowerCase());
    const matchPublisher = selectedPublishers.length === 0 || selectedPublishers.includes(game.publisher);

    const matchPlayers = selectedPlayers.length === 0 || selectedPlayers.some(p => {
      if (p === "1 gracz") return game.min_players <= 1;
      if (p === "2 graczy") return game.min_players <= 2 && game.max_players >= 2;
      if (p === "3-4 graczy") return game.min_players <= 4 && game.max_players >= 3;
      if (p === "5+ graczy") return game.max_players >= 5;
      return false;
    });

    const matchTime = selectedTimes.length === 0 || selectedTimes.some(t => {
      if (t === "Do 30 min") return game.avg_play_time_minutes <= 30;
      if (t === "Ponad 30 min") return game.avg_play_time_minutes > 30;
      if (t === "Ponad 60 min") return game.avg_play_time_minutes > 60;
      return false;
    });

    return matchSearch && matchPrice && matchCategory && matchPublisher && matchPlayers && matchTime;
  });

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const paginatedGames = filteredGames.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, maxPrice, selectedCategories, selectedPublishers, selectedPlayers, selectedTimes]);

  const openAddModal = () => {
    setFormData(defaultForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

const openEditModal = (gameToEdit) => {
    let playersOption = "1 gracz";
    if (gameToEdit.max_players >= 5) {
      playersOption = "5+ graczy";
    } else if (gameToEdit.max_players >= 3) {
      playersOption = "3-4 graczy";
    } else if (gameToEdit.max_players === 2) {
      playersOption = "2 graczy";
    }

    let timeOption = "Do 30 min";
    if (gameToEdit.avg_play_time_minutes > 60) {
      timeOption = "Ponad 60 min";
    } else if (gameToEdit.avg_play_time_minutes > 30) {
      timeOption = "Ponad 30 min";
    }

    setFormData({
      id: gameToEdit.id,
      title: gameToEdit.title,
      price: gameToEdit.price_pln,
      category: gameToEdit.type ? gameToEdit.type.charAt(0).toUpperCase() + gameToEdit.type.slice(1) : "Strategiczna",
      players: playersOption,
      publisher: gameToEdit.publisher || "Rebel",
      playTime: timeOption,
      image: gameToEdit.images?.[0] || ""
    });
    
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      const updatedGames = games.map(g =>
        g.id === formData.id ? {
          ...g,
          title: formData.title,
          price_pln: parseFloat(formData.price),
          publisher: formData.publisher,
          type: formData.category.toLowerCase()
        } : g
      );
      setGames(updatedGames);
    } else {
      const newGame = {
        id: Date.now(),
        title: formData.title,
        price_pln: parseFloat(formData.price),
        type: formData.category.toLowerCase(),
        publisher: formData.publisher,
        min_players: 1,
        max_players: 4,
        avg_play_time_minutes: 60,
        images: formData.image ? [formData.image] : [],
      };
      setGames([newGame, ...games]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <main className="main-container">
        <aside className="sidebar">
          <h3>Opcje filtrowania</h3>

          <div className="filter-group">
            <label>Wyszukaj:</label>
            <input type="text" placeholder="Czego szukasz" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="filter-group">
            <label>Kategoria</label>
            <details className="custom-select">
              <summary>Wybierz kategorie...</summary>
              <div className="checkbox-list">
                <label>
                  <input type="checkbox" checked={selectedCategories.length === 0} onChange={() => setSelectedCategories([])} />
                  Wszystkie
                </label>
                {uniqueCategories.map(cat => (
                  <label key={cat}>
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => handleCheckboxChange(selectedCategories, setSelectedCategories, cat)} />
                    {capitalize(cat)}
                  </label>
                ))}
              </div>
            </details>
          </div>

          <div className="filter-group">
            <label>Ilość graczy</label>
            <details className="custom-select">
              <summary>Wybierz ilość graczy...</summary>
              <div className="checkbox-list">
                <label><input type="checkbox" checked={selectedPlayers.length === 0} onChange={() => setSelectedPlayers([])} /> Wszystkie</label>
                <label><input type="checkbox" checked={selectedPlayers.includes("1 gracz")} onChange={() => handleCheckboxChange(selectedPlayers, setSelectedPlayers, "1 gracz")} /> 1 gracz</label>
                <label><input type="checkbox" checked={selectedPlayers.includes("2 graczy")} onChange={() => handleCheckboxChange(selectedPlayers, setSelectedPlayers, "2 graczy")} /> 2 graczy</label>
                <label><input type="checkbox" checked={selectedPlayers.includes("3-4 graczy")} onChange={() => handleCheckboxChange(selectedPlayers, setSelectedPlayers, "3-4 graczy")} /> 3-4 graczy</label>
                <label><input type="checkbox" checked={selectedPlayers.includes("5+ graczy")} onChange={() => handleCheckboxChange(selectedPlayers, setSelectedPlayers, "5+ graczy")} /> 5+ graczy</label>
              </div>
            </details>
          </div>

          <div className="filter-group">
            <label>Wydawnictwo</label>
            <details className="custom-select">
              <summary>Wybierz wydawnictwo...</summary>
              <div className="checkbox-list">
                <label>
                  <input type="checkbox" checked={selectedPublishers.length === 0} onChange={() => setSelectedPublishers([])} />
                  Wszystkie
                </label>
                {uniquePublishers.map(pub => (
                  <label key={pub}>
                    <input type="checkbox" checked={selectedPublishers.includes(pub)} onChange={() => handleCheckboxChange(selectedPublishers, setSelectedPublishers, pub)} />
                    {pub}
                  </label>
                ))}
              </div>
            </details>
          </div>

          <div className="filter-group">
            <label>Cena do: {maxPrice} zł</label>
            <input type="range" min="0" max="1000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>

          <div className="filter-group">
            <label>Czas rozgrywki</label>
            <details className="custom-select">
              <summary>Wybierz czas gry...</summary>
              <div className="checkbox-list">
                <label><input type="checkbox" checked={selectedTimes.length === 0} onChange={() => setSelectedTimes([])} /> Dowolny</label>
                <label><input type="checkbox" checked={selectedTimes.includes("Do 30 min")} onChange={() => handleCheckboxChange(selectedTimes, setSelectedTimes, "Do 30 min")} /> Do 30 min</label>
                <label><input type="checkbox" checked={selectedTimes.includes("Ponad 30 min")} onChange={() => handleCheckboxChange(selectedTimes, setSelectedTimes, "Ponad 30 min")} /> Ponad 30 min</label>
                <label><input type="checkbox" checked={selectedTimes.includes("Ponad 60 min")} onChange={() => handleCheckboxChange(selectedTimes, setSelectedTimes, "Ponad 60 min")} /> Ponad 60 min</label>
              </div>
            </details>
          </div>

          <button className="button btnFilter" style={{ width: '100%', marginBottom: '20px' }}>Filtruj</button>

          <hr style={{ border: 'none', borderTop: '2px solid #eee', margin: '20px 0' }} />
          <button onClick={openAddModal} className="button btnAddGame" style={{ width: '100%', margin: '0' }}>
            + Dodaj nową grę
          </button>
        </aside>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <section className="products-grid">
            {paginatedGames.map((game) => (
              <article key={game.id} className="product-card" style={{ position: 'relative' }}>
                <button
                  onClick={() => openEditModal(game)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.8)', border: '1px solid #ddd', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', zIndex: 10, fontSize: '12px' }}
                >
                  Edytuj
                </button>

                <Link href={`/game/${game.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                  <div className="product-image">
                    {game.images && game.images.length > 0 ? (
                      <img
                        src={`https://szandala.github.io/piwo-api/images/board-games/${game.images[0].split('/').pop()}`}
                        alt={game.title}
                        style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "10px", objectFit: "contain" }}
                      />
                    ) : (
                      <img
                        src="/gra.jpg"
                        alt={game.title}
                        style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "10px", objectFit: "contain" }}
                      />
                    )}
                  </div>
                  <h4>{game.title}</h4>
                  <p className="price">{game.price_pln} zł</p>
                </Link>
                <button className="button btnBuy">Do koszyka</button>
              </article>
            ))}
          </section>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "40px" }}>
              <button className="button" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Poprzednia</button>
              <span style={{ fontWeight: "bold" }}>Strona {currentPage} z {totalPages}</span>
              <button className="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Następna</button>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" style={{ opacity: 1, visibility: 'visible' }}>
          <div className="modal-window" style={{ transform: 'scale(1)' }}>
            <span onClick={() => setIsModalOpen(false)} className="close-btn">&times;</span>
            <h2>{isEditing ? "Edytuj pozycję" : "Dodaj nową pozycję"}</h2>

            <form className="add-game-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nazwa gry:</label>
                <input type="text" placeholder="Wpisz tytuł..." required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Cena (zł):</label>
                <input type="number" step="0.01" min="0" placeholder="99.99" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Kategoria:</label>
                <input type="text" required placeholder="np. Strategiczna" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Ilość graczy</label>
                <select value={formData.players} onChange={(e) => setFormData({ ...formData, players: e.target.value })}>
                  <option>1 gracz</option>
                  <option>2 graczy</option>
                  <option>3-4 graczy</option>
                  <option>5+ graczy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Wydawnictwo</label>
                <input type="text" required placeholder="np. Rebel" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Czas rozgrywki</label>
                <select value={formData.playTime} onChange={(e) => setFormData({ ...formData, playTime: e.target.value })}>
                  <option>Do 30 min</option>
                  <option>Ponad 30 min</option>
                  <option>Ponad 60 min</option>
                </select>
              </div>

              <button type="submit" className="button btnAcceptAdd">
                {isEditing ? "Zapisz zmiany" : "Zapisz i dodaj"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}