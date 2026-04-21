function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`;
}
