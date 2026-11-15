# FossSpec // Terminal Forum
![Version](https://img.shields.io/badge/version-1.0.0--stable-green?style=flat-square)
![Status](https://img.shields.io/badge/status-stable%20%2F%20production-green?style=flat-square)
![Node.js](https://img.shields.io/badge/backend-Node.js%20%2F%20Express-blue?style=flat-square)
![Database](https://img.shields.io/badge/database-MongoDB%20Atlas-green?style=flat-square)
![Security](https://img.shields.io/badge/security-Zero%20Trust%20%2F%20CSP-red?style=flat-square)

**FossSpec** to lekka, minimalistyczna i w pełni bezpieczna platforma forumowa zaprojektowana w surowym, inżynieryjnym stylu terminalowym. Projekt powstał z myślą o pełnej kontroli nad kodem, maksymalnej prywatności oraz architekturze pozbawionej zbędnego bloatware'u.

---

## 🚀 Główne funkcje

* **Terminalowy interfejs (UI/UX):** Ciemny motyw w klimacie CLI, zoptymalizowana czytelność, dynamiczny wskaźnik sesji oraz profesjonalny ekran startowy (*Kernel Boot*).
* **Bufor dyskusji i wątki:** System tworzenia, przeglądania i filtrowania wątków z podziałem na kategorie.
* **Model Zero Trust i Moderacja:** 
  * Pełna izolacja treści dla niezalogowanych użytkowników.
  * System uprawnień (RBAC): użytkownicy mogą usuwać własne wątki, a administratorzy (`[admin]`) posiadają pełne uprawnienia moderacyjne.
* **Bezpieczeństwo produkcyjne:** Ochrona przed atakami XSS (`escapeHtml`), nagłówki bezpieczeństwa Helmet (CSP), Rate Limiting oraz bezpieczne zarządzanie sesjami w bazie danych.

---

## 🛠️ Stos technologiczny

* **Backend:** Node.js, Express.js
* **Baza danych:** MongoDB Atlas (Mongoose, `connect-mongo`)
* **Frontend:** Czysty JavaScript (Vanilla JS), HTML5, CSS3, FontAwesome
* **Bezpieczeństwo i sesje:** `express-session`, `helmet`, `express-rate-limit`
* **Hosting / Chmura:** Render (automatyczne wdrażanie i certyfikacja SSL/HTTPS)

---

## ⚙️ Uruchomienie lokalne

1. Sklonuj repozytorium:
   ```bash
   git clone [https://github.com/TwojLogin/FossSpec.git](https://github.com/TwojLogin/FossSpec.git)
   cd FossSpec
