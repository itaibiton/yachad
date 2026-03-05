/**
 * Custom HTML marker for AdvancedMarker — renders a colored circle dot
 * with a floating label above it.
 */
interface MapMarkerDotProps {
  color: string;
  label: string;
}

export function MapMarkerDot({ color, label }: MapMarkerDotProps) {
  return (
    <div className="flex flex-col items-center" style={{ transform: "translate(0, 50%)" }}>
      <span
        className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-md"
        style={{ backgroundColor: "rgba(0,0,0,0.65)", marginBottom: 4 }}
      >
        {label}
      </span>
      <div
        className="size-3.5 rounded-full shadow-md"
        style={{
          backgroundColor: color,
          border: "2px solid white",
        }}
      />
    </div>
  );
}
