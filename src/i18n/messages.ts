export type MessageValue = string | Record<string, MessageValue>;

export const messages = {
  en: {
    common: {
      about: 'About',
      advancedSearch: 'Advanced search',
      allRightsReserved: 'All rights reserved.',
      api: 'API',
      bookmarks: 'Bookmarks',
      browseAllResources: 'Browse All Resources',
      close: 'Close',
      documentation: 'Documentation',
      feedback: 'Feedback',
      featuredCollections: 'Featured Collections',
      filterResults: 'Filter Results',
      hide: 'Hide',
      language: 'Language',
      loading: 'Loading…',
      loadingMap: 'Loading map…',
      loadingStories: 'Loading stories…',
      mainNavigation: 'Main navigation',
      menu: 'Menu',
      noApiRequestsYet: 'No API requests yet',
      noStoriesAvailable: 'No stories available yet.',
      partnerInstitutions: 'Partner Institutions',
      place: 'Place',
      publisher: 'Publisher',
      resourceType: 'Resource Type',
      search: 'Search',
      searchHere: 'Search here',
      searchPlaceholder: 'Search for maps, data, imagery...',
      theme: 'Theme',
      topic: 'Theme',
      utilityNavigation: 'Utility navigation',
      viewAllCollections: 'View all collections',
      viewAllResources: 'View all resources',
      viewAllStories: 'View all stories',
      viewCollectionRecord: 'View collection record',
      viewMore: 'View more',
      viewOriginal: 'View original',
    },
    bookmarks: {
      pageTitle: 'Bookmarked Resources',
    },
    citation: {
      copyCitation: 'Copy citation',
      exportForCitationTools: 'Export for citation tools',
      heading: 'Cite & Reference',
      permalink: 'Permalink',
    },
    footer: {
      lastApiRequest: 'Last API Request:',
    },
    home: {
      openMedia: 'Open featured media',
    },
    search: {
      customArea: 'Custom area',
      didYouMean: 'Did you mean:',
      geographicAreas: 'Geographic Areas',
      in: 'in',
      noCloseSuggestions: 'No close keyword suggestions found.',
      noMatchingPlaces: 'No matching geographic areas found.',
      noResultLocationsToMap: 'No result locations to map.',
      noResultsHeading: 'No search results found',
      noResultsWithQuery:
        'Try a suggested search, a broader fielded search, or Advanced Search.',
      noResultsWithoutQuery:
        'Try clearing filters or building a more precise query in Advanced Search.',
      pageDescription:
        'Search existing resources in this geospatial discovery interface.',
      pageTitle: 'Search Results',
      preciseSearchDescription:
        'Combine fields and terms with Advanced Search.',
      preciseSearchTitle: 'Build a more precise search',
      resultsFor: 'Search results for {query}',
      scopeSubjectTheme: 'Subject/Theme',
      scopeTitle: 'Title',
      searchOnlyIn: 'Search Only In',
      searchingPlaces: 'Searching places...',
      searchingSuggestions: 'Searching suggestions...',
      seeAllResultsFor: 'See all results for {query}',
      suggestions: 'Suggestions',
      viaOpenStreetMap: 'Via OpenStreetMap',
    },
    security: {
      checkingSession: 'Checking session...',
      finishingCheck: 'Finishing check...',
      turnstileDescription:
        'This quick check helps keep automated traffic from overwhelming the Geoportal.',
      turnstileError: 'Verification did not complete. Please try again.',
      turnstileTitle: 'Verifying browser session',
    },
    seo: {
      defaultDescription:
        'Discover and access geospatial resources through the BTAA Geospatial API.',
      defaultSiteTitle: 'OpenGeoMetadata Geoportal',
    },
  },
  es: {
    common: {
      about: 'Acerca de',
      advancedSearch: 'Búsqueda avanzada',
      allRightsReserved: 'Todos los derechos reservados.',
      api: 'API',
      bookmarks: 'Marcadores',
      browseAllResources: 'Explorar todos los recursos',
      close: 'Cerrar',
      documentation: 'Documentación',
      feedback: 'Comentarios',
      featuredCollections: 'Colecciones destacadas',
      filterResults: 'Filtrar resultados',
      hide: 'Ocultar',
      language: 'Idioma',
      loading: 'Cargando…',
      loadingMap: 'Cargando mapa…',
      loadingStories: 'Cargando historias…',
      mainNavigation: 'Navegación principal',
      menu: 'Menú',
      noApiRequestsYet: 'Todavía no hay solicitudes a la API',
      noStoriesAvailable: 'Todavía no hay historias disponibles.',
      partnerInstitutions: 'Instituciones asociadas',
      place: 'Lugar',
      publisher: 'Publicador',
      resourceType: 'Tipo de recurso',
      search: 'Buscar',
      searchHere: 'Buscar aquí',
      searchPlaceholder: 'Buscar mapas, datos e imágenes...',
      theme: 'Tema',
      topic: 'Tema',
      utilityNavigation: 'Navegación utilitaria',
      viewAllCollections: 'Ver todas las colecciones',
      viewAllResources: 'Ver todos los recursos',
      viewAllStories: 'Ver todas las historias',
      viewCollectionRecord: 'Ver el registro de la colección',
      viewMore: 'Ver más',
      viewOriginal: 'Ver original',
    },
    bookmarks: {
      pageTitle: 'Recursos marcados',
    },
    citation: {
      copyCitation: 'Copiar cita',
      exportForCitationTools: 'Exportar para herramientas de cita',
      heading: 'Citar y referenciar',
      permalink: 'Enlace permanente',
    },
    footer: {
      lastApiRequest: 'Última solicitud a la API:',
    },
    home: {
      openMedia: 'Abrir contenido destacado',
    },
    search: {
      customArea: 'Área personalizada',
      didYouMean: 'Quizás quiso decir:',
      geographicAreas: 'Áreas geográficas',
      in: 'en',
      noCloseSuggestions:
        'No se encontraron sugerencias de palabras clave cercanas.',
      noMatchingPlaces:
        'No se encontraron áreas geográficas coincidentes.',
      noResultLocationsToMap:
        'No hay ubicaciones de resultados para mapear.',
      noResultsHeading: 'No se encontraron resultados',
      noResultsWithQuery:
        'Pruebe una búsqueda sugerida, una búsqueda por campo más amplia o la búsqueda avanzada.',
      noResultsWithoutQuery:
        'Pruebe borrar filtros o crear una consulta más precisa en la búsqueda avanzada.',
      pageDescription:
        'Busque recursos existentes en esta interfaz de descubrimiento geoespacial.',
      pageTitle: 'Resultados de búsqueda',
      preciseSearchDescription:
        'Combine campos y términos con la búsqueda avanzada.',
      preciseSearchTitle: 'Crear una búsqueda más precisa',
      resultsFor: 'Resultados de búsqueda para {query}',
      scopeSubjectTheme: 'Tema/materia',
      scopeTitle: 'Título',
      searchOnlyIn: 'Buscar solo en',
      searchingPlaces: 'Buscando lugares...',
      searchingSuggestions: 'Buscando sugerencias...',
      seeAllResultsFor: 'Ver todos los resultados para {query}',
      suggestions: 'Sugerencias',
      viaOpenStreetMap: 'Mediante OpenStreetMap',
    },
    security: {
      checkingSession: 'Comprobando sesión...',
      finishingCheck: 'Finalizando comprobación...',
      turnstileDescription:
        'Esta comprobación rápida ayuda a evitar que el tráfico automatizado sobrecargue el Geoportal.',
      turnstileError:
        'La verificación no se completó. Inténtelo de nuevo.',
      turnstileTitle: 'Verificando la sesión del navegador',
    },
    seo: {
      defaultDescription:
        'Descubra y acceda a recursos geoespaciales mediante la BTAA Geospatial API.',
      defaultSiteTitle: 'Geoportal OpenGeoMetadata',
    },
  },
} as const;

function formatMessage(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;

  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

function getNestedMessage(
  localeMessages: Record<string, MessageValue>,
  key: string
): string | undefined {
  const parts = key.split('.');
  let current: MessageValue | undefined = localeMessages;

  for (const part of parts) {
    if (!current || typeof current === 'string' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

export function translate(
  locale: string,
  fallbackLocale: string,
  key: string,
  vars?: Record<string, string | number>
): string {
  const primaryLocaleMessages =
    (messages as Record<string, Record<string, MessageValue>>)[locale] || {};
  const fallbackLocaleMessages =
    (messages as Record<string, Record<string, MessageValue>>)[fallbackLocale] ||
    {};
  const primary = getNestedMessage(primaryLocaleMessages, key);
  const fallback = getNestedMessage(fallbackLocaleMessages, key);
  return formatMessage(primary || fallback || key, vars);
}

export function resolveLocalizedText(
  value: string | Record<string, string> | undefined,
  locale: string,
  fallbackLocale: string
): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value[locale] || value[fallbackLocale] || Object.values(value)[0];
}
