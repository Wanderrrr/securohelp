import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

// For now, we'll simulate AI documents with mock data
// In production, this would connect to actual AI document generation service

interface AIDocument {
  id: string;
  caseId: string;
  type: 'cost_analysis' | 'appeal' | 'summary' | 'letter';
  title: string;
  content: string;
  status: 'generating' | 'completed' | 'error';
  createdAt: Date;
  case: {
    caseNumber: string;
    client: {
      firstName: string;
      lastName: string;
    };
  };
}

// Mock AI documents storage (in production this would be a database table)
const mockAIDocuments: AIDocument[] = [
  {
    id: 'ai-doc-1',
    caseId: 'sample-case-id',
    type: 'cost_analysis',
    title: 'Analiza kosztorysu - Sprawa SH/2024/12/00001',
    content: `ANALIZA KOSZTORYSU TOWARZYSTWA UBEZPIECZENIOWEGO

Sprawa: SH/2024/12/00001
Data analizy: ${new Date().toLocaleDateString('pl-PL')}

PODSUMOWANIE WYKONAWCZE:
Przedłożony przez Towarzystwo Ubezpieczeniowe kosztorys zawiera szereg nieprawidłowości i zaniżeń, które wymagają szczegółowego omówienia i korekty.

ANALIZA SZCZEGÓŁOWA:

1. LAKIEROWANIE
   - Kosztorys TU: 800 zł
   - Cena rynkowa: 1,200-1,500 zł
   - Różnica: -400 do -700 zł
   - Uwagi: TU zastosowało stawki sprzed 2 lat, nie uwzględniając wzrostu kosztów materiałów

2. WYMIANA ZDERZAKA
   - Kosztorys TU: 1,200 zł
   - Cena rynkowa: 1,800-2,200 zł  
   - Różnica: -600 do -1,000 zł
   - Uwagi: Nie uwzględniono kosztów demontażu i montażu elementów dodatkowych

3. ROBOCIZNA
   - Kosztorys TU: 45 zł/h
   - Stawka rynkowa: 65-85 zł/h
   - Różnica: -20 do -40 zł/h
   - Uwagi: Stawka znacznie poniżej aktualnych cen rynkowych

WNIOSKI:
Całkowita wartość naprawy według aktualnych cen rynkowych powinna wynosić 8,500-12,000 zł, podczas gdy TU wyceniło szkodę na 4,200 zł.

REKOMENDACJE:
1. Złożenie odwołania od decyzji TU
2. Załączenie kosztorysów z autoryzowanych serwisów
3. Powołanie się na aktualne cenniki części i robocizny

Przygotowane przez: System AI SecuroHelp
Data: ${new Date().toLocaleDateString('pl-PL')}`,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    case: {
      caseNumber: 'SH/2024/12/00001',
      client: {
        firstName: 'Jan',
        lastName: 'Kowalski'
      }
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock data
    // In production, this would query the AI documents table
    return NextResponse.json(mockAIDocuments);

  } catch (error) {
    console.error('AI Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, type, title, content } = await request.json();

    if (!caseId || !type) {
      return NextResponse.json(
        { error: 'Case ID and type are required' },
        { status: 400 }
      );
    }

    // Get case info
    const caseInfo = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!caseInfo) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Create new AI document (mock)
    const newDocument: AIDocument = {
      id: `ai-doc-${Date.now()}`,
      caseId,
      type: type as 'cost_analysis' | 'appeal' | 'summary' | 'letter',
      title: title || `Dokument AI - ${caseInfo.caseNumber}`,
      content: content || 'Generowanie dokumentu w toku...',
      status: 'generating',
      createdAt: new Date(),
      case: {
        caseNumber: caseInfo.caseNumber,
        client: {
          firstName: caseInfo.client.firstName,
          lastName: caseInfo.client.lastName
        }
      }
    };

    mockAIDocuments.unshift(newDocument);

    // Simulate AI generation delay
    setTimeout(() => {
      const docIndex = mockAIDocuments.findIndex(d => d.id === newDocument.id);
      if (docIndex !== -1) {
        mockAIDocuments[docIndex].status = 'completed';
        mockAIDocuments[docIndex].content = getGeneratedContent(type, caseInfo);
      }
    }, 3000);

    return NextResponse.json(newDocument, { status: 201 });

  } catch (error) {
    console.error('AI Document creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getGeneratedContent(type: string, caseInfo: { caseNumber: string; client: { firstName: string; lastName: string } }): string {
  const date = new Date().toLocaleDateString('pl-PL');
  
  switch (type) {
    case 'cost_analysis':
      return `ANALIZA KOSZTORYSU TOWARZYSTWA UBEZPIECZENIOWEGO

Sprawa: ${caseInfo.caseNumber}
Klient: ${caseInfo.client.firstName} ${caseInfo.client.lastName}
Data analizy: ${date}

PODSUMOWANIE WYKONAWCZE:
Przedłożony przez Towarzystwo Ubezpieczeniowe kosztorys zawiera szereg nieprawidłowości i znaczących zaniżeń wartości naprawy.

ANALIZA SZCZEGÓŁOWA:

1. WYCENA ROBOCIZNY
   - Kosztorys TU: 45 zł/godz.
   - Stawka rynkowa: 70-90 zł/godz.
   - Zaniżenie: 35-50%

2. WYCENA CZĘŚCI
   - Zastosowano ceny części zamiennych zamiast oryginalnych
   - Nie uwzględniono kosztów transportu i VAT
   - Zaniżenie średnio: 25-40%

3. ZAKRES NAPRAWY
   - Pominięto ukryte uszkodzenia
   - Nie uwzględniono konieczności kalibracji systemów

WNIOSKI:
Rzeczywista wartość naprawy powinna być wyższa o 40-60% od wyceny TU.

REKOMENDACJE:
1. Złożenie odwołania z właściwą argumentacją
2. Przedłożenie kosztorysów niezależnych
3. Przeprowadzenie ekspertyzy technicznej

Przygotowane przez: SecuroHelp AI
Data: ${date}`;

    case 'appeal':
      return `ODWOŁANIE OD DECYZJI TOWARZYSTWA UBEZPIECZENIOWEGO

Do: [Nazwa Towarzystwa Ubezpieczeniowego]
Od: ${caseInfo.client.firstName} ${caseInfo.client.lastName}
Sprawa: ${caseInfo.caseNumber}
Data: ${date}

Szanowni Państwo,

niniejszym wnoszę odwołanie od decyzji dotyczącej wyceny szkody w przedmiotowej sprawie.

PODSTAWY PRAWNE:
- Ustawa o działalności ubezpieczeniowej
- Kodeks Cywilny art. 822
- Ogólne Warunki Ubezpieczenia

ZARZUTY:

1. ZANIŻENIE KOSZTÓW ROBOCIZNY
Zastosowana stawka 45 zł/godz. jest znacznie poniżej aktualnych cen rynkowych (70-90 zł/godz.).

2. NIEPRAWIDŁOWA WYCENA CZĘŚCI
- Zastosowano ceny części zamiennych zamiast oryginalnych
- Pominięto koszty transportu i VAT
- Nie uwzględniono aktualnych cenników

3. NIEPEŁNY ZAKRES NAPRAWY
- Pominięto konieczne prace dodatkowe
- Nie uwzględniono kalibracji systemów bezpieczeństwa

ŻĄDANIE:
Wnoszę o ponowne rozpatrzenie sprawy i zwiększenie wysokości odszkodowania do kwoty odpowiadającej rzeczywistym kosztom naprawy.

W załączeniu przedkładam:
- Kosztorysy z autoryzowanych serwisów
- Cenniki aktualnych części
- Dokumentację fotograficzną

Pozostając w oczekiwaniu na pozytywne rozpatrzenie odwołania.

Z poważaniem,
${caseInfo.client.firstName} ${caseInfo.client.lastName}

Data: ${date}`;

    default:
      return `Wygenerowany dokument AI dla sprawy ${caseInfo.caseNumber}
      
Typ: ${type}
Data: ${date}
      
Treść zostanie uzupełniona przez system AI.`;
  }
}
