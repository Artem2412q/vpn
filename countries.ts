export type ExitCountry = {
  code: string;
  name: string;
  tz: string;
  lat: number;
  lon: number;
  hint: string;
};

export const RUSSIA_ANCHOR = {
  // Условная точка “над Россией” (для визуала, не география/политика)
  lat: 60,
  lon: 90
};

export const COUNTRIES: ExitCountry[] = [
  {
    code: "NL",
    name: "Нидерланды",
    tz: "Europe/Amsterdam",
    lat: 52.3676,
    lon: 4.9041,
    hint: "спокойный маршрут"
  },
  {
    code: "DE",
    name: "Германия",
    tz: "Europe/Berlin",
    lat: 50.1109,
    lon: 8.6821,
    hint: "надёжная инфраструктура"
  },
  {
    code: "FI",
    name: "Финляндия",
    tz: "Europe/Helsinki",
    lat: 60.1699,
    lon: 24.9384,
    hint: "ближе по задержке"
  },
  {
    code: "TR",
    name: "Турция",
    tz: "Europe/Istanbul",
    lat: 41.0082,
    lon: 28.9784,
    hint: "удобно в поездках"
  },
  {
    code: "SG",
    name: "Сингапур",
    tz: "Asia/Singapore",
    lat: 1.3521,
    lon: 103.8198,
    hint: "далеко, но стабильно"
  }
];
