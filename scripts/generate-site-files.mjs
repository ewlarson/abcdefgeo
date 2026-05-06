import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();
const themePath = path.join(rootDir, 'theme.yaml');
const publicDir = path.join(rootDir, 'public');

function resolveLocalizedText(value, locale = 'en') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value.en || Object.values(value)[0] || '';
}

function ensureLeadingSlash(value) {
  if (!value) return '/';
  return value.startsWith('/') ? value : `/${value}`;
}

async function main() {
  const rawTheme = await fs.readFile(themePath, 'utf8');
  const registry = yaml.load(rawTheme);

  if (!registry?.themes || typeof registry.themes !== 'object') {
    throw new Error('theme.yaml must define a themes map');
  }

  const themeId =
    process.env.OGM_THEME ||
    registry.default_theme ||
    Object.keys(registry.themes)[0];
  const theme = registry.themes[themeId];

  if (!theme) {
    throw new Error(`Theme "${themeId}" was not found in theme.yaml`);
  }

  const locale = theme.site?.locale || 'en';
  const siteTitle =
    resolveLocalizedText(theme.site?.title, locale) ||
    theme.institution?.name ||
    themeId;
  const shortName = theme.site?.short_name || siteTitle;
  const description =
    resolveLocalizedText(theme.site?.description, locale) ||
    resolveLocalizedText(theme.institution?.hero_description, locale) ||
    siteTitle;
  const themeColor =
    theme.site?.manifest?.theme_color ||
    theme.branding?.colors?.primary ||
    '#003C5B';
  const backgroundColor =
    theme.site?.manifest?.background_color ||
    theme.branding?.colors?.page_background ||
    themeColor;

  const manifest = {
    name: siteTitle,
    short_name: shortName,
    description,
    start_url: '/',
    display: theme.site?.manifest?.display || 'standalone',
    theme_color: themeColor,
    background_color: backgroundColor,
    icons: [
      {
        src: ensureLeadingSlash('pwa-64x64.png'),
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: ensureLeadingSlash('pwa-192x192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: ensureLeadingSlash('pwa-512x512.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(
    path.join(publicDir, 'manifest.webmanifest'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  console.log(`Generated site files for theme "${themeId}".`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
