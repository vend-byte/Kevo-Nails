import { randomInt } from "crypto";

/**
 * Generates a non-predictable reference like KNA-2026-000123.
 * The numeric segment is random (not sequential), so references
 * cannot be guessed from prior ones. Uniqueness is still enforced
 * at the database level via a unique constraint + retry.
 */
export function generateApplicationRef(year = new Date().getFullYear()) {
  const random = randomInt(0, 999999).toString().padStart(6, "0");
  return `KNA-${year}-${random}`;
}

export function generateBookingRef(year = new Date().getFullYear()) {
  const random = randomInt(0, 999999).toString().padStart(6, "0");
  return `KNA-APT-${year}-${random}`;
}
