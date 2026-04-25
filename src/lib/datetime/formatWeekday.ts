const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

export function formatWeekday(date: Date) {
  return weekdayFormatter.format(date);
}
