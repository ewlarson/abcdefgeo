import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();
const themePath = path.join(rootDir, 'theme.yaml');
const themesDir = path.join(rootDir, 'themes');
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

function normalizeBasePath(value) {
  if (!value || value === '/') return '/';
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

function withBasePath(value, basePath) {
  const normalizedValue = ensureLeadingSlash(value);
  if (basePath === '/') return normalizedValue;
  return `${basePath.replace(/\/$/, '')}${normalizedValue}`;
}

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function looksLikeThemeConfig(value) {
  return isRecord(value) && isRecord(value.institution) && isRecord(value.api);
}

function modulePathToThemeId(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function withThemeId(themeId, theme) {
  return {
    ...theme,
    id: theme.id || themeId,
  };
}

function parseThemeYaml(
  raw,
  source = 'theme.yaml',
  fallbackThemeId = 'default'
) {
  const parsed = yaml.load(raw);
  if (!isRecord(parsed)) {
    throw new Error(`Invalid ${source}: expected an object at top-level`);
  }

  if (isRecord(parsed.themes)) {
    const themes = {};
    Object.entries(parsed.themes).forEach(([themeId, theme]) => {
      if (!looksLikeThemeConfig(theme)) {
        throw new Error(
          `Invalid ${source}: expected theme "${themeId}" to define institution and api`
        );
      }
      themes[themeId] = withThemeId(themeId, theme);
    });

    return {
      default_theme:
        typeof parsed.default_theme === 'string'
          ? parsed.default_theme
          : undefined,
      themes,
    };
  }

  if (looksLikeThemeConfig(parsed)) {
    const themeId = typeof parsed.id === 'string' ? parsed.id : fallbackThemeId;
    return {
      default_theme: themeId,
      themes: {
        [themeId]: withThemeId(themeId, parsed),
      },
    };
  }

  const entries = Object.entries(parsed);
  if (entries.length === 1) {
    const [themeId, theme] = entries[0];
    if (looksLikeThemeConfig(theme)) {
      return {
        default_theme: themeId,
        themes: {
          [themeId]: withThemeId(themeId, theme),
        },
      };
    }
  }

  throw new Error(
    `Invalid ${source}: expected a single theme object, one theme entry, or a themes map`
  );
}

async function loadThemeRegistry() {
  const rawDefaultTheme = await fs.readFile(themePath, 'utf8');
  const registry = parseThemeYaml(rawDefaultTheme);
  const themes = { ...registry.themes };

  let themeFiles = [];
  try {
    themeFiles = await fs.readdir(themesDir);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  for (const fileName of themeFiles.sort()) {
    if (!/\.ya?ml$/i.test(fileName)) continue;
    const filePath = path.join(themesDir, fileName);
    const variationRegistry = parseThemeYaml(
      await fs.readFile(filePath, 'utf8'),
      path.relative(rootDir, filePath),
      modulePathToThemeId(filePath)
    );
    Object.assign(themes, variationRegistry.themes);
  }

  return {
    default_theme: registry.default_theme || Object.keys(themes)[0],
    themes,
  };
}

async function main() {
  const registry = await loadThemeRegistry();
  const themeId =
    process.env.OGM_THEME ||
    registry.default_theme ||
    Object.keys(registry.themes)[0];
  const theme = registry.themes[themeId];

  if (!theme) {
    throw new Error(
      `Theme "${themeId}" was not found in theme.yaml or themes/*.yaml`
    );
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
  const basePath = normalizeBasePath(
    process.env.VITE_BASE_URL || process.env.BASE_URL
  );

  const manifest = {
    name: siteTitle,
    short_name: shortName,
    description,
    start_url: basePath,
    display: theme.site?.manifest?.display || 'standalone',
    theme_color: themeColor,
    background_color: backgroundColor,
    icons: [
      {
        src: withBasePath('pwa-64x64.png', basePath),
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: withBasePath('pwa-192x192.png', basePath),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: withBasePath('pwa-512x512.png', basePath),
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
