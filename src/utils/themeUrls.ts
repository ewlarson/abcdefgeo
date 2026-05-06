export function getAppBasePath(): string {
  const rawBase = import.meta.env.BASE_URL || '/';
  if (!rawBase || rawBase === '/') return '/';

  const withLeadingSlash = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export function isAbsoluteUrl(value: string | undefined): boolean {
  if (!value) return false;

  const trimmed = value.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('//');
}

export function resolveThemeAssetUrl(
  value: string | undefined
): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (isAbsoluteUrl(trimmed) || trimmed.startsWith('#')) return trimmed;

  if (trimmed.startsWith('/')) {
    const basePath = getAppBasePath();
    if (basePath === '/') return trimmed;
    return `${basePath.replace(/\/$/, '')}${trimmed}`;
  }

  return trimmed;
}
