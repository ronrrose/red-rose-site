import { cn } from "@/lib/utils";

interface DotPatternProps {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  /** Unique per instance when more than one pattern renders on a page. */
  patternId?: string;
}

/**
 * A static dotted field for section backdrops. Pure SVG, no JavaScript and no
 * animation, so it costs nothing at runtime. Replaces the drifting `blob`
 * gradient, which read more "startup template" than considered.
 */
export default function DotPattern({
  width = 18,
  height = 18,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  patternId = "rr-dot-pattern",
}: DotPatternProps) {
  const id = patternId;
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-ink/[0.07]",
        className
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}
