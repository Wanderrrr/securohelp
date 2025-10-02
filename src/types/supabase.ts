export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          role: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'ACCOUNTANT'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          role: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'ACCOUNTANT'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          role?: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'ACCOUNTANT'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          pesel: string | null
          id_number: string | null
          street: string | null
          house_number: string | null
          apartment_number: string | null
          postal_code: string | null
          city: string
          notes: string | null
          gdpr_consent: boolean
          gdpr_consent_date: string | null
          marketing_consent: boolean
          assigned_agent_id: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          pesel?: string | null
          id_number?: string | null
          street?: string | null
          house_number?: string | null
          apartment_number?: string | null
          postal_code?: string | null
          city: string
          notes?: string | null
          gdpr_consent?: boolean
          gdpr_consent_date?: string | null
          marketing_consent?: boolean
          assigned_agent_id?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          pesel?: string | null
          id_number?: string | null
          street?: string | null
          house_number?: string | null
          apartment_number?: string | null
          postal_code?: string | null
          city?: string
          notes?: string | null
          gdpr_consent?: boolean
          gdpr_consent_date?: string | null
          marketing_consent?: boolean
          assigned_agent_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
      }
      case_statuses: {
        Row: {
          id: number
          code: string
          name: string
          description: string | null
          color: string | null
          sort_order: number
          is_final: boolean
          is_active: boolean
        }
        Insert: {
          id?: number
          code: string
          name: string
          description?: string | null
          color?: string | null
          sort_order?: number
          is_final?: boolean
          is_active?: boolean
        }
        Update: {
          id?: number
          code?: string
          name?: string
          description?: string | null
          color?: string | null
          sort_order?: number
          is_final?: boolean
          is_active?: boolean
        }
      }
      insurance_companies: {
        Row: {
          id: number
          code: string
          name: string
          short_name: string | null
          nip: string | null
          address: string | null
          email: string | null
          phone: string | null
          contact_person: string | null
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          short_name?: string | null
          nip?: string | null
          address?: string | null
          email?: string | null
          phone?: string | null
          contact_person?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
          name?: string
          short_name?: string | null
          nip?: string | null
          address?: string | null
          email?: string | null
          phone?: string | null
          contact_person?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          case_number: string
          client_id: string
          insurance_company_id: number | null
          status_id: number
          assigned_agent_id: string | null
          incident_date: string
          policy_number: string | null
          claim_number: string | null
          claim_value: string | null
          compensation_received: string | null
          incident_description: string | null
          incident_location: string | null
          vehicle_brand: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: number | null
          internal_notes: string | null
          documents_sent_date: string | null
          decision_date: string | null
          appeal_date: string | null
          lawsuit_date: string | null
          closed_date: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          case_number: string
          client_id: string
          insurance_company_id?: number | null
          status_id?: number
          assigned_agent_id?: string | null
          incident_date: string
          policy_number?: string | null
          claim_number?: string | null
          claim_value?: string | null
          compensation_received?: string | null
          incident_description?: string | null
          incident_location?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          internal_notes?: string | null
          documents_sent_date?: string | null
          decision_date?: string | null
          appeal_date?: string | null
          lawsuit_date?: string | null
          closed_date?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          case_number?: string
          client_id?: string
          insurance_company_id?: number | null
          status_id?: number
          assigned_agent_id?: string | null
          incident_date?: string
          policy_number?: string | null
          claim_number?: string | null
          claim_value?: string | null
          compensation_received?: string | null
          incident_description?: string | null
          incident_location?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          internal_notes?: string | null
          documents_sent_date?: string | null
          decision_date?: string | null
          appeal_date?: string | null
          lawsuit_date?: string | null
          closed_date?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
      }
      document_categories: {
        Row: {
          id: number
          code: string
          name: string
          description: string | null
          required: boolean
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: number
          code: string
          name: string
          description?: string | null
          required?: boolean
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: number
          code?: string
          name?: string
          description?: string | null
          required?: boolean
          sort_order?: number
          is_active?: boolean
        }
      }
      documents: {
        Row: {
          id: string
          case_id: string
          client_id: string
          category_id: number
          file_name: string
          original_file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          file_hash: string | null
          description: string | null
          document_date: string | null
          ocr_processed: boolean
          ocr_text: string | null
          ocr_processed_at: string | null
          uploaded_at: string
          uploaded_by: string
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          case_id: string
          client_id: string
          category_id: number
          file_name: string
          original_file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          file_hash?: string | null
          description?: string | null
          document_date?: string | null
          ocr_processed?: boolean
          ocr_text?: string | null
          ocr_processed_at?: string | null
          uploaded_at?: string
          uploaded_by: string
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          client_id?: string
          category_id?: number
          file_name?: string
          original_file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          file_hash?: string | null
          description?: string | null
          document_date?: string | null
          ocr_processed?: boolean
          ocr_text?: string | null
          ocr_processed_at?: string | null
          uploaded_at?: string
          uploaded_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
