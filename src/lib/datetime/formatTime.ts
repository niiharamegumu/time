function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function formatTime(date: Date) {
  return [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(" : ");
}
