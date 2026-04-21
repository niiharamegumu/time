const weekdayFormatter = new Intl.DateTimeFormat("ja-JP", {
  weekday: "short",
});

export function formatWeekday(date: Date) {
  return weekdayFormatter.format(date);
}
