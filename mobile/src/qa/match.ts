export type QaEntry = {
  id: string;
  question: string;
  answer: string;
  nodeId: string;
  aliases: string[];
  evidence: string[];
  followUps: string[];
  tags: string[];
};

export type QaMatch =
  | { status: 'matched'; entry: QaEntry; matchedOn: 'question' | 'alias' }
  | { status: 'unknown' };

const TRAILING_PUNCTUATION = /[?!.,;:]+$/;
// đ/Đ là ký tự riêng, không tách được bằng NFD nên phải thay trực tiếp.
const STROKED_D = /đ/gi;

/** Fold case, Vietnamese diacritics, spacing and trailing punctuation for comparison only. */
export function normalizeQuestion(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(STROKED_D, 'd')
    .toLowerCase()
    .trim()
    // Strip after collapsing spaces so "hỏi gì?  " folds the same as "hỏi gì".
    .replace(TRAILING_PUNCTUATION, '')
    .trim();
}

export function findAnswer(entries: readonly QaEntry[], text: string): QaMatch {
  const asked = normalizeQuestion(text);
  if (asked.length === 0) {
    return { status: 'unknown' };
  }

  for (const entry of entries) {
    if (normalizeQuestion(entry.question) === asked) {
      return { status: 'matched', entry, matchedOn: 'question' };
    }
  }

  for (const entry of entries) {
    if (entry.aliases.some((alias) => normalizeQuestion(alias) === asked)) {
      return { status: 'matched', entry, matchedOn: 'alias' };
    }
  }

  return { status: 'unknown' };
}