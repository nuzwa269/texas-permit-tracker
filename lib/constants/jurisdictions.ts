export interface TexasJurisdiction {
  city: string;
  department: string;
  portalUrl: string;
  phone?: string;
  notes?: string;
}

/**
 * Top-5 Texas jurisdictions with verified official building-permit portal URLs.
 * Sorted by population (largest first).
 */
export const TEXAS_JURISDICTIONS: TexasJurisdiction[] = [
  {
    city: 'Houston',
    department: 'Houston Permitting Center',
    portalUrl: 'https://www.houstonpermittingcenter.org/',
    phone: '(832) 394-8880',
    notes: 'Apply online via the Houston Permitting Center portal.',
  },
  {
    city: 'Dallas',
    department: 'Dallas Development Services',
    portalUrl: 'https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/Pages/default.aspx',
    phone: '(214) 948-4480',
    notes: 'Building Inspection & Permits — use the online ePlan portal for submittals.',
  },
  {
    city: 'Austin',
    department: 'Austin Development Services',
    portalUrl: 'https://www.austintexas.gov/department/development-services',
    phone: '(512) 978-4000',
    notes: 'Permits are managed through Austin Build + Connect (AB+C).',
  },
  {
    city: 'San Antonio',
    department: 'City of San Antonio — Development Services',
    portalUrl: 'https://www.sanantonio.gov/DSD/Permits',
    phone: '(210) 207-1111',
    notes: 'Online permit applications available via the SA ePlans system.',
  },
  {
    city: 'Fort Worth',
    department: 'Fort Worth Development Services',
    portalUrl: 'https://www.fortworthtexas.gov/departments/development-services',
    phone: '(817) 392-2222',
    notes: 'Permits submitted through MyGovernmentOnline (MGO).',
  },
];
