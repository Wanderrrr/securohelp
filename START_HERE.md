# 🎯 START TUTAJ - Securo Help

## 📍 Gdzie jesteś

Masz gotowy projekt **Securo Help** - system zarządzania kancelarią prawniczą.

## ✅ Co już działa

- ✅ Aplikacja Next.js uruchomiona na http://localhost:3000
- ✅ Build projektu bez błędów
- ✅ Integracja z Supabase gotowa
- ✅ Wszystkie komponenty UI działają
- ✅ Autentykacja skonfigurowana

## ⚠️ Co musisz zrobić (TYLKO RAZ)

Aby móc się zalogować, musisz:

### 1️⃣ Utworzyć bazę danych (2 minuty)

Otwórz w przeglądarce:
```
https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/editor
```

1. Kliknij **SQL Editor** w lewym menu
2. Kliknij **+ New query**
3. Otwórz plik `supabase-migration.sql` z tego folderu
4. Skopiuj całą zawartość i wklej do edytora
5. Kliknij **RUN** (lub Ctrl+Enter)
6. Poczekaj aż zobaczysz "Success. No rows returned"

### 2️⃣ Utworzyć użytkownika (1 minuta)

W tym samym dashboardzie Supabase:

1. Kliknij **Authentication** w lewym menu (ikona klucza 🔑)
2. Zakładka **Users**
3. Kliknij **Add user** → **Create new user**
4. Wypełnij:
   - **Email**: `admin@securohelp.pl`
   - **Password**: `Admin123!`
   - **Auto Confirm User**: ✅ (zaznacz!)
5. Rozwiń **User Metadata** i wpisz:
   ```json
   {
     "first_name": "Admin",
     "last_name": "User",
     "role": "ADMIN"
   }
   ```
6. Kliknij **Create user**

## 🚀 Zaloguj się

1. Otwórz http://localhost:3000
2. Zaloguj się:
   - Email: `admin@securohelp.pl`
   - Hasło: `Admin123!`

## 📁 Struktura projektu

```
/app                 - Strony Next.js i API routes
/src/components      - Komponenty React
/src/lib            - Klient Supabase i helpery
/src/contexts       - Context autentykacji
/src/types          - Typy TypeScript
```

## 🔧 Komendy

```bash
npm run dev         # Uruchom serwer dev (już działa!)
npm run build       # Zbuduj produkcyjną wersję
npm run start       # Uruchom produkcyjną wersję
```

## 📚 Więcej informacji

- `QUICKSTART.md` - Szczegółowy przewodnik
- `SETUP_INSTRUCTIONS.md` - Pełna dokumentacja
- `supabase-migration.sql` - Schema bazy danych

## ❓ Problemy?

### Nie mogę się zalogować
- Sprawdź czy wykonałeś krok 1️⃣ (SQL migration)
- Sprawdź czy użytkownik ma wypełnione User Metadata (krok 2️⃣)

### Nie widzę .env
Plik `.env` jest ukryty. Sprawdź:
```bash
cat .env
```

### Serwer nie działa
Uruchom ponownie:
```bash
npm run dev
```

## 🎉 To wszystko!

Po zalogowaniu możesz:
- ➕ Dodawać klientów
- 📋 Tworzyć sprawy
- 📄 Przesyłać dokumenty
- 📊 Przeglądać statystyki

**Powodzenia!** 🚀
