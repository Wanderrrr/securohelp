# Securo Help - Instrukcja Konfiguracji

## Krok 1: Konfiguracja bazy danych Supabase

1. Przejdź do Supabase Dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Otwórz **SQL Editor**
3. Skopiuj i wklej cała zawartość pliku `supabase-migration.sql`
4. Wykonaj SQL (kliknij "RUN")

## Krok 2: Konfiguracja Autentykacji Supabase

1. W Supabase Dashboard przejdź do **Authentication** > **Providers**
2. Włącz **Email** provider
3. W **Authentication** > **Settings**:
   - Wyłącz **Email Confirmations** (Disable email confirmations)
   - Włącz **Enable email signup**

## Krok 3: Utworzenie pierwszego użytkownika

1. W Supabase Dashboard przejdź do **Authentication** > **Users**
2. Kliknij **Add user** > **Create new user**
3. Wprowadź:
   - Email: twój@email.com
   - Password: (wybierz silne hasło)
   - User Metadata:
     ```json
     {
       "first_name": "Admin",
       "last_name": "User",
       "role": "ADMIN"
     }
     ```
4. Kliknij **Create user**

## Krok 4: Uruchomienie aplikacji

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## Krok 5: Logowanie

Użyj utworzonego wcześniej email i hasła.

## Uwaga

- Wszystkie dane są bezpiecznie przechowywane w Supabase
- RLS (Row Level Security) jest włączony na wszystkich tabelach
- Pliki dokumentów są przechowywane lokalnie w folderze `public/uploads/`
