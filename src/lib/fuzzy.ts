/**
 * Tiered fuzzy matching for the history search box.
 *
 * Results are scored, not just filtered, so exact matches always outrank
 * typo matches regardless of length or other bonuses. Tier bases are spaced
 * far enough apart (1e6) that no within-tier bonus can cross a tier boundary.
 */

const SCAN_CAP = 2048;

export type Candidate = {
  value: string;
  lower: string;
  mask: number;
  scan: number;
};

/** Precompute per item, once, when the source list changes - not per keystroke. */
export function prepare(value: string): Candidate {
  const lower = value.toLowerCase();
  const scan = Math.min(lower.length, SCAN_CAP);
  let mask = 0;
  for (let i = 0; i < scan; i++) mask |= bitFor(lower.charCodeAt(i));
  return { value, lower, mask, scan };
}

/** Same bucketing as `prepare()`, with the "other" bucket cleared so
 * punctuation/spaces in the query never cause a reject. */
export function queryMask(query: string): number {
  let mask = 0;
  for (let i = 0; i < query.length; i++) mask |= bitFor(query.charCodeAt(i));
  return mask & ~(1 << 31);
}

function bitFor(code: number): number {
  if (code >= 97 && code <= 122) return 1 << (code - 97); // a-z -> bits 0-25
  if (code >= 48 && code <= 57) return 1 << (26 + ((code - 48) % 5)); // digits -> bits 26-30
  return 1 << 31; // everything else
}

function isBoundaryChar(code: number): boolean {
  const alnum = (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
  return !alnum;
}

function lenBonus(len: number): number {
  return Math.max(0, 500 - len);
}

const TIER_EXACT = 6_000_000;
const TIER_PREFIX = 5_000_000;
const TIER_WORD = 4_000_000;
const TIER_SUBSTRING = 3_000_000;
const TIER_SUBSEQUENCE = 2_000_000;
const TIER_TYPO = 1_000_000;

/**
 * Score `query` (already trimmed + lowercased) against a prepared candidate.
 * `qMask` is `queryMask(query)`, hoisted out by the caller since it is the
 * same for every candidate in a given search.
 */
export function score(query: string, qMask: number, cand: Candidate): number {
  if (query === "") return 1;
  if ((qMask & ~cand.mask) !== 0) return 0; // candidate lacks a char the query needs

  const lower = cand.lower;
  const len = lower.length;

  if (lower === query) return TIER_EXACT + lenBonus(len);
  if (lower.startsWith(query)) return TIER_PREFIX + lenBonus(len);

  const idx = lower.indexOf(query);
  if (idx >= 0) {
    const boundary = idx === 0 || isBoundaryChar(lower.charCodeAt(idx - 1));
    const base = boundary ? TIER_WORD : TIER_SUBSTRING;
    return base + lenBonus(len) - Math.min(idx, 1000);
  }

  const seq = subsequenceWalk(query, cand);
  if (seq !== null) return TIER_SUBSEQUENCE + lenBonus(len) + seq.bonus;

  if (query.length >= 3 && cand.scan <= 512) {
    const maxEdits = query.length <= 7 ? 1 : 2;
    if (withinEditDistance(query, lower, cand.scan, maxEdits)) {
      return TIER_TYPO + lenBonus(len);
    }
  }

  return 0;
}

/**
 * Matched character indices into `cand.value` for highlighting. Only call
 * this for items actually rendered - it re-walks the match rather than
 * reusing the score, which is fine for a render-sized slice but would
 * reintroduce per-keystroke allocation if run during scoring.
 */
export function match_positions(query: string, cand: Candidate): number[] {
  if (query === "") return [];
  const lower = cand.lower;

  if (lower === query || lower.startsWith(query)) {
    return range(0, query.length);
  }

  const idx = lower.indexOf(query);
  if (idx >= 0) return range(idx, idx + query.length);

  const seq = subsequenceWalk(query, cand);
  if (seq !== null) return seq.positions;

  return []; // typo tier: skip highlighting rather than backtracing the DP
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
}

/** fzf-style ordered-subsequence walk, bounded to `cand.scan` chars. */
function subsequenceWalk(
  query: string,
  cand: Candidate,
): { bonus: number; positions: number[] } | null {
  const lower = cand.lower;
  const scan = cand.scan;
  let qi = 0;
  let prevIdx = -1;
  let run = 0;
  let bonus = 0;
  const positions: number[] = [];

  for (let j = 0; j < scan && qi < query.length; j++) {
    if (lower.charCodeAt(j) !== query.charCodeAt(qi)) continue;

    if (prevIdx === -1) {
      run = 0;
    } else if (j === prevIdx + 1) {
      run += 1;
    } else {
      bonus -= Math.min(j - prevIdx - 1, 20);
      run = 0;
    }
    bonus += 8 + run * 4;
    if (j === 0 || isBoundaryChar(lower.charCodeAt(j - 1))) bonus += 12;

    positions.push(j);
    prevIdx = j;
    qi++;
  }

  return qi === query.length ? { bonus, positions } : null;
}

/**
 * True if some substring of the first `scan` chars of `lower` is within
 * `maxEdits` Damerau-Levenshtein distance of `query`. The first row is
 * zeroed so the match may start anywhere, and `rowMin` bails as soon as no
 * alignment can recover.
 */
function withinEditDistance(
  query: string,
  lower: string,
  scan: number,
  maxEdits: number,
): boolean {
  const n = query.length;
  const m = scan;
  let pp = new Array<number>(m + 1).fill(0); // row i-2, for transpositions
  let prev = new Array<number>(m + 1).fill(0); // row i-1
  let curr = new Array<number>(m + 1).fill(0); // row i

  for (let i = 1; i <= n; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    const qi = query.charCodeAt(i - 1);
    for (let j = 1; j <= m; j++) {
      const vj = lower.charCodeAt(j - 1);
      const cost = qi === vj ? 0 : 1;
      let x = Math.min(
        prev[j] + 1, // deletion from query
        curr[j - 1] + 1, // insertion into query
        prev[j - 1] + cost, // substitution
      );
      if (i > 1 && j > 1 && qi === lower.charCodeAt(j - 2) && query.charCodeAt(i - 2) === vj) {
        x = Math.min(x, pp[j - 2] + 1); // transposition
      }
      curr[j] = x;
      if (x < rowMin) rowMin = x;
    }
    if (rowMin > maxEdits) return false;
    [pp, prev, curr] = [prev, curr, pp];
  }

  for (let j = 0; j <= m; j++) {
    if (prev[j] <= maxEdits) return true;
  }
  return false;
}
