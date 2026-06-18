import { describe, expect, it } from 'vitest';
import { getIiifTileUrl } from '../../../components/resource/IiifImageLeafletViewer';

const baseOptions = {
  imageApiVersion: 2 as const,
  imageHeight: 6270,
  imageWidth: 7392,
  maxNativeZoom: 3,
  serviceId:
    'https://s3.amazonaws.com/ogm-metadata-studio/uploads/unr-74479f22-0e6b-4c13-b376-0195a7461525/iiif',
  tileFormat: 'jpg',
  tileQuality: 'default',
  tileSize: 1024,
};

describe('getIiifTileUrl', () => {
  it('generates IIIF region tile URLs for the initial zoom level', () => {
    expect(
      getIiifTileUrl({
        ...baseOptions,
        coords: { x: 0, y: 0, z: 0 },
      })
    ).toBe(
      'https://s3.amazonaws.com/ogm-metadata-studio/uploads/unr-74479f22-0e6b-4c13-b376-0195a7461525/iiif/0,0,7392,6270/924,/0/default.jpg'
    );
  });

  it('generates native IIIF tile URLs at max zoom', () => {
    expect(
      getIiifTileUrl({
        ...baseOptions,
        coords: { x: 0, y: 0, z: 3 },
      })
    ).toBe(
      'https://s3.amazonaws.com/ogm-metadata-studio/uploads/unr-74479f22-0e6b-4c13-b376-0195a7461525/iiif/0,0,1024,1024/1024,/0/default.jpg'
    );
  });

  it('clips edge tiles to image dimensions', () => {
    expect(
      getIiifTileUrl({
        ...baseOptions,
        coords: { x: 7, y: 6, z: 3 },
      })
    ).toBe(
      'https://s3.amazonaws.com/ogm-metadata-studio/uploads/unr-74479f22-0e6b-4c13-b376-0195a7461525/iiif/7168,6144,224,126/224,/0/default.jpg'
    );
  });

  it('does not request remote URLs for tiles outside the image', () => {
    expect(
      getIiifTileUrl({
        ...baseOptions,
        coords: { x: 8, y: 0, z: 3 },
      })
    ).toMatch(/^data:image\/gif;base64,/);
  });
});
