import { positronMosaic } from "@/lib/tiles";

/**
 * A village, placed. Four raster tiles shifted so the coordinate lands dead
 * centre, with a marker over it. No map library, no interactivity, no API key.
 */
export function RegionMiniMap({ lat, lng }: { lat: number; lng: number }) {
  const { urls, shiftX, shiftY } = positronMosaic(lat, lng);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f4f2ee]">
      {/* The block is sized in `vmax`-free absolute terms: 2 tiles wide at
          256px each, translated by the sub-tile remainder so the point is
          centred. `left/top: 50%` puts the block's origin at the frame centre
          first, then the negative full-block offset pulls it back. */}
      <div
        className="absolute grid h-[512px] w-[512px] grid-cols-2 grid-rows-2"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(${-(shiftX + 1) * 256}px, ${-(shiftY + 1) * 256}px)`,
        }}
      >
        {urls.map((url) => (
          // Plain <img>: these are fixed-size third-party raster tiles, so
          // next/image's optimiser would add a proxy hop for no saving.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} src={url} alt="" aria-hidden width={256} height={256} className="h-64 w-64" loading="lazy" />
        ))}
      </div>

      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
      <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/18" />
    </div>
  );
}
