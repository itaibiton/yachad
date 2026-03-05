/** Interpolate points along a great-circle arc for a smooth curve. */
export function greatCirclePoints(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  segments = 80
): google.maps.LatLngLiteral[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const lat1 = toRad(start.lat);
  const lng1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lng2 = toRad(end.lng);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.pow(Math.sin((lng2 - lng1) / 2), 2)
      )
    );

  if (d < 1e-10) return [start, end];

  const points: google.maps.LatLngLiteral[] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x =
      A * Math.cos(lat1) * Math.cos(lng1) +
      B * Math.cos(lat2) * Math.cos(lng2);
    const y =
      A * Math.cos(lat1) * Math.sin(lng1) +
      B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    points.push({
      lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
      lng: toDeg(Math.atan2(y, x)),
    });
  }
  return points;
}

/** Build a colored circle SVG data-URL for marker icons. */
export function circleIcon(color: string, size = 32) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
