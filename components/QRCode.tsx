'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  return (
    <div className="inline-block rounded-lg bg-white p-3">
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#000000"
        aria-label={`QR code for invoice link: ${value}`}
      />
    </div>
  );
}
