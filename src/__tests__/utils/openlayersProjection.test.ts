import { describe, expect, it } from 'vitest';
import { transform } from 'ol/proj';
import { ensureOpenLayersProjection } from '../../utils/openlayersProjection';

describe('openlayersProjection', () => {
  it('registers NAD83 UTM zone projections used by COG metadata', async () => {
    await ensureOpenLayersProjection('EPSG:26911');

    const webMercator = transform(
      [694661.1399468984, 3983100.1619066237],
      'EPSG:26911',
      'EPSG:3857'
    );

    expect(webMercator[0]).toBeCloseTo(-12784048, 0);
    expect(webMercator[1]).toBeCloseTo(4296896, 0);
  });
});
