type AnyJson = Record<string, unknown>;

type IiifTileCoords = {
  x: number;
  y: number;
  z: number;
};

export type IiifTileUrlOptions = {
  coords: IiifTileCoords;
  imageApiVersion: 2 | 3;
  imageHeight: number;
  imageWidth: number;
  maxNativeZoom: number;
  serviceId: string;
  tileFormat: string;
  tileQuality: string;
  tileSize: number;
};

const EMPTY_IIIF_TILE_URL =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

export const IIIF_MIN_ZOOM = -5;

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

export function getIiifTileUrl(options: IiifTileUrlOptions): string {
  const zoom = Math.max(0, Math.min(options.maxNativeZoom, options.coords.z));
  const scale = Math.pow(2, options.maxNativeZoom - zoom);
  const sourceTileSize = options.tileSize * scale;
  const minX = options.coords.x * sourceTileSize;
  const minY = options.coords.y * sourceTileSize;

  if (
    options.coords.x < 0 ||
    options.coords.y < 0 ||
    minX >= options.imageWidth ||
    minY >= options.imageHeight
  ) {
    return EMPTY_IIIF_TILE_URL;
  }

  const maxX = Math.min(minX + sourceTileSize, options.imageWidth);
  const maxY = Math.min(minY + sourceTileSize, options.imageHeight);
  const regionWidth = maxX - minX;
  const regionHeight = maxY - minY;

  if (regionWidth <= 0 || regionHeight <= 0) {
    return EMPTY_IIIF_TILE_URL;
  }

  const outputWidth = Math.ceil(regionWidth / scale);
  const outputHeight = Math.ceil(regionHeight / scale);
  const size =
    options.imageApiVersion === 2
      ? `${outputWidth},`
      : `${outputWidth},${outputHeight}`;
  const region = [minX, minY, regionWidth, regionHeight].join(',');
  const baseUrl = options.serviceId.replace(/\/$/, '');

  return `${baseUrl}/${region}/${size}/0/${options.tileQuality}.${options.tileFormat}`;
}

export function resizeIiifTileToNaturalSize(
  tile: HTMLImageElement,
  tileSize: number
) {
  const { naturalHeight, naturalWidth } = tile;

  if (!naturalHeight || !naturalWidth) return;
  if (naturalHeight === tileSize && naturalWidth === tileSize) return;

  tile.style.width = `${naturalWidth}px`;
  tile.style.height = `${naturalHeight}px`;
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
