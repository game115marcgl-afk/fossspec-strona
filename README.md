# 💬 FossSpec Forum

Oficjalna platforma społecznościowa i forum dyskusyjne kanału **FossSpec**, stworzona od zera w technologii Node.js oraz Express, zintegrowana z bazą danych MongoDB Atlas w chmurze.

---

## 🚀 O projekcie

Projekt powstał jako rozwinięcie prostej strony wizytówkowej w pełni funkcjonalne forum internetowe, na którym użytkownicy mogą zakładać konta, tworzyć wątki dyskusyjne w różnych kategoriach oraz wymieniać się opiniami w komentarzach.

### ✨ Główne funkcje:
- **System Kont i Autoryzacji:** Rejestracja użytkowników oraz bezpieczne logowanie z użyciem sesji (`express-session`) i szyfrowania haseł (`bcryptjs`).
- **Automatyczna Ranga Admina:** Pierwsza zarejestrowana osoba w systemie automatycznie otrzymuje uprawnienia administratora.
- **Kategorie Wątków:** Podział dyskusji na działy takie jak *Ogłoszenia*, *Hardware*, *Software & FOSS* oraz *Ogólne*.
- **System Komentarzy:** Możliwość odpowiadania na wątki i prowadzenia dyskusji w czasie rzeczywistym.
- **Trwała Baza Danych:** Pełna integracja z chmurą **MongoDB Atlas** (Mongoose ODM) – dane użytkowników i posty są bezpieczne i nie znikają po restarcie serwera.

---

## 🛠️ Technologie

Projekt opiera się na nowoczesnym stosie JavaScript (Node.js):
- **Backend:** Node.js, Express.js
- **Baza danych:** MongoDB Atlas, Mongoose
- **Bezpieczeństwo:** Bcrypt.js, Express-session, Dotenv
- **Frontend:** Czysty HTML5, CSS3, JavaScript (Fetch API)
- **Hosting / Chmura:** Render.com

---

## ⚙️ Uruchomienie lokalne

Jeśli chcesz uruchomić projekt lokalnie na swoim komputerze:

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/game115marcgl-afk/fossspec-strona.git
   cd fossspec-strona
