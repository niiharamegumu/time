export type ThemeMode = "system" | "light" | "dark";

export type AppSettings = {
  alwaysOnTop: boolean;
  showSeconds: boolean;
  timeFormat: "24h";
  showWeekday: boolean;
  locale: "ja-JP";
  themeMode: ThemeMode;
  opacity: number;
};

export const defaultSettings: AppSettings = {
  alwaysOnTop: false,
  showSeconds: true,
  timeFormat: "24h",
  showWeekday: true,
  locale: "ja-JP",
  themeMode: "system",
  opacity: 1,
};
