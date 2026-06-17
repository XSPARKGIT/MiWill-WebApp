export function toIsoTimestamp(value) {
  if (!value) {
    return new Date().toISOString();
  }
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

export function formatJoinedDate(value) {
  const iso = toIsoTimestamp(value);
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
