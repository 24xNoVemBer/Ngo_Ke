export type AlleyStory = {
  title: string;
  paragraphs: string[];
  evidence: string[];
};

export type GuideEatItem = {
  name: string;
  address: string | null;
  dishes: string;
  hours: string | null;
  note: string | null;
};

export type GuideVisitItem = {
  name: string;
  address: string | null;
  notes: string[];
};

export type AlleyGuide = {
  eat: GuideEatItem[];
  visit: GuideVisitItem[];
  route: string[];
  caveats: string[];
  evidence: string[];
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, max = 4000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function optionalText(value: unknown): value is string | null {
  return value === null || text(value);
}

function texts(value: unknown, min = 0, max = 40): value is string[] {
  return Array.isArray(value) && value.length >= min && value.length <= max
    && value.every((item) => text(item));
}

export function readAlleyStory(dataset: unknown): AlleyStory | null {
  if (!record(dataset)) return null;
  const story = dataset.alleyStory;
  if (!record(story) || !text(story.title, 500) || !texts(story.paragraphs, 1)
    || !texts(story.evidence, 1, 20)) return null;
  return story as AlleyStory;
}

export function readAlleyGuide(dataset: unknown): AlleyGuide | null {
  if (!record(dataset)) return null;
  const guide = dataset.guide;
  if (!record(guide) || !Array.isArray(guide.eat) || guide.eat.length > 40
    || !Array.isArray(guide.visit) || guide.visit.length > 40
    || !texts(guide.route) || !texts(guide.caveats) || !texts(guide.evidence, 1, 20)) return null;
  if (!guide.eat.every((item: unknown) => record(item) && text(item.name, 500)
    && optionalText(item.address) && text(item.dishes) && optionalText(item.hours)
    && optionalText(item.note))) return null;
  if (!guide.visit.every((item: unknown) => record(item) && text(item.name, 500)
    && optionalText(item.address) && texts(item.notes, 1))) return null;
  return guide as AlleyGuide;
}
