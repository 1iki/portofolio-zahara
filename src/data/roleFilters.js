/**
 * Role Filter Configuration — Zahara Elhusna Barok
 *
 * Single source of truth for role-based category filtering on the Karya page.
 * Each category maps to the exact role strings found in works.js.
 *
 * Architecture:
 *   works.js role field → roleFilters mapping → WorkGrid filter UI
 *
 * Rules:
 *   - A work appears under a filter if its exact role string is listed in that filter's `roles` array.
 *   - Multi-role strings (e.g. "Produser & Reporter") appear in multiple filters.
 *   - "Semua" has no roles array — it shows everything.
 *   - Every role in works.js MUST appear in at least one filter (validated by test).
 */

export const roleFilters = [
  {
    id: "all",
    label: "Semua",
    roles: null, // null = show all works
  },
  {
    id: "producer",
    label: "Produser",
    roles: [
      "Produser",
      "Asisten Produser",
      "Produser & Reporter",
      "Produser & Host",
      "Redaktur Softnews",
    ],
  },
  {
    id: "writer",
    label: "Penulis Naskah",
    roles: [
      "Penulis Naskah",
      "Penulis Naskah & Host",
      "Penulis Naskah & Reporter",
      "Script Writer & Talent Coordinator",
      "Asisten Script",
    ],
  },
  {
    id: "reporter",
    label: "Reporter",
    roles: [
      "Reporter",
      "Produser & Reporter",
      "Penulis Naskah & Reporter",
      "Content Creator & Reporter",
    ],
  },
  {
    id: "host",
    label: "Host",
    roles: [
      "Penulis Naskah & Host",
      "Produser & Host",
    ],
  },
  {
    id: "director",
    label: "Sutradara",
    roles: [
      "Sutradara",
    ],
  },
  {
    id: "talent-coordinator",
    label: "Talent Coordinator",
    roles: [
      "Talent Coordinator",
      "Script Writer & Talent Coordinator",
    ],
  },
  {
    id: "creative",
    label: "Creative",
    roles: [
      "Creative Support",
      "Content Creator & Reporter",
      "Clipper & Script Continuity",
    ],
  },
];

/**
 * Check if a work matches a given filter.
 * @param {object} work - A work entry from works.js
 * @param {object} filter - A filter entry from roleFilters
 * @returns {boolean}
 */
export function matchesRoleFilter(work, filter) {
  if (filter.roles === null) return true; // "Semua"
  return filter.roles.includes(work.role);
}
