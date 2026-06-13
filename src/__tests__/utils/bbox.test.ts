import { describe, expect, it } from 'vitest';
import {
  getStaticMapSearchEnvelope,
  normalizeBboxSearchEnvelope,
  normalizeSearchLongitude,
} from '../../utils/bbox';

describe('getStaticMapSearchEnvelope', () => {
  it('returns a valid northwest/southeast envelope around the center point', () => {
    const envelope = getStaticMapSearchEnvelope(39.1702, -86.5235, 15);

    expect(envelope.topLeft.lat).toBeGreaterThan(39.1702);
    expect(envelope.topLeft.lon).toBeLessThan(-86.5235);
    expect(envelope.bottomRight.lat).toBeLessThan(39.1702);
    expect(envelope.bottomRight.lon).toBeGreaterThan(-86.5235);
  });

  it('gets tighter as zoom increases', () => {
    const zoom14 = getStaticMapSearchEnvelope(39.1702, -86.5235, 14);
    const zoom16 = getStaticMapSearchEnvelope(39.1702, -86.5235, 16);
    const zoom14Width = zoom14.bottomRight.lon - zoom14.topLeft.lon;
    const zoom16Width = zoom16.bottomRight.lon - zoom16.topLeft.lon;

    expect(zoom16Width).toBeLessThan(zoom14Width);
  });
});

describe('normalizeSearchLongitude', () => {
  it('wraps longitudes into the search range', () => {
    expect(normalizeSearchLongitude(190)).toBe(-170);
    expect(normalizeSearchLongitude(-190)).toBe(170);
    expect(normalizeSearchLongitude(180)).toBe(180);
  });
});

describe('normalizeBboxSearchEnvelope', () => {
  it('normalizes swapped latitude and wrapped longitude bounds', () => {
    expect(normalizeBboxSearchEnvelope(190, 45, 200, 40)).toEqual({
      topLeft: { lat: 45, lon: -170 },
      bottomRight: { lat: 40, lon: -160 },
    });
  });

  it('returns world longitude bounds for full-world spans', () => {
    expect(normalizeBboxSearchEnvelope(-540, -10, 540, 10)).toEqual({
      topLeft: { lat: 10, lon: -180 },
      bottomRight: { lat: -10, lon: 180 },
    });
  });

  it('rejects zero-area boxes', () => {
    expect(normalizeBboxSearchEnvelope(-90, 40, -90, 45)).toBeNull();
    expect(normalizeBboxSearchEnvelope(-90, 40, -95, 40)).toBeNull();
  });
});
