export const n = (v, d = 0) => {
  const num = typeof v === "string" ? Number(v.replace(/,/g, "")) : Number(v);
  return Number.isFinite(num) ? num : d;
};

export const normalizePopulation = (p = {}) => ({
  working_class_popularity: n(p.working_class_popularity, 50),
  middle_class_popularity: n(p.middle_class_popularity, 50),
  high_class_popularity: n(p.high_class_popularity, 50),
  poverty_class_popularity: n(p.poverty_class_popularity, 50),
  rebels_popularity: n(p.rebels_popularity, 0),
});

export const normalizeSession = (s = {}) => ({
  ...s,
  money: n(s.money, 0),
  tap_value: n(s.tap_value, 1),
  total_taps: n(s.total_taps, 0),
  current_year: n(s.current_year, 1),
  population: normalizePopulation(s.population),
});
