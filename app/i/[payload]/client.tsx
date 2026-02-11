'use client';

import { useState, useEffect } from 'react';
import { decodePayload } from '@/lib/payload';
import { verifyInvoiceSignature } from '@/lib/signature';
import { type InvoicePayload } from '@/lib/validation';
import { InvoiceCard } from '@/components/InvoiceCard';
import { PayButton } from '@/components/PayButton';
import { VerificationBadge } from '@/components/VerificationBadge';
import { WarningBanner } from '@/components/WarningBanner';

interface InvoicePageClientProps {
  encodedPayload: string;
}

type VerificationState =
  | { status: 'loading' }
  | { status: 'verified'; label: string }
  | { status: 'invalid' }
  | { status: 'unverified-label'; label: string }
  | { status: 'unsigned' };

export function InvoicePageClient({ encodedPayload }: InvoicePageClientProps) {
  const [payload, setPayload] = useState<InvoicePayload | null>(null);
  const [decodeError, setDecodeError] = useState(false);
  const [verification, setVerification] = useState<VerificationState>({ status: 'loading' });

  useEffect(() => {
    const data = decodePayload(encodedPayload);
    if (!data) {
      setDecodeError(true);
      return;
    }
    setPayload(data);

    if (data.issuer && data.sig) {
      verifyInvoiceSignature(data).then((isValid) => {
        if (isValid) {
          setVerification({
            status: 'verified',
            label: data.label || data.issuer!.slice(0, 10) + '...',
          });
        } else {
          setVerification({ status: 'invalid' });
        }
      });
    } else if (data.label) {
      setVerification({ status: 'unverified-label', label: data.label });
    } else {
      setVerification({ status: 'unsigned' });
    }
  }, [encodedPayload]);

  if (decodeError) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Invalid Invoice</h1>
        <p className="text-gray-400">
          This invoice link appears corrupted. Ask the sender for a new link.
        </p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-brand-green" />
      </div>
    );
  }

  const isExpired = payload.expiresAt ? Date.now() / 1000 > payload.expiresAt : false;
  const isSignatureInvalid = verification.status === 'invalid';
  const payDisabled = isExpired || isSignatureInvalid;

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/i/${encodedPayload}`
    : `https://instantinvoice.xyz/i/${encodedPayload}`;

  const verificationBadge =
    verification.status === 'loading' ? null : (
      <VerificationBadge
        state={
          verification.status === 'verified'
            ? { status: 'verified', label: verification.label }
            : verification.status === 'invalid'
              ? { status: 'invalid' }
              : verification.status === 'unverified-label'
                ? { status: 'unverified-label', label: verification.label }
                : { status: 'unsigned' }
        }
      />
    );

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Instant Invoice</h1>
      </div>

      {isExpired && (
        <WarningBanner variant="red">This invoice has expired</WarningBanner>
      )}

      {isSignatureInvalid && (
        <WarningBanner variant="red">
          Signature invalid — do not pay this invoice
        </WarningBanner>
      )}

      {!payload.issuer && !payload.sig && (
        <WarningBanner variant="amber">
          Unverified invoice — verify recipient and amount before paying
        </WarningBanner>
      )}

      <InvoiceCard
        payload={payload}
        url={url}
        verificationBadge={verificationBadge}
      >
        <PayButton payload={payload} disabled={payDisabled} />
      </InvoiceCard>
    </div>
  );
}
