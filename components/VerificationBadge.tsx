'use client';

type VerificationState =
  | { status: 'verified'; label: string }
  | { status: 'invalid' }
  | { status: 'unverified-label'; label: string }
  | { status: 'unsigned' };

interface VerificationBadgeProps {
  state: VerificationState;
}

export function VerificationBadge({ state }: VerificationBadgeProps) {
  switch (state.status) {
    case 'verified':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-900/30 px-3 py-1 text-sm font-medium text-green-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Verified invoice from {state.label}
        </div>
      );
    case 'invalid':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-900/30 px-3 py-1 text-sm font-medium text-red-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Signature invalid — do not pay
        </div>
      );
    case 'unverified-label':
      return (
        <span className="text-sm text-gray-500">
          {state.label} <span className="italic">(unverified)</span>
        </span>
      );
    case 'unsigned':
      return null;
  }
}
