const words = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) || [];

export function matchesCarSearch(car, query) {
  const terms = words(query);
  const attributes = words(
    [
      car.brand,
      car.name,
      car.model,
      car.variant,
      car.fuel,
      car.transmission,
      car.body,
      car.year,
    ]
      .filter(Boolean)
      .join(" "),
  );
  return terms.every((term) =>
    attributes.some((attribute) => attribute.startsWith(term)),
  );
}
