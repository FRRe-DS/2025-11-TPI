'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  value: number;
  locale?: string;
  options?: Intl.NumberFormatOptions;
}

export default function ClientFormattedNumber({
  value,
  locale = 'es-ES',
  options,
}: Props) {
  const [formatted, setFormatted] = useState<string>(String(value));

  useEffect(() => {
    try {
      const nf = new Intl.NumberFormat(locale, options);
      setFormatted(nf.format(value));
    } catch (e) {
      setFormatted(String(value));
    }
  }, [value, locale, JSON.stringify(options)]);

  return <span suppressHydrationWarning>{formatted}</span>;
}
