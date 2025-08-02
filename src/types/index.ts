// Chat related types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isRateResponse?: boolean;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// Rate related types
export interface PortInfo {
  port_name: string;
  port_code: string;
  country: string;
  region: string;
}

export interface ContainerDetails {
  type: string;
  description: string;
  dimensions: string;
  payload: string;
  volume: string;
}

export interface RateBreakdown {
  ocean_freight: number;
  baf: number;
  caf: number;
  thc_origin: number;
  thc_destination: number;
  documentation: number;
  total_usd: number;
}

export interface VesselDetails {
  vessel_name: string;
  voyage: string;
  imo_number: string;
  flag: string;
}

export interface CarrierDetails {
  name: string;
  code: string;
  alliance: string;
  website: string;
}

export interface Schedule {
  departure_date: string;
  arrival_date: string;
  cutoff_date: string;
  frequency: string;
}

export interface Validity {
  valid_from: string;
  valid_until: string;
  rate_type: string;
}

export interface Rate {
  quote_id: string;
  origin: string;
  origin_code?: string;
  destination: string;
  destination_code?: string;
  container_type: string;
  container_description?: string;
  spot_rate_usd: number;
  total_rate_usd: number;
  transit_days: number;
  service_level: string;
  vessel_name: string;
  voyage?: string;
  carrier: string;
  carrier_name?: string;
  alliance?: string;
  departure_date: string;
  arrival_date: string;
  cutoff_date?: string;
  frequency?: string;
  validity_until?: string;
  rate_type?: string;
  preferred: boolean;
  booking_terms?: string;
  free_days?: number;
  detention_per_day?: number;
  includes_trucking?: boolean;
}

export interface RateResponse {
  rates: Rate[];
  message: string;
  total_options: number;
  search_criteria?: {
    origin?: string;
    destination?: string;
    container_type?: string;
  };
  available_origins?: string[];
  available_destinations?: string[];
}

// API Response types
export interface ChatResponse {
  agent_response: string;
  session_id: string;
  error?: string;
  success: boolean;
}

export interface SessionHistoryResponse {
  session_id: string;
  history: Array<{
    user_message: string;
    assistant_response: string;
    timestamp: string;
  }>;
  total_messages: number;
}

// Search filters
export interface SearchFilters {
  origin?: string;
  destination?: string;
  container_type?: string;
}

// Quotation related
export interface QuotationRequest {
  client_name: string;
  client_email: string;
  rate: Rate;
}
