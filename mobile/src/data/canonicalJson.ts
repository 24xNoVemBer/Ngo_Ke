/**
 * Canonical JSON serializer for V2 dataset revision hashing.
 *
 * Rules per POST8_EXECUTION_SPEC.md:
 * 1. Object keys are sorted recursively in standard lexical (UTF-16 code unit) order.
 * 2. Array elements preserve their exact order.
 * 3. Primitives (string, number, boolean, null) use standard JSON.stringify.
 * 4. Text strings are NOT Unicode-normalized (preserving exact incoming UTF-8 bytes).
 * 5. Undefined, functions, and symbols are excluded from object serialization.
 */
export function canonicalDatasetJson(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  const valueType = typeof value;

  if (valueType === 'number' || valueType === 'boolean') {
    return JSON.stringify(value);
  }

  if (valueType === 'string') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalDatasetJson(item));
    return `[${items.join(',')}]`;
  }

  if (valueType === 'object') {
    const record = value as Record<string, unknown>;
    const sortedKeys = Object.keys(record)
      .filter((key) => {
        const val = record[key];
        return val !== undefined && typeof val !== 'function' && typeof val !== 'symbol';
      })
      .sort();

    const entries = sortedKeys.map((key) => {
      const serializedKey = JSON.stringify(key);
      const serializedValue = canonicalDatasetJson(record[key]);
      return `${serializedKey}:${serializedValue}`;
    });

    return `{${entries.join(',')}}`;
  }

  return 'null';
}
