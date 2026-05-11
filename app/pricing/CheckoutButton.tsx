'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface CheckoutButtonProps {
  priceId: string;
  highlighted: boolean;
  children: React.ReactNode;
}

export function CheckoutButton({ priceId, highlighted, children }: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        alert(error ?? 'Something went wrong. Please try again.');
        return;
      }

      const { url } = await res.json();
      window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
        highlighted
          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
          : 'bg-slate-900 hover:bg-slate-700 text-white'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
