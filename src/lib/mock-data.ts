export interface MockClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  pesel: string | null;
  id_number: string | null;
  street: string | null;
  house_number: string | null;
  apartment_number: string | null;
  postal_code: string | null;
  city: string;
  notes: string | null;
  gdpr_consent: boolean;
  gdpr_consent_date: string | null;
  marketing_consent: boolean;
  assigned_agent_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MockCase {
  id: string;
  case_number: string;
  client_id: string;
  insurance_company_id: string | null;
  accident_date: string;
  accident_description: string;
  status_id: string;
  assigned_agent_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MockDocument {
  id: string;
  case_id: string | null;
  client_id: string | null;
  category_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MockInsuranceCompany {
  id: string;
  name: string;
  short_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockCaseStatus {
  id: string;
  name: string;
  description: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockDocumentCategory {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const mockClients: MockClient[] = [];
const mockCases: MockCase[] = [];
const mockDocuments: MockDocument[] = [];

const mockInsuranceCompanies: MockInsuranceCompany[] = [
  {
    id: '1',
    name: 'PZU S.A.',
    short_name: 'PZU',
    contact_email: 'kontakt@pzu.pl',
    contact_phone: '+48 22 566 56 56',
    street: 'al. Jana Pawła II',
    house_number: '24',
    postal_code: '00-133',
    city: 'Warszawa',
    notes: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Warta S.A.',
    short_name: 'Warta',
    contact_email: 'info@warta.pl',
    contact_phone: '+48 22 543 00 00',
    street: null,
    house_number: null,
    postal_code: null,
    city: null,
    notes: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockCaseStatuses: MockCaseStatus[] = [
  {
    id: '1',
    name: 'Nowa',
    description: 'Sprawa została założona',
    color: '#3b82f6',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'W trakcie',
    description: 'Sprawa jest w trakcie realizacji',
    color: '#f59e0b',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Zakończona',
    description: 'Sprawa została zakończona',
    color: '#10b981',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockDocumentCategories: MockDocumentCategory[] = [
  {
    id: '1',
    name: 'Dokumenty tożsamości',
    description: 'Dowody osobiste, paszporty',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dokumenty medyczne',
    description: 'Zaświadczenia lekarskie, karty informacyjne',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Dokumenty pojazdu',
    description: 'Dowód rejestracyjny, polisa',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const mockDataStore = {
  clients: {
    getAll: () => mockClients.filter(c => !c.deleted_at),
    getById: (id: string) => mockClients.find(c => c.id === id && !c.deleted_at),
    create: (data: Omit<MockClient, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const newClient: MockClient = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      mockClients.push(newClient);
      return newClient;
    },
    update: (id: string, data: Partial<MockClient>) => {
      const index = mockClients.findIndex(c => c.id === id);
      if (index === -1) return null;
      mockClients[index] = {
        ...mockClients[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return mockClients[index];
    },
    delete: (id: string) => {
      const index = mockClients.findIndex(c => c.id === id);
      if (index === -1) return false;
      mockClients[index].deleted_at = new Date().toISOString();
      return true;
    },
  },
  cases: {
    getAll: () => mockCases.filter(c => !c.deleted_at),
    getById: (id: string) => mockCases.find(c => c.id === id && !c.deleted_at),
    create: (data: Omit<MockCase, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const newCase: MockCase = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      mockCases.push(newCase);
      return newCase;
    },
    update: (id: string, data: Partial<MockCase>) => {
      const index = mockCases.findIndex(c => c.id === id);
      if (index === -1) return null;
      mockCases[index] = {
        ...mockCases[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return mockCases[index];
    },
    delete: (id: string) => {
      const index = mockCases.findIndex(c => c.id === id);
      if (index === -1) return false;
      mockCases[index].deleted_at = new Date().toISOString();
      return true;
    },
  },
  documents: {
    getAll: () => mockDocuments.filter(d => !d.deleted_at),
    getById: (id: string) => mockDocuments.find(d => d.id === id && !d.deleted_at),
    getByCaseId: (caseId: string) => mockDocuments.filter(d => d.case_id === caseId && !d.deleted_at),
    getByClientId: (clientId: string) => mockDocuments.filter(d => d.client_id === clientId && !d.deleted_at),
    create: (data: Omit<MockDocument, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const newDocument: MockDocument = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      mockDocuments.push(newDocument);
      return newDocument;
    },
    delete: (id: string) => {
      const index = mockDocuments.findIndex(d => d.id === id);
      if (index === -1) return false;
      mockDocuments[index].deleted_at = new Date().toISOString();
      return true;
    },
  },
  insuranceCompanies: {
    getAll: () => mockInsuranceCompanies.filter(ic => ic.is_active),
    getById: (id: string) => mockInsuranceCompanies.find(ic => ic.id === id),
  },
  caseStatuses: {
    getAll: () => mockCaseStatuses.filter(cs => cs.is_active),
    getById: (id: string) => mockCaseStatuses.find(cs => cs.id === id),
  },
  documentCategories: {
    getAll: () => mockDocumentCategories.filter(dc => dc.is_active),
    getById: (id: string) => mockDocumentCategories.find(dc => dc.id === id),
  },
};
