import { PermitCard } from '@/components/permits/PermitCard';
import { Permit } from '@/types/permit';
import { Plus, Search, Filter } from 'lucide-react';

// Mock data for demonstration - replace with actual Supabase queries
const mockPermits: Permit[] = [
  {
    id: '1',
    permit_number: 'HTX-2026-12345',
    city_county: 'Houston',
    status: 'Pending',
    date_submitted: '2026-04-15',
    expiration_date: '2026-10-15',
    created_at: '2026-04-15T10:00:00Z',
    updated_at: '2026-04-15T10:00:00Z',
    user_id: 'user-1',
    notes: [
      {
        id: 'note-1',
        permit_id: '1',
        content: 'Spoke with city inspector about zoning requirements',
        created_at: '2026-04-16T14:30:00Z',
        created_by: 'user-1',
      },
    ],
  },
  {
    id: '2',
    permit_number: 'AUS-2026-67890',
    city_county: 'Austin',
    status: 'Approved',
    date_submitted: '2026-03-20',
    expiration_date: '2026-09-20',
    created_at: '2026-03-20T09:00:00Z',
    updated_at: '2026-04-01T11:00:00Z',
    user_id: 'user-1',
    notes: [],
  },
  {
    id: '3',
    permit_number: 'DAL-2026-54321',
    city_county: 'Dallas',
    status: 'Delayed',
    date_submitted: '2026-02-10',
    expiration_date: '2026-06-10',
    created_at: '2026-02-10T08:00:00Z',
    updated_at: '2026-04-20T16:00:00Z',
    user_id: 'user-1',
    notes: [
      {
        id: 'note-2',
        permit_id: '3',
        content: 'Waiting for additional engineering documents',
        created_at: '2026-04-20T16:00:00Z',
        created_by: 'user-1',
      },
      {
        id: 'note-3',
        permit_id: '3',
        content: 'Called city office - expect 2-week delay',
        created_at: '2026-04-22T10:00:00Z',
        created_by: 'user-1',
      },
    ],
  },
  {
    id: '4',
    permit_number: 'SA-2026-98765',
    city_county: 'San Antonio',
    status: 'Pending',
    date_submitted: '2026-05-01',
    expiration_date: '2026-11-01',
    created_at: '2026-05-01T07:00:00Z',
    updated_at: '2026-05-01T07:00:00Z',
    user_id: 'user-1',
    notes: [],
  },
];

export default function DashboardPage() {
  const activePermits = mockPermits.filter(
    (permit) => permit.status !== 'Expired' && permit.status !== 'Rejected'
  );

  const stats = {
    total: activePermits.length,
    pending: activePermits.filter((p) => p.status === 'Pending').length,
    approved: activePermits.filter((p) => p.status === 'Approved').length,
    delayed: activePermits.filter((p) => p.status === 'Delayed').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900">Texas Permit Tracker</h1>
              <p className="mt-1 text-sm text-slate-600">Manage your building permits across Texas</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Permit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Total Active</div>
            <div className="text-3xl font-bold text-navy-900">{stats.total}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Delayed</div>
            <div className="text-3xl font-bold text-safety-600">{stats.delayed}</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by permit number or city..."
                className="input-field pl-10"
              />
            </div>
            <button className="btn-secondary flex items-center gap-2 whitespace-nowrap">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Permits Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-navy-900 mb-4">Active Permits</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activePermits.map((permit) => (
              <PermitCard key={permit.id} permit={permit} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {activePermits.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-slate-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No active permits</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first permit</p>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Permit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}