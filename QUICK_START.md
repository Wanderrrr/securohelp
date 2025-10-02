# SecuroHelp CRM - Szybki Start

## ⚡ Szybka konfiguracja (3 kroki)

### 1️⃣ Utwórz tabele w Supabase

1. Otwórz panel Supabase: https://supabase.com
2. Przejdź do **SQL Editor**
3. Skopiuj i uruchom plik `supabase/migrations/001_initial_schema.sql`

### 2️⃣ Dodaj pierwszego użytkownika

**Najłatwiejszy sposób:**
```bash
npm run db:setup
```

To utworzy 3 użytkowników testowych - możesz się zalogować jako:
- **admin@securohelp.pl** / **admin123**

**LUB możesz dodać własnego użytkownika:**

W panelu Supabase (Table Editor → users):
1. Kliknij **Insert row**
2. Wypełnij:
   - email: twoj@email.pl
   - first_name: Imię
   - last_name: Nazwisko
   - role: admin
   - is_active: true
   - password_hash: (zobacz poniżej jak wygenerować)

**Jak wygenerować password_hash:**
- Online: https://bcrypt-generator.com/ (wybierz Rounds: 10)
- Lub w terminalu:
  ```bash
  node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('twojeHaslo', 10).then(h => console.log(h));"
  ```

### 3️⃣ Uruchom aplikację

```bash
npm run dev
```

Otwórz http://localhost:3000 i zaloguj się!

## ℹ️ Potrzebujesz więcej informacji?

Zobacz pełną instrukcję w pliku `DATABASE_SETUP.md`

## 🆘 Problemy?

### Nie mogę się zalogować
- Sprawdź czy użytkownik istnieje w tabeli `users`
- Upewnij się że `password_hash` to hash bcrypt, nie czyste hasło
- Sprawdź czy `is_active = true`

### Błąd "relation does not exist"
Tabele nie istnieją - wykonaj Krok 1

### Dashboard pokazuje błąd
To normalne gdy baza jest pusta. Dodaj pierwszego klienta i sprawę, żeby zobaczyć dane.
