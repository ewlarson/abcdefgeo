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

function inferImageUrl(serviceId: string): string {
  return `${serviceId.replace(/\/$/, '')}/full/max/0/default.jpg`;
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
                  id: inferImageUrl(imageServiceId),
                  type: 'Image',
                  format: 'image/jpeg',
                  service: [
                    {
                      id: imageServiceId,
                      type: 'ImageService3',
                    },
                  ],
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
