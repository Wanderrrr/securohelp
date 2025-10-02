import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { analyzeCostEstimate, generateAppeal, extractDocumentText } from '@/lib/ai-service';
import path from 'path';

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

    const { caseId, type } = await request.json();

    if (!caseId || !type) {
      return NextResponse.json(
        { error: 'Case ID and type are required' },
        { status: 400 }
      );
    }

    // Get case with all related data for AI analysis
    const caseInfo = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            originalFileName: true,
            mimeType: true,
            description: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        insuranceCompany: {
          select: {
            name: true,
            shortName: true
          }
        },
        status: {
          select: {
            name: true
          }
        }
      }
    });

    if (!caseInfo) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    console.log(`🤖 AI Document generation started for case ${caseInfo.caseNumber}, type: ${type}`);
    console.log(`📄 Available documents: ${caseInfo.documents.length}`);
    console.log(`🏢 Insurance company: ${caseInfo.insuranceCompany?.name || 'Not specified'}`);

    // Extract text from all documents
    const documentContents = [];
    for (const doc of caseInfo.documents) {
      try {
        const documentPath = path.join(process.cwd(), 'public', 'uploads', 'documents', doc.fileName);
        const content = await extractDocumentText(documentPath, doc.mimeType || '');
        documentContents.push({
          filename: doc.originalFileName,
          content: content,
          category: doc.category.name
        });
      } catch (error) {
        console.log(`⚠️ Could not extract text from ${doc.originalFileName}:`, error);
        // Add document as reference even if text extraction fails
        documentContents.push({
          filename: doc.originalFileName,
          content: `Dokument: ${doc.originalFileName} (${doc.category.name})${doc.description ? `\nOpis: ${doc.description}` : ''}`,
          category: doc.category.name
        });
      }
    }

    // Prepare case data for AI analysis
    const caseAnalysisData = {
      caseNumber: caseInfo.caseNumber,
      clientName: `${caseInfo.client.firstName} ${caseInfo.client.lastName}`,
      insuranceCompany: caseInfo.insuranceCompany?.name || 'Nie określono',
      claimValue: caseInfo.claimValue,
      incidentDescription: caseInfo.incidentDescription,
      documents: documentContents
    };

    // Generate AI content based on type
    let aiContent: string;
    const title = generateTitle(type, caseInfo);

    try {
      switch (type) {
        case 'cost_analysis':
          console.log(`🔍 Analyzing cost estimate with AI...`);
          aiContent = await analyzeCostEstimate(caseAnalysisData);
          break;
        case 'appeal':
          console.log(`✍️ Generating appeal with AI...`);
          aiContent = await generateAppeal(caseAnalysisData);
          break;
        default:
          aiContent = 'Nieobsługiwany typ dokumentu AI.';
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      aiContent = `Błąd podczas generowania dokumentu AI:\n\n${aiError.message}\n\nSprawdź konfigurację OpenAI API lub spróbuj ponownie później.`;
    }

    // Create the completed document
    const newDocument = {
      id: `ai-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      caseId,
      type,
      title,
      content: aiContent,
      status: 'completed',
      createdAt: new Date(),
      case: {
        caseNumber: caseInfo.caseNumber,
        client: {
          firstName: caseInfo.client.firstName,
          lastName: caseInfo.client.lastName
        }
      }
    };

    console.log(`✅ AI document generated successfully for case ${caseInfo.caseNumber}`);
    return NextResponse.json(newDocument, { status: 201 });

  } catch (error) {
    console.error('AI Document generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateTitle(type: string, caseInfo: { caseNumber: string; insuranceCompany?: { shortName?: string; name?: string } | null }): string {
  const date = new Date().toLocaleDateString('pl-PL');
  
  switch (type) {
    case 'cost_analysis':
      return `Analiza kosztorysu - ${caseInfo.caseNumber}`;
    case 'appeal':
      return `Odwołanie - ${caseInfo.caseNumber}`;
    case 'summary':
      return `Podsumowanie sprawy - ${caseInfo.caseNumber}`;
    case 'letter':
      return `Pismo do ${caseInfo.insuranceCompany?.shortName || 'TU'} - ${caseInfo.caseNumber}`;
    default:
      return `Dokument AI - ${caseInfo.caseNumber} - ${date}`;
  }
}
