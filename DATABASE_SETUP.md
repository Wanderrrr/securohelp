# Konfiguracja bazy danych Supabase

## Krok 1: Utwórz tabele w Supabase

1. Zaloguj się do panelu Supabase: https://supabase.com
2. Otwórz swój projekt
3. Przejdź do **SQL Editor** w menu po lewej stronie
4. Skopiuj całą zawartość pliku `supabase/migrations/001_initial_schema.sql`
5. Wklej kod SQL i kliknij **Run**

To utworzy wszystkie tabele i wstępne dane (firmy ubezpieczeniowe, statusy, kategorie dokumentów).

## Krok 2: Dodaj użytkowników

Po utworzeniu tabel, musisz dodać użytkowników. Masz dwie opcje:

### Opcja A: Użyj skryptu (zalecane)

```bash
npm run db:setup
```

Ten skrypt utworzy 3 użytkowników testowych:
- **admin@securohelp.pl** / hasło: **admin123** (administrator)
- **agent1@securohelp.pl** / hasło: **agent123** (agent)
- **agent2@securohelp.pl** / hasło: **agent123** (agent)

### Opcja B: Dodaj użytkowników ręcznie przez panel Supabase

1. W panelu Supabase przejdź do **Table Editor**
2. Wybierz tabelę `users`
3. Kliknij **Insert** → **Insert row**
4. Wypełnij pola:
   - `email`: Twój adres email
   - `first_name`: Imię
   - `last_name`: Nazwisko
   - `role`: `admin` lub `agent`
   - `is_active`: `true`
   - `password_hash`: **Zobacz instrukcję poniżej**

#### Jak wygenerować password_hash?

Hasła muszą być zahashowane algorytmem bcrypt. Nie możesz po prostu wpisać hasła tekstowego!

**Metoda 1: Użyj narzędzia online**
1. Przejdź na https://bcrypt-generator.com/
2. Wpisz swoje hasło (np. "mojeTajneHaslo123")
3. Wybierz **Rounds: 10**
4. Kliknij **Generate Hash**
5. Skopiuj wygenerowany hash (zaczyna się od `$2a$10$...`)
6. Wklej go do pola `password_hash` w Supabase

**Metoda 2: Użyj Node.js w terminalu**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('mojeTajneHaslo123', 10).then(h => console.log(h));"
```

## Krok 3: Zweryfikuj instalację

1. Uruchom aplikację: `npm run dev`
2. Otwórz http://localhost:3000
3. Zaloguj się używając swoich danych
4. Sprawdź czy dashboard się wyświetla

## Struktura bazy danych

Aplikacja używa następujących tabel:

- **users** - Użytkownicy systemu (pracownicy)
- **clients** - Klienci firmy ubezpieczeniowej
- **cases** - Sprawy klientów
- **documents** - Dokumenty przypisane do spraw/klientów
- **insurance_companies** - Firmy ubezpieczeniowe
- **case_statuses** - Statusy spraw (Nowa, W trakcie, Zakończona)
- **document_categories** - Kategorie dokumentów

## Zabezpieczenia

Wszystkie tabele mają włączone **Row Level Security (RLS)**. Oznacza to, że:
- Tylko zalogowani użytkownicy mogą odczytywać dane
- Dane są chronione przed nieautoryzowanym dostępem
- Każda operacja jest sprawdzana przez polityki bezpieczeństwa

## Troubleshooting

### Błąd "relation does not exist"
Tabele nie zostały utworzone. Wykonaj Krok 1 ponownie.

### Nie mogę się zalogować
- Sprawdź czy użytkownik istnieje w tabeli `users`
- Sprawdź czy pole `is_active` ma wartość `true`
- Sprawdź czy `password_hash` jest prawidłowy (musi być hash bcrypt, nie czyste hasło)

### Błąd "Failed to fetch dashboard stats"
To normalne gdy baza jest pusta. Dashboard pokaże zera.
