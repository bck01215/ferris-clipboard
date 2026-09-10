/**
 * Lightweight fuzzy matching for the history search box.
 *
 * A query matches a value when, case-insensitively, either:
 *  - the value contains the query as a substring, or
 *  - the query is an ordered subsequence of the value (skips typos of
 *    insertion/omission kind), or
 *  - some window of the value is within a small edit distance of the query
 *    (handles substitutions / transpositions, i.e. real typos).
 */
export function fuzzy_match(query: string, value: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  const v = value.toLowerCase();

  if (v.includes(q)) return true;
  if (is_subsequence(q, v)) return true;

  // Allow ~1 edit per 4 chars of query, capped so long queries stay strict.
  const maxEdits = Math.min(3, Math.floor(q.length / 4) + 1);
  return within_edit_distance(q, v, maxEdits);
}

function is_subsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

/**
 * True if any substring of `haystack` is within `maxEdits` (Levenshtein) of
 * `needle`. Uses the classic DP with the first row zeroed so the match can
 * start anywhere in the haystack.
 */
function within_edit_distance(
  needle: string,
  haystack: string,
  maxEdits: number,
): boolean {
  const n = needle.length;
  const m = haystack.length;
  let prev = new Array<number>(m + 1).fill(0);
  let curr = new Array<number>(m + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= m; j++) {
      const cost = needle[i - 1] === haystack[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion from needle
        curr[j - 1] + 1, // insertion into needle
        prev[j - 1] + cost, // substitution
      );
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > maxEdits) return false; // no alignment can recover
    [prev, curr] = [curr, prev];
  }

  for (let j = 0; j <= m; j++) {
    if (prev[j] <= maxEdits) return true;
  }
  return false;
}
