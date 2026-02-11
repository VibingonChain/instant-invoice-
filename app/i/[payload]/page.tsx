import type { Metadata } from 'next';
import { decodePayload } from '@/lib/payload';
import { InvoicePageClient } from './client';

export const dynamic = 'force-dynamic';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export async function generateMetadata({
  params,
}: {
  params: { payload: string };
}): Promise<Metadata> {
  const data = decodePayload(params.payload);

  if (!data) {
    return { title: 'Instant Invoice' };
  }

  const title = `Invoice: ${data.amount} USDC on ${capitalize(data.chain)}`;
  const description = data.memo || `Pay ${data.amount} USDC to ${truncateAddress(data.to)}`;
  const url = `https://instantinvoice.xyz/i/${params.payload}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Instant Invoice',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function InvoicePage({
  params,
}: {
  params: { payload: string };
}) {
  return <InvoicePageClient encodedPayload={params.payload} />;
}
