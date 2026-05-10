export type PermitStatus = 'Pending' | 'Approved' | 'Delayed' | 'Rejected' | 'Expired';

export interface PermitNote {
  id: string;
  permit_id: string;
  content: string;
  created_at: string;
  created_by: string;
}

export interface Permit {
  id: string;
  permit_number: string;
  city_county: string;
  status: PermitStatus;
  date_submitted: string;
  expiration_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  notes?: PermitNote[];
}