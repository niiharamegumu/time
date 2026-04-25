function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}
