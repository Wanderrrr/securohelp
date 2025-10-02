# 🚀 Szybki Start - Securo Help

## ✅ Status
Aplikacja jest gotowa do uruchomienia! Serwer dev działa na http://localhost:3000

## 📋 Przed rozpoczęciem

Masz dostęp do Supabase pod adresem:
- **URL**: https://0ec90b57d6e95fcbda19832f.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f

## 🎯 Krok po kroku (5 minut)

### 1. Utwórz bazę danych (2 min)

1. Otwórz [Supabase Dashboard](https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f)
2. W menu po lewej stronie kliknij **SQL Editor**
3. Kliknij **+ New query**
4. Otwórz plik `supabase-migration.sql` z tego projektu
5. Skopiuj całą zawartość i wklej do SQL Editor
6. Kliknij **RUN** (lub Ctrl+Enter)
7. Poczekaj na komunikat "Success"

### 2. Skonfiguruj autentykację (1 min)

1. W Supabase Dashboard przejdź do **Authentication** (ikona klucza w menu)
2. Kliknij zakładkę **Providers**
3. Znajdź **Email** i upewnij się że jest włączony (toggle na zielono)
4. Kliknij **URL Configuration** na dole strony
5. W **Site URL** wpisz: `http://localhost:3000`
6. Kliknij **Save**

### 3. Utwórz konto administratora (2 min)

1. W Supabase Dashboard przejdź do **Authentication** > **Users**
2. Kliknij **Add user** > **Create new user**
3. Wypełnij formularz:
   ```
   Email: admin@securohelp.pl
   Password: Admin123!
   Auto Confirm User: ✓ (zaznacz)
   ```
4. Kliknij **User Metadata** i dodaj:
   ```json
   {
     "first_name": "Admin",
     "last_name": "Kowalski",
     "role": "ADMIN"
   }
   ```
5. Kliknij **Create user**

### 4. Aplikacja już działa!

Aplikacja jest uruchomiona na: **http://localhost:3000**

**Dane do logowania:**
- Email: `admin@securohelp.pl`
- Hasło: `Admin123!`

## 🎉 Gotowe!

Zaloguj się i zacznij korzystać z aplikacji.

## 🐛 Problemy?

### Aplikacja nie działa
```bash
# Zrestartuj serwer
npm run dev
```

### Nie mogę się zalogować
- Sprawdź czy wykonałeś krok 1 (migracja SQL)
- Sprawdź czy użytkownik ma wypełnione User Metadata (krok 3)
- Spróbuj utworzyć użytkownika ponownie

### Błąd połączenia z bazą
- Sprawdź plik `.env` - powinien zawierać:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```

### Inne problemy
Przeczytaj szczegółowe instrukcje w pliku `SETUP_INSTRUCTIONS.md`

## 📚 Dalsze kroki

Po zalogowaniu możesz:
1. Dodać klientów
2. Utworzyć sprawy
3. Przesłać dokumenty
4. Zarządzać statusami spraw

Powodzenia! 🚀
