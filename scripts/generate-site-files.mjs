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

function isAbsoluteUrl(value) {
  if (!value) return false;
  return /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//');
}

function withBasePath(value, basePath) {
  if (!value) return value;
  if (isAbsoluteUrl(value)) return value;
  const normalizedValue = ensureLeadingSlash(value);
  if (basePath === '/') return normalizedValue;
  return `${basePath.replace(/\/$/, '')}${normalizedValue}`;
}

function stripLeadingSlash(value) {
  return value.replace(/^\/+/, '');
}

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

const FALLBACK_ICON_PACK = {
  manifest: '/manifest.webmanifest',
  favicon: '/favicon.ico',
  apple_touch_icon: '/apple-touch-icon-180x180.png',
  pwa: [
    {
      src: '/pwa-64x64.png',
      sizes: '64x64',
      type: 'image/png',
    },
    {
      src: '/pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};

function getThemeIconPack(theme) {
  const icons = theme.site?.icons || {};
  const pwaIcons =
    Array.isArray(icons.pwa) && icons.pwa.length > 0
      ? icons.pwa
      : FALLBACK_ICON_PACK.pwa;

  return {
    manifest: icons.manifest || FALLBACK_ICON_PACK.manifest,
    favicon: icons.favicon || FALLBACK_ICON_PACK.favicon,
    favicon_svg: icons.favicon_svg,
    apple_touch_icon:
      icons.apple_touch_icon || FALLBACK_ICON_PACK.apple_touch_icon,
    pwa: pwaIcons,
  };
}

function manifestIcon(icon, src) {
  return {
    src,
    sizes: icon.sizes,
    type: icon.type || 'image/png',
    ...(icon.purpose ? { purpose: icon.purpose } : {}),
  };
}

function appendThemeParam(url, themeId) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}ogm_theme=${encodeURIComponent(themeId)}`;
}

function localPublicPathFromUrl(value) {
  if (!value || isAbsoluteUrl(value) || value.startsWith('#')) return null;
  const relativePath = stripLeadingSlash(value);
  if (!relativePath) return null;
  return path.join(publicDir, relativePath);
}

function relativeUrlFromManifest(manifestUrl, targetUrl) {
  if (isAbsoluteUrl(targetUrl)) return targetUrl;
  const manifestDir = path.posix.dirname(stripLeadingSlash(manifestUrl));
  const targetPath = stripLeadingSlash(targetUrl);
  return (
    path.posix.relative(manifestDir, targetPath) ||
    path.posix.basename(targetPath)
  );
}

function relativeRootFromManifest(manifestUrl) {
  const manifestDir = path.posix.dirname(stripLeadingSlash(manifestUrl));
  const relativeRoot = path.posix.relative(manifestDir, '') || '.';
  return relativeRoot.endsWith('/') ? relativeRoot : `${relativeRoot}/`;
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

function getThemeManifestMetadata(themeId, theme) {
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

  return {
    siteTitle,
    shortName,
    description,
    themeColor,
    backgroundColor,
  };
}

function buildThemeManifest(themeId, theme, options) {
  const { siteTitle, shortName, description, themeColor, backgroundColor } =
    getThemeManifestMetadata(themeId, theme);
  const iconPack = getThemeIconPack(theme);

  return {
    id: options.id,
    name: siteTitle,
    short_name: shortName,
    description,
    start_url: options.startUrl,
    scope: options.scope,
    display: theme.site?.manifest?.display || 'standalone',
    theme_color: themeColor,
    background_color: backgroundColor,
    icons: iconPack.pwa.map((icon) =>
      manifestIcon(icon, options.resolveIconSrc(icon.src))
    ),
  };
}

async function writeThemeManifest(themeId, theme) {
  const iconPack = getThemeIconPack(theme);
  const manifestPath = localPublicPathFromUrl(iconPack.manifest);
  if (!manifestPath) return;

  const relativeRoot = relativeRootFromManifest(iconPack.manifest);
  const manifest = buildThemeManifest(themeId, theme, {
    id: appendThemeParam(relativeRoot, themeId),
    startUrl: appendThemeParam(relativeRoot, themeId),
    scope: relativeRoot,
    resolveIconSrc: (src) => relativeUrlFromManifest(iconPack.manifest, src),
  });

  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function copyPublicAsset(sourceUrl, targetFileName) {
  const sourcePath = localPublicPathFromUrl(sourceUrl);
  if (!sourcePath) return;

  const targetPath = path.join(publicDir, targetFileName);
  if (path.resolve(sourcePath) === path.resolve(targetPath)) return;

  try {
    await fs.copyFile(sourcePath, targetPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    console.warn(
      `Configured theme icon was not found and could not be copied: ${sourceUrl}`
    );
  }
}

async function copyThemeIconPackToRoot(theme) {
  const iconPack = getThemeIconPack(theme);
  await copyPublicAsset(iconPack.favicon, 'favicon.ico');
  await copyPublicAsset(iconPack.favicon_svg, 'favicon.svg');
  await copyPublicAsset(
    iconPack.apple_touch_icon,
    'apple-touch-icon-180x180.png'
  );

  for (const icon of iconPack.pwa) {
    const targetName = `pwa-${icon.sizes}.png`;
    await copyPublicAsset(icon.src, targetName);
  }
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

  const basePath = normalizeBasePath(
    process.env.VITE_BASE_URL || process.env.BASE_URL
  );

  const manifest = buildThemeManifest(themeId, theme, {
    id: appendThemeParam(basePath, themeId),
    startUrl: appendThemeParam(basePath, themeId),
    scope: basePath,
    resolveIconSrc: (src) => withBasePath(src, basePath),
  });

  await fs.mkdir(publicDir, { recursive: true });
  await Promise.all(
    Object.entries(registry.themes).map(([id, themeConfig]) =>
      writeThemeManifest(id, themeConfig)
    )
  );
  await copyThemeIconPackToRoot(theme);
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
