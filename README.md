
# Forum FossSpec

W pełni funkcjonalne forum społecznościowe skupione wokół technologii Open Source i Linuxa.

## 🚀 Technologie
- **Backend:** Node.js, Express.js
- **Baza danych:** MongoDB (Atlas)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Bezpieczeństwo:** Helmet.js, express-session, express-rate-limit

## 🛠 Instalacja i uruchomienie lokalne

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/game115marcgl-afk/fossspec-strona.git
   cd fossspec-strona
   ```

2. Zainstaluj zależności:
   ```bash
   yarn install
   ```

3. Skonfiguruj zmienne środowiskowe:
   - Utwórz plik `.env` w głównym folderze i dodaj:
     ```env
     PORT=3000
     MONGO_URI=twój_link_do_mongodb
     SESSION_SECRET=losowy_długi_ciąg_znaków
     ```

4. Uruchom serwer:
   ```bash
   node server.js
   ```

## 📁 Struktura projektu
- `/public` - pliki frontendowe (HTML, CSS, JS).
- `/src` - logika backendowa, modele bazy danych i middleware.
- `/server.js` - punkt wejścia aplikacji.

## 🔐 Uwagi dotyczące bezpieczeństwa
- Aplikacja wykorzystuje **Helmet.js** do zabezpieczenia nagłówków HTTP oraz polityki **CSP (Content Security Policy)**.
- Skrypty JS zostały wydzielone do osobnych plików w `/public/js/`, aby zapewnić zgodność z polityką bezpieczeństwa przeglądarek.
```
