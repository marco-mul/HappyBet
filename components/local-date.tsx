"use client";

type Props = {
  isoString: string;
  options: Intl.DateTimeFormatOptions;
  locale?: string;
};

export function LocalDate({ isoString, options, locale = "en-GB" }: Props) {
  return <>{new Date(isoString).toLocaleDateString(locale, options)}</>;
}
