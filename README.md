# SecuroHelp - System Zarządzania Sprawami Ubezpieczeniowymi

## Opis
Aplikacja Next.js do zarządzania sprawami ubezpieczeniowymi, klientami i dokumentami. System umożliwia generowanie dokumentów AI na podstawie analizy kosztorysów towarzystw ubezpieczeniowych.

## Wymagania
- Node.js 18+ 
- PostgreSQL
- OpenAI API Key

## Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Skonfiguruj bazę danych PostgreSQL i dodaj URL do `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/securohelp"
```

3. Dodaj klucz OpenAI API do `.env.local`:
```bash
OPENAI_API_KEY="your-openai-api-key"
```

4. Uruchom migracje Prisma:
```bash
npx prisma migrate dev
```

5. Uruchom serwer deweloperski:
```bash
npm run dev
```

## Funkcje
- Zarządzanie klientami i sprawami
- Upload i przeglądanie dokumentów
- Generowanie dokumentów AI (analiza kosztorysów, odwołania)
- System autoryzacji
- Dashboard z statystykami

## Struktura projektu
- `app/` - Next.js App Router
- `src/components/` - Komponenty React
- `src/lib/` - Biblioteki pomocnicze
- `prisma/` - Schema bazy danych

## API Endpoints
- `/api/clients` - Zarządzanie klientami
- `/api/cases` - Zarządzanie sprawami  
- `/api/documents` - Upload i pobieranie dokumentów
- `/api/ai-documents` - Generowanie dokumentów AI

## Deployment
Aplikacja jest skonfigurowana dla deploymentu na Bolt z `output: 'standalone'` w `next.config.ts`.