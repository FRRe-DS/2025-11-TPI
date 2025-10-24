'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  iso?: string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

export default function ClientFormattedDate({
  iso,
  locale = 'es-AR',
  options,
}: Props) {
  const [text, setText] = useState<string>(iso || '');

  useEffect(() => {
    if (!iso) return setText('');
    try {
      const d = new Date(iso);
      const df = new Intl.DateTimeFormat(locale, options);
      setText(df.format(d));
    } catch (e) {
      setText(iso);
    }
  }, [iso, locale, JSON.stringify(options)]);

  return <span suppressHydrationWarning>{text}</span>;
}
