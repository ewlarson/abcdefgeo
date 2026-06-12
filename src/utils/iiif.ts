type AnyJson = Record<string, unknown>;

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function getInfoId(info: AnyJson): string | null {
  const id = info.id ?? info['@id'];
  return isString(id) ? id : null;
}

function getInfoDimensions(info: AnyJson): {
  width: number | null;
  height: number | null;
} {
  return {
    width: typeof info.width === 'number' ? info.width : null,
    height: typeof info.height === 'number' ? info.height : null,
  };
}

function getImageApiVersion(info: AnyJson): 2 | 3 {
  const context = info['@context'];
  const contextValues = Array.isArray(context) ? context : [context];
  if (
    contextValues.some(
      (value) => typeof value === 'string' && value.includes('/image/2')
    )
  ) {
    return 2;
  }

  if (info['@id'] && !info.id) {
    return 2;
  }

  return 3;
}

function getImageServiceProfile(info: AnyJson): string | null {
  const profile = info.profile;
  if (isString(profile)) return profile;
  if (Array.isArray(profile)) {
    const firstString = profile.find(isString);
    return firstString || null;
  }
  return null;
}

function buildImageService(info: AnyJson, imageServiceId: string): AnyJson {
  const version = getImageApiVersion(info);
  const profile = getImageServiceProfile(info);
  return {
    id: imageServiceId,
    type: version === 2 ? 'ImageService2' : 'ImageService3',
    ...(profile ? { profile } : {}),
  };
}

function inferImageUrl(serviceId: string, info: AnyJson): string {
  const size = getImageApiVersion(info) === 2 ? 'full' : 'max';
  return `${serviceId.replace(/\/$/, '')}/full/${size}/0/default.jpg`;
}

export function buildPresentation3ManifestFromImageInfo(args: {
  manifestId: string;
  imageServiceId: string;
  info: AnyJson;
}): AnyJson {
  const { manifestId, imageServiceId, info } = args;
  const { width, height } = getInfoDimensions(info);
  const canvasId = `${manifestId}#canvas-1`;
  const pageId = `${manifestId}#page-1`;
  const annotationId = `${manifestId}#annotation-1`;

  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: manifestId,
    type: 'Manifest',
    label: { en: ['Image'] },
    items: [
      {
        id: canvasId,
        type: 'Canvas',
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        items: [
          {
            id: pageId,
            type: 'AnnotationPage',
            items: [
              {
                id: annotationId,
                type: 'Annotation',
                motivation: 'painting',
                target: canvasId,
                body: {
                  id: inferImageUrl(imageServiceId, info),
                  type: 'Image',
                  format: 'image/jpeg',
                  service: [buildImageService(info, imageServiceId)],
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

export async function fetchIiifImageInfo(
  imageServiceOrInfoUrl: string
): Promise<AnyJson> {
  const base = imageServiceOrInfoUrl.replace(/\/$/, '');
  const infoUrl = base.endsWith('/info.json') ? base : `${base}/info.json`;

  const response = await fetch(infoUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch IIIF info.json: ${response.status}`);
  }

  return (await response.json()) as AnyJson;
}

export function normalizeImageServiceId(
  imageServiceOrInfoUrl: string,
  info: AnyJson
): string {
  const canonical = getInfoId(info);
  if (canonical) {
    return canonical.replace(/\/info\.json$/, '').replace(/\/$/, '');
  }
  return imageServiceOrInfoUrl.replace(/\/info\.json$/, '').replace(/\/$/, '');
}
