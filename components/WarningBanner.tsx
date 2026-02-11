'use client';

interface WarningBannerProps {
  variant: 'green' | 'amber' | 'red';
  children: React.ReactNode;
}

const styles = {
  green: 'bg-green-900/30 border-green-700 text-green-300',
  amber: 'bg-amber-900/30 border-amber-700 text-amber-300',
  red: 'bg-red-900/30 border-red-700 text-red-300',
};

export function WarningBanner({ variant, children }: WarningBannerProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
      role="alert"
    >
      {children}
    </div>
  );
}
