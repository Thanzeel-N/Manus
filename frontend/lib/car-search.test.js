import test from "node:test";
import assert from "node:assert/strict";
import { matchesCarSearch } from "./car-search.js";

const cars = [
  { name: "BMW M3", brand: "BMW", fuel: "Petrol", transmission: "Manual", variant: "Competition", year: 2023 },
  { name: "BMW 320d", brand: "BMW", fuel: "Diesel", transmission: "Automatic" },
  { name: "BMW M3", brand: "BMW", fuel: "Petrol", transmission: "Automatic" },
  { name: "Audi A4", brand: "Audi", fuel: "Petrol", transmission: "Manual" },
];
const find = query => cars.filter(car => matchesCarSearch(car, query));

test("combined searches require all attributes on the same car", () => {
  assert.deepEqual(find("bmw petrol"), [cars[0], cars[2]]);
  assert.deepEqual(find("bmw m3 manual"), [cars[0]]);
  assert.deepEqual(find("manual m3 BMW"), [cars[0]]);
  assert.deepEqual(find("bmw diesel manual"), []);
});
test("search handles spacing, case, punctuation, prefixes and year", () => {
  assert.deepEqual(find("  BMW   PETROL  "), [cars[0], cars[2]]);
  assert.deepEqual(find("BMW-M3 man"), [cars[0]]);
  assert.deepEqual(find("competition 2023"), [cars[0]]);
  assert.deepEqual(find("   "), cars);
  assert.equal(matchesCarSearch({}, "petrol"), false);
  assert.equal(matchesCarSearch({ name: "Mercedes-Benz C-Class" }, "mercedes c class"), true);
});
