import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  fetchIiifImageInfo,
  normalizeImageServiceId,
} from '../../utils/iiif';
import { useI18n } from '../../hooks/useI18n';

type IiifImageInfo = Record<string, unknown> & {
  width?: number;
  height?: number;
  tiles?: Array<{
    width?: number;
    height?: number;
    scaleFactors?: number[];
  }>;
};

type IiifTileLayerOptions = L.TileLayerOptions & {
  imageWidth: number;
  imageHeight: number;
  imageApiVersion: 2 | 3;
  serviceId: string;
  tileFormat: string;
  tileQuality: string;
};

type IiifTileLayerInstance = L.TileLayer & {
  options: IiifTileLayerOptions;
  maxNativeZoom: number;
  getTileUrl(coords: L.Coords): string;
};

type IiifTileCoords = Pick<L.Coords, 'x' | 'y' | 'z'>;

type IiifTileUrlOptions = Pick<
  IiifTileLayerOptions,
  | 'imageApiVersion'
  | 'imageHeight'
  | 'imageWidth'
  | 'serviceId'
  | 'tileFormat'
  | 'tileQuality'
  | 'tileSize'
> & {
  coords: IiifTileCoords;
  maxNativeZoom: number;
};

const EMPTY_TILE_URL =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

function getImageApiVersion(info: IiifImageInfo): 2 | 3 {
  const context = info['@context'];
  const contextValues = Array.isArray(context) ? context : [context];

  if (
    contextValues.some(
      (value) => typeof value === 'string' && value.includes('/image/2')
    )
  ) {
    return 2;
  }

  return info['@id'] && !info.id ? 2 : 3;
}

function getTileSize(info: IiifImageInfo): number {
  const firstTile = Array.isArray(info.tiles) ? info.tiles[0] : undefined;
  return firstTile?.width && firstTile.width > 0 ? firstTile.width : 256;
}

function getTileFormat(info: IiifImageInfo): string {
  const preferredFormats = info.preferredFormats;
  if (Array.isArray(preferredFormats)) {
    const firstFormat = preferredFormats.find(
      (format): format is string => typeof format === 'string'
    );
    if (firstFormat) return firstFormat.replace(/^\./, '');
  }

  return 'jpg';
}

function getMaxNativeZoom(width: number, height: number, tileSize: number) {
  return Math.max(
    Math.ceil(Math.log(width / tileSize) / Math.LN2),
    Math.ceil(Math.log(height / tileSize) / Math.LN2),
    0
  );
}

export function getIiifTileUrl(options: IiifTileUrlOptions): string {
  const zoom = Math.max(0, Math.min(options.maxNativeZoom, options.coords.z));
  const scale = Math.pow(2, options.maxNativeZoom - zoom);
  const tileBaseSize = options.tileSize as number;
  const sourceTileSize = tileBaseSize * scale;
  const minX = options.coords.x * sourceTileSize;
  const minY = options.coords.y * sourceTileSize;

  if (
    options.coords.x < 0 ||
    options.coords.y < 0 ||
    minX >= options.imageWidth ||
    minY >= options.imageHeight
  ) {
    return EMPTY_TILE_URL;
  }

  const maxX = Math.min(minX + sourceTileSize, options.imageWidth);
  const maxY = Math.min(minY + sourceTileSize, options.imageHeight);
  const regionWidth = maxX - minX;
  const regionHeight = maxY - minY;

  if (regionWidth <= 0 || regionHeight <= 0) {
    return EMPTY_TILE_URL;
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

function buildIiifTileLayer(options: IiifTileLayerOptions): IiifTileLayerInstance {
  const IiifTileLayer = L.TileLayer.extend({
    getTileUrl(this: IiifTileLayerInstance, coords: L.Coords) {
      return getIiifTileUrl({
        coords,
        imageApiVersion: this.options.imageApiVersion,
        imageHeight: this.options.imageHeight,
        imageWidth: this.options.imageWidth,
        maxNativeZoom: this.maxNativeZoom,
        serviceId: this.options.serviceId,
        tileFormat: this.options.tileFormat,
        tileQuality: this.options.tileQuality,
        tileSize: this.options.tileSize as number,
      });
    },
  });

  const layer = new IiifTileLayer('', {
    ...options,
    noWrap: true,
    updateWhenIdle: true,
  }) as IiifTileLayerInstance;
  layer.maxNativeZoom = options.maxNativeZoom ?? 0;
  return layer;
}

function getImageBounds(
  Leaflet: typeof L,
  width: number,
  height: number,
  maxNativeZoom: number
) {
  const southWest = Leaflet.CRS.Simple.pointToLatLng(
    Leaflet.point(0, height),
    maxNativeZoom
  );
  const northEast = Leaflet.CRS.Simple.pointToLatLng(
    Leaflet.point(width, 0),
    maxNativeZoom
  );
  return Leaflet.latLngBounds(southWest, northEast);
}

export function IiifImageLeafletViewer({ endpoint }: { endpoint: string }) {
  const { t } = useI18n();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !endpoint) return;

    let disposed = false;
    let cleanup = () => {};

    const bootViewer = async () => {
      try {
        setLoadFailed(false);
        const info = (await fetchIiifImageInfo(endpoint)) as IiifImageInfo;
        if (disposed) return;

        const width = info.width;
        const height = info.height;
        if (!width || !height) {
          throw new Error('IIIF info.json is missing image dimensions.');
        }

        const tileSize = getTileSize(info);
        const maxNativeZoom = getMaxNativeZoom(width, height, tileSize);
        const imageBounds = getImageBounds(L, width, height, maxNativeZoom);
        const map = L.map(element, {
          attributionControl: false,
          center: imageBounds.getCenter(),
          crs: L.CRS.Simple,
          maxBounds: imageBounds.pad(0.5),
          maxBoundsViscosity: 0.5,
          maxZoom: maxNativeZoom,
          minZoom: 0,
          preferCanvas: false,
          zoom: 0,
        });
        const layer = buildIiifTileLayer({
          bounds: imageBounds,
          imageApiVersion: getImageApiVersion(info),
          imageHeight: height,
          imageWidth: width,
          maxNativeZoom,
          maxZoom: maxNativeZoom,
          minZoom: 0,
          serviceId: normalizeImageServiceId(endpoint, info),
          tileFormat: getTileFormat(info),
          tileQuality: 'default',
          tileSize,
        });

        layer.addTo(map);

        const refit = () => {
          map.invalidateSize();
          map.fitBounds(imageBounds, {
            animate: false,
            padding: [16, 16],
          });
        };
        const timeoutIds = [0, 100, 300].map((delay) =>
          window.setTimeout(() => {
            if (!disposed) refit();
          }, delay)
        );
        let secondFrame = 0;
        const firstFrame = window.requestAnimationFrame(() => {
          refit();
          secondFrame = window.requestAnimationFrame(() => {
            if (!disposed) refit();
          });
        });
        const resizeObserver =
          typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(() => {
                if (!disposed) refit();
              })
            : null;
        resizeObserver?.observe(element);

        cleanup = () => {
          window.cancelAnimationFrame(firstFrame);
          window.cancelAnimationFrame(secondFrame);
          timeoutIds.forEach((id) => window.clearTimeout(id));
          resizeObserver?.disconnect();
          map.remove();
        };
      } catch (error) {
        console.error('Failed to load IIIF image viewer:', error);
        if (!disposed) setLoadFailed(true);
      }
    };

    void bootViewer();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [endpoint]);

  return (
    <div className="viewer h-[600px] bg-gray-100">
      {loadFailed ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-gray-600">
          {t('resource.viewerLoadError')}
        </div>
      ) : (
        <div ref={elementRef} className="h-full w-full" />
      )}
    </div>
  );
}
