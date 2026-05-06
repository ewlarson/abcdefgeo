import fs from 'node:fs/promises';
import path from 'node:path';

const [, , themeId, ...nameParts] = process.argv;

function usage() {
  console.log(
    'Usage: npm run scaffold -- <theme-id> <Institution Name>\n\n' +
      'Creates a small starter theme file in private/tmp for copy/paste into theme.yaml.'
  );
}

async function main() {
  if (!themeId || nameParts.length === 0) {
    usage();
    return;
  }

  const institutionName = nameParts.join(' ');
  const outDir = path.join('/private/tmp', 'ogm-viewer-scaffolds');
  const outPath = path.join(outDir, `${themeId}.yaml`);
  const starter = `${themeId}:
  label: "${institutionName}"
  site:
    title: "${institutionName} Geoportal"
    short_name: "${institutionName}"
    description: "Search geospatial resources from ${institutionName}."
    locale: "en"
    supported_locales:
      - "en"
    routing:
      mode: "browser"
  institution:
    name: "${institutionName} Geoportal"
    hero_text: "Search geospatial resources from ${institutionName}."
    hero_description: "Browse and download GIS data, maps, and other geospatial resources."
  api:
    base_url: "https://lib-btaageoapi-dev-app-01.oit.umn.edu/api/v1"
    search_path: "/search"
    suggest_path: "/suggest"
    gazetteer_search_path: "/gazetteers/nominatim/search"
    facets_path_template: "/search/facets/{facetName}"
    map_h3_path: "/map/h3"
    home_blog_posts_path: "/home/blog-posts"
    turnstile_status_path: "/turnstile/status"
    turnstile_verify_path: "/turnstile/verify"
    client_name: "${themeId}-geoportal"
    default_query_params: []
  navigation:
    links:
      - href: "/search?q="
        label: "Search"
        external: false
      - href: "/bookmarks"
        label: "Bookmarks"
        external: false
  footer:
    style: "simple"
    show_api_debug: true
`;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, starter);
  console.log(`Wrote starter theme to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
