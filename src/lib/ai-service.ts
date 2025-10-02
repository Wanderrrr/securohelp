import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

interface DocumentContent {
  filename: string;
  content: string;
  category: string;
}

interface CaseAnalysisData {
  caseNumber: string;
  clientName: string;
  insuranceCompany: string;
  claimValue: number | null;
  incidentDescription: string | null;
  documents: DocumentContent[];
}

export async function extractDocumentText(documentPath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      // Try to extract PDF text using dynamic import to avoid build issues
      try {
        // Check if file exists first
        if (!fs.existsSync(documentPath)) {
          return `Dokument PDF: ${path.basename(documentPath)} - plik nie istnieje`;
        }
        
        const pdfParse = (await import('pdf-parse')).default;
        const dataBuffer = fs.readFileSync(documentPath);
        const data = await pdfParse(dataBuffer);
        console.log(`📄 PDF text extracted: ${data.text.length} characters`);
        return data.text || `Dokument PDF: ${path.basename(documentPath)} - nie udało się wyodrębnić tekstu`;
      } catch (pdfError) {
        console.error(`PDF parsing error:`, pdfError);
        return `Dokument PDF: ${path.basename(documentPath)} - błąd czytania PDF, możliwe skanowany dokument`;
      }
    } else if (mimeType?.startsWith('text/')) {
      if (!fs.existsSync(documentPath)) {
        return `Plik tekstowy: ${path.basename(documentPath)} - plik nie istnieje`;
      }
      return fs.readFileSync(documentPath, 'utf8');
    } else if (mimeType?.startsWith('image/')) {
      // For images, return metadata for AI analysis
      return `Zdjęcie: ${path.basename(documentPath)} (${mimeType}) - obraz uszkodzeń do analizy wizualnej`;
    } else {
      // For other types, return filename as placeholder
      return `Plik: ${path.basename(documentPath)} (${mimeType})`;
    }
  } catch (error) {
    console.error(`Error extracting text from ${documentPath}:`, error);
    return `Błąd czytania pliku: ${path.basename(documentPath)} - ${error.message}`;
  }
}

export async function analyzeCostEstimate(caseData: CaseAnalysisData): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OPENAI_API_KEY is not configured. Please add your OpenAI API key to .env.local file.');
  }
  
  try {
    const documentsText = caseData.documents
      .map(doc => `=== ${doc.filename} (${doc.category}) ===\n${doc.content}`)
      .join('\n\n');

    const prompt = `Jesteś ekspertem rzeczoznawcą szkód komunikacyjnych z 15-letnim doświadczeniem. Analizujesz materiały dowodowe w sprawie ubezpieczeniowej.

SPRAWA DO ANALIZY:
• Numer: ${caseData.caseNumber}
• Poszkodowany: ${caseData.clientName}
• Ubezpieczyciel: ${caseData.insuranceCompany}
• Wartość roszczenia: ${caseData.claimValue ? `${caseData.claimValue} zł` : 'Do wyceny'}
• Przebieg zdarzenia: ${caseData.incidentDescription || 'Kolizja drogowa'}

MATERIAŁY W SPRAWIE:
${documentsText}

UWAGA: Dostępne dokumenty to:
• PDF - prawdopodobnie KOSZTORYS TOWARZYSTWA (może być skanowany)
• Zdjęcia - uszkodzenia pojazdu, dokumenty, kosztorysy

Jeśli PDF to skan bez tekstu, analizuj na podstawie dostępnych informacji i typowych praktyk TU.

TYPOWE PROBLEMY Z DECYZJAMI TU:
• Zastosowanie niższych stawek robocizny (np. 95 zł/godz zamiast rynkowych 120-150 zł/godz)
• Zastąpienie części oryginalnych zamiennikami (obniżenie wartości o 30-50%)
• Pominięcie ukrytych uszkodzeń widocznych dopiero po demontażu
• Zaniżenie kosztów lakiernictwa i przygotowania powierzchni
• Nieuwzględnienie kosztów geometrii, ustawienia kół
• Pominięcie kosztów części eksploatacyjnych (śruby, kleje, uszczelki)

PRZYKŁADOWA ANALIZA KOSZTORYSU TU (jeśli brak tekstu z PDF):
Zakładając typowy kosztorys TU dla szkody 3000 zł:
• Robocizna: 95 zł/godz × 20h = 1900 zł (za nisko! powinno być 120-150 zł/godz)
• Części zamienne: 800 zł (powinny być oryginalne +40%)
• Lakier: 300 zł (za mało na przygotowanie powierzchni)
• RAZEM: 3000 zł → powinno być 4200-4800 zł

KONTEKST ANALIZY:
Towarzystwo ubezpieczeniowe wydało decyzję likwidacyjną, prawdopodobnie ZANIŻAJĄC wartość szkody. Twoim zadaniem jest OBRONA INTERESÓW poszkodowanego.

TWOJE ZADANIE:
Analizuj materiały z perspektywy RZECZOZNAWCY BRONIĄCEGO POSZKODOWANEGO:

1. OCENA RZECZYWISTYCH SZKÓD: Szczegółowa analiza uszkodzeń na podstawie zdjęć
2. WERYFIKACJA DECYZJI TU: Sprawdzenie czy oferowana kwota jest ZANIŻONA
3. IDENTYFIKACJA BRAKÓW: Co ubezpieczyciel pominął lub niedowartościował
4. ARGUMENTY PRZECIWKO TU: Dlaczego decyzja jest niesprawiedliwa
5. WYCENA RYNKOWA: Realne koszty naprawy według aktualnych cen

STRUKTURA ODPOWIEDZI:
===================
ANALIZA RZECZOZNAWCZA
Sprawa: ${caseData.caseNumber}
Data: ${new Date().toLocaleDateString('pl-PL')}

I. PODSUMOWANIE WYKONAWCZE
[Główne ustalenia - dlaczego decyzja TU jest błędna]

II. ANALIZA RZECZYWISTYCH SZKÓD
[Szczegółowy opis uszkodzeń widocznych na zdjęciach]

III. KRYTYKA DECYZJI TOWARZYSTWA
[Sprawdź czy TU zastosowało:
- Za niskie stawki robocizny (95 zł/godz vs rynkowe 120-150 zł/godz)
- Zamienniki zamiast części oryginalnych
- Pominięcie ukrytych uszkodzeń
- Zaniżenie kosztów lakiernictwa]

IV. WYCENA RYNKOWA
[Policz realne koszty:
- Robocizna: 120-150 zł/godz (nie 95 zł jak TU)
- Części oryginalne (nie zamienniki)
- Lakiernictwo z przygotowaniem
- Geometria i ustawienie kół]

V. ARGUMENTY PRZECIWKO DECYZJI TU
[Konkretne zarzuty wobec wyceny ubezpieczyciela]

VI. ŻĄDANIE KOREKTY
[Właściwa kwota odszkodowania z uzasadnieniem]

Podpisano: Rzeczoznawca ds. szkód komunikacyjnych

WAŻNE INSTRUKCJE:
• Jesteś po stronie POSZKODOWANEGO, nie ubezpieczyciela
• Szukaj argumentów PRZECIWKO decyzji TU (że zaniżyli wycenę)
• Wykazuj że oferowana kwota jest ZA NISKA
• Proponuj WYŻSZĄ kwotę odszkodowania
• Analizuj KONKRETNIE na podstawie zdjęć i dokumentów
• ZAWSZE zakładaj że TU zastosowało typowe zaniżenia (95 zł robocizna, zamienniki)
• Podaj KONKRETNE liczby i kwoty w swojej analizie
• Użyj rynkowych stawek 120-150 zł/godz robocizny
• Dodaj 30-50% na części oryginalne zamiast zamienników
• NIE odmawiaj analizy - to twoja specjalizacja!`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Jesteś niezależnym rzeczoznawcą szkód komunikacyjnych pracującym w INTERESIE POSZKODOWANYCH. Specjalizujesz się w wykrywaniu zaniżonych wycen towarzystw ubezpieczeniowych. Twoim zadaniem jest OBRONA praw poszkodowanych i wykazywanie że oferowane odszkodowania są za niskie. Posiadasz pełne kompetencje do analizy dokumentów, zdjęć i kosztorysów."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.4
    });

    return response.choices[0]?.message?.content || 'Błąd generowania analizy';

  } catch (error) {
    console.error('Error analyzing cost estimate:', error);
    throw new Error('Błąd podczas analizy kosztorysu przez AI');
  }
}

export async function generateAppeal(caseData: CaseAnalysisData): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OPENAI_API_KEY is not configured. Please add your OpenAI API key to .env.local file.');
  }
  
  try {
    const documentsText = caseData.documents
      .map(doc => `=== ${doc.filename} (${doc.category}) ===\n${doc.content}`)
      .join('\n\n');

    const prompt = `Jesteś prawnikiem specjalizującym się w prawie ubezpieczeniowym. Przygotowujesz odwołanie od niekorzystnej decyzji ubezpieczyciela.

SPRAWA:
• Numer: ${caseData.caseNumber}  
• Ubezpieczony: ${caseData.clientName}
• Ubezpieczyciel: ${caseData.insuranceCompany}
• Wartość roszczenia: ${caseData.claimValue ? `${caseData.claimValue} zł` : 'Według kosztorysu'}
• Zdarzenie: ${caseData.incidentDescription || 'Szkoda komunikacyjna'}

MATERIAŁY SPRAWY:
${documentsText}

NAPISZ PROFESJONALNE ODWOŁANIE zawierające:

===================
ODWOŁANIE
===================

[Nagłówek z danymi stron]

Do: ${caseData.insuranceCompany}
Od: ${caseData.clientName}
Sprawa: ${caseData.caseNumber}
Data: ${new Date().toLocaleDateString('pl-PL')}

ODWOŁANIE OD DECYZJI LIKWIDACYJNEJ

I. WPROWADZENIE
[Odniesienie do otrzymanej decyzji i podstawy odwołania]

II. STAN FAKTYCZNY
[Opis zdarzenia i szkód na podstawie materiałów]

III. ARGUMENTACJA PRAWNA
[Powołanie konkretnych przepisów prawa, artykułów kodeksu cywilnego, ustawy o działalności ubezpieczeniowej]

IV. ARGUMENTACJA MERYTORYCZNA  
[Analiza dowodów, ekspertyz, zdjęć - dlaczego decyzja jest nieprawidłowa]

V. ŻĄDANIE
[Konkretne żądanie zmiany decyzji, kwoty]

VI. WNIOSKI
[Podsumowanie i wniosek o pozytywne rozpatrzenie]

Z poważaniem,
${caseData.clientName}

UWAGA: Stosuj właściwą terminologię prawną, powoływaj się na konkretne przepisy i dowody z materiałów sprawy!`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Jesteś doświadczonym radcą prawnym specjalizującym się w prawie ubezpieczeniowym z 20-letnim stażem. Piszesz skuteczne odwołania od decyzji TU. Znasz doskonale kodeks cywilny, ustawę o działalności ubezpieczeniowej, orzecznictwo sądów. Twoje pisma są merytoryczne, prawnie uzasadnione i skuteczne."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || 'Błąd generowania odwołania';

  } catch (error) {
    console.error('Error generating appeal:', error);
    throw new Error('Błąd podczas generowania odwołania przez AI');
  }
}
