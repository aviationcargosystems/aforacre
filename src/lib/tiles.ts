/**
 * Web Mercator tile maths, so a static image can stand in for a live map.
 *
 * Nine Leaflet instances on the homepage would mean nine sets of DOM layers,
 * listeners and animation frames for what are really nine static pictures. A
 * tile is already a picture: fetch the tiles around a point and shift them so
 * the point lands dead centre, and the result is accurate to the pixel without
 * any of that cost.
 */

export interface TileMosaic {
  /** Four tile URLs in reading order: top-left, top-right, bottom-left, bottom-right. */
  urls: string[];
  /**
   * How far the 2x2 block must be shifted, as a fraction of one tile, to bring
   * the point to the centre of the frame. Always within +/- 0.5, so at least
   * half a tile of map remains on every side.
   */
  shiftX: number;
  shiftY: number;
}

function fractionalTile(lat: number, lng: number, zoom: number) {
  const scale = 2 ** zoom;
  const latRad = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * scale,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale,
  };
}

/**
 * Carto Positron, the same basemap as the corridor map, so the thumbnails read
 * as part of the same drawing rather than a different product's map.
 *
 * A 2x2 block is the smallest that can always centre the point: a single tile
 * would leave a village sitting in the corner whenever it fell near a tile
 * boundary, which is most of the time.
 */
export function positronMosaic(lat: number, lng: number, zoom = 13): TileMosaic {
  const { x, y } = fractionalTile(lat, lng, zoom);
  // The block starts at the tile before the nearest boundary, which puts the
  // point somewhere in the middle half of the block.
  const x0 = Math.round(x) - 1;
  const y0 = Math.round(y) - 1;

  const urls: string[] = [];
  for (let dy = 0; dy < 2; dy += 1) {
    for (let dx = 0; dx < 2; dx += 1) {
      urls.push(`https://a.basemaps.cartocdn.com/light_all/${zoom}/${x0 + dx}/${y0 + dy}@2x.png`);
    }
  }

  return { urls, shiftX: x - x0 - 1, shiftY: y - y0 - 1 };
}
