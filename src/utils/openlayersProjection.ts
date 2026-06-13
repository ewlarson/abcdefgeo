import proj4 from 'proj4';
import { fromEPSGCode, isRegistered, register } from 'ol/proj/proj4.js';

const registeredProjectionCodes = new Set<string>();

function normalizeEpsgCode(code: string | null | undefined): string | null {
  if (!code) return null;

  const match = code.trim().match(/^(?:EPSG:)?(\d+)$/i);
  if (!match) return null;

  return `EPSG:${match[1]}`;
}

function getLocalUtmDefinition(epsgNumber: number): string | null {
  if (epsgNumber >= 26901 && epsgNumber <= 26960) {
    const zone = epsgNumber - 26900;
    return `+proj=utm +zone=${zone} +datum=NAD83 +units=m +no_defs +type=crs`;
  }

  if (epsgNumber >= 32601 && epsgNumber <= 32660) {
    const zone = epsgNumber - 32600;
    return `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs +type=crs`;
  }

  if (epsgNumber >= 32701 && epsgNumber <= 32760) {
    const zone = epsgNumber - 32700;
    return `+proj=utm +zone=${zone} +south +datum=WGS84 +units=m +no_defs +type=crs`;
  }

  return null;
}

function ensureProj4Registered() {
  if (!isRegistered()) {
    register(proj4);
  }
}

export async function ensureOpenLayersProjection(
  code: string | null | undefined
) {
  const normalizedCode = normalizeEpsgCode(code);
  if (
    !normalizedCode ||
    normalizedCode === 'EPSG:3857' ||
    normalizedCode === 'EPSG:4326' ||
    registeredProjectionCodes.has(normalizedCode)
  ) {
    return;
  }

  const epsgNumber = Number(normalizedCode.slice('EPSG:'.length));
  const localDefinition = getLocalUtmDefinition(epsgNumber);

  if (localDefinition) {
    proj4.defs(normalizedCode, localDefinition);
    register(proj4);
    registeredProjectionCodes.add(normalizedCode);
    return;
  }

  ensureProj4Registered();
  await fromEPSGCode(epsgNumber);
  registeredProjectionCodes.add(normalizedCode);
}
