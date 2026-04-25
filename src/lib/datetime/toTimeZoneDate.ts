const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timezone: string) {
  const existingFormatter = dateTimeFormatters.get(timezone);

  if (existingFormatter) {
    return existingFormatter;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    year: "numeric",
  });

  dateTimeFormatters.set(timezone, formatter);
  return formatter;
}

export function toTimeZoneDate(date: Date, timezone: string) {
  const parts = getFormatter(timezone).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return new Date(
    values.year,
    values.month - 1,
    values.day,
    values.hour === 24 ? 0 : values.hour,
    values.minute,
    values.second,
  );
}
