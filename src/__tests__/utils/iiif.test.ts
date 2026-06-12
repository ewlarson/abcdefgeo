import { describe, expect, it } from 'vitest';
import { buildPresentation3ManifestFromImageInfo } from '../../utils/iiif';

type JsonObject = Record<string, unknown>;

function getPaintingBody(manifest: JsonObject): JsonObject {
  const canvases = manifest.items as JsonObject[];
  const canvas = canvases[0];
  const annotationPages = canvas.items as JsonObject[];
  const annotationPage = annotationPages[0];
  const annotations = annotationPage.items as JsonObject[];
  return annotations[0].body as JsonObject;
}

describe('buildPresentation3ManifestFromImageInfo', () => {
  it('describes IIIF Image API 2 services as ImageService2', () => {
    const manifest = buildPresentation3ManifestFromImageInfo({
      manifestId: 'https://example.com/iiif/info.json/manifest',
      imageServiceId: 'https://example.com/iiif',
      info: {
        '@context': 'http://iiif.io/api/image/2/context.json',
        '@id': 'https://example.com/iiif',
        width: 1200,
        height: 800,
        profile: ['http://iiif.io/api/image/2/level0.json'],
      },
    });

    const body = getPaintingBody(manifest);
    const services = body.service as JsonObject[];

    expect(body.id).toBe('https://example.com/iiif/full/full/0/default.jpg');
    expect(services[0]).toMatchObject({
      id: 'https://example.com/iiif',
      type: 'ImageService2',
      profile: 'http://iiif.io/api/image/2/level0.json',
    });
  });

  it('describes IIIF Image API 3 services as ImageService3', () => {
    const manifest = buildPresentation3ManifestFromImageInfo({
      manifestId: 'https://example.com/iiif/manifest',
      imageServiceId: 'https://example.com/iiif',
      info: {
        '@context': 'http://iiif.io/api/image/3/context.json',
        id: 'https://example.com/iiif',
        width: 1200,
        height: 800,
        profile: 'level2',
      },
    });

    const body = getPaintingBody(manifest);
    const services = body.service as JsonObject[];

    expect(body.id).toBe('https://example.com/iiif/full/max/0/default.jpg');
    expect(services[0]).toMatchObject({
      id: 'https://example.com/iiif',
      type: 'ImageService3',
      profile: 'level2',
    });
  });
});
