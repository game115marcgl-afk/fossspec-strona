# 💬 FossSpec Forum

Oficjalna platforma społecznościowa i forum dyskusyjne kanału **FossSpec**, stworzona w Node.js oraz Express, zintegrowana z bazą danych MongoDB Atlas w chmurze.

---

## 🚀 O projekcie

Forum internetowe, na którym użytkownicy mogą zakładać konta, tworzyć wątki dyskusyjne w różnych kategoriach oraz wymieniać się opiniami w komentarzach.

### ✨ Główne funkcje

- **System kont i autoryzacji** — rejestracja i logowanie z użyciem sesji (`express-session`) oraz szyfrowania haseł (`bcryptjs`).
- **Automatyczna ranga admina** — pierwsza zarejestrowana osoba w systemie otrzymuje uprawnienia administratora.
- **Kategorie wątków** — dyskusje podzielone na kategorie zarządzane z poziomu bazy danych.
- **System komentarzy** — odpowiedzi na wątki.
- **Trwała baza danych** — pełna integracja z MongoDB Atlas (Mongoose ODM).

---

## 🛠️ Technologie

- **Backend:** Node.js, Express.js
- **Baza danych:** MongoDB Atlas, Mongoose
- **Bezpieczeństwo:** bcryptjs, express-session, helmet, express-mongo-sanitize, express-rate-limit, dotenv
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API)
- **Hosting:** Render.com

---

## 📁 Struktura projektu

```
fossspec-backend/
├── server.js              # Punkt wejścia — start serwera
├── app.js                 # Konfiguracja Express (middleware, trasy)
├── config/
│   └── db.js               # Połączenie z MongoDB
├── models/                 # Schematy Mongoose (User, Thread, Reply, Category)
├── controllers/            # Logika biznesowa
├── routes/                 # Definicje endpointów API
├── middleware/              # Auth, centralny error handler
├── utils/                  # AppError, asyncHandler, walidacja wejścia
├── public/                 # Frontend (statyczne pliki)
├── .env.example             # Wzorzec zmiennych środowiskowych
└── .gitignore
```

---

## ⚙️ Uruchomienie lokalne

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/game115marcgl-afk/fossspec-strona.git
   cd fossspec-strona
   ```

2. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe:**

   Skopiuj `.env.example` do `.env`:
   ```bash
   cp .env.example .env
   ```

   Uzupełnij w nim:
   - `MONGO_URI` — connection string do własnego klastra MongoDB Atlas (pobierz z panelu Atlas → Database Access, **nigdy nie commituj tego pliku**),
   - `SESSION_SECRET` — długi, losowy ciąg znaków. Możesz wygenerować go komendą:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

4. **Uruchom serwer:**
   ```bash
   npm run dev     # tryb deweloperski, z auto-restartem
   # albo
   npm start       # tryb produkcyjny
   ```

5. Aplikacja domyślnie działa pod `http://localhost:3000`.

---

## 🔒 Bezpieczeństwo

- Plik `.env` **nigdy** nie trafia do repozytorium (patrz `.gitignore`).
- Hasła użytkowników są hashowane (bcrypt, 12 rund) i nigdy nie są zwracane w odpowiedziach API.
- Wejście z formularzy jest walidowane i sanityzowane pod kątem NoSQL injection.
- Endpointy logowania/rejestracji mają rate limiting.
- Szczegóły w [SECURITY.md](./SECURITY.md).

Jeśli znajdziesz lukę bezpieczeństwa, zgłoś ją zgodnie z instrukcją w `SECURITY.md` — nie publikuj jej publicznie w Issues.

---

## 🗺️ Plan rozwoju

- [ ] Zarządzanie kategoriami z panelu admina
- [ ] Awatary użytkowników
- [ ] Statystyki (liczba wątków/odpowiedzi, wyświetlenia)
- [ ] Weryfikacja e-mail przy rejestracji
