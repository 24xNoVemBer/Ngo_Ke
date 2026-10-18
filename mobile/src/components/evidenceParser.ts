export interface ParsedEvidence {
  label: string;
  url?: string;
}

export function parseEvidenceItem(raw: string): ParsedEvidence {
  if (!raw || typeof raw !== 'string') {
    return { label: '' };
  }
  const match = raw.match(/^(.*?):\s*(https?:\/\/[^\s]+)$/);
  if (match && match[1] && match[2]) {
    return { label: match[1].trim(), url: match[2].trim() };
  }
  const urlMatch = raw.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch && urlMatch[1]) {
    const url = urlMatch[1];
    const label = raw.replace(url, '').replace(/:\s*$/, '').trim() || url;
    return { label, url };
  }
  return { label: raw.trim() };
}
