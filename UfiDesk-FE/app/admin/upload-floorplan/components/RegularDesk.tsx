import { Direction } from "~/admin/upload-floorplan/types/deskiunfo.types";

interface DeskIconProps {
  size?: number;
  strokeColor?: string;
  bgColor?: string;
  hasMonitor?: boolean;
  direction?: Direction;
}

export function RegularDeskIcon({
  size = 48,
  strokeColor = "black",
  bgColor = "transparent",
  hasMonitor = true,
  direction = Direction.Up,
}: DeskIconProps) {
  // Calculate rotation based on direction
  const getRotation = () => {
    switch (direction) {
      case Direction.Up:
        return 0;
      case Direction.Right:
        return 90;
      case Direction.Down:
        return 180;
      case Direction.Left:
        return 270;
      default:
        return 0;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={`rotate(${getRotation()} 12 12)`}>
        {/* Desk surface */}
        <rect
          x="3"
          y="8"
          width="18"
          height="10"
          rx="1"
          stroke={strokeColor}
          strokeWidth="1.5"
          fill={bgColor}
        />

        {/* Monitor frame */}
        {hasMonitor && (
          <>
            <rect
              x="9"
              y="10"
              width="6"
              height="4"
              rx="0.5"
              fill={strokeColor}
            />

            {/* Monitor screen (cut out) */}
            <rect
              x="9.5"
              y="10.5"
              width="5"
              height="3"
              rx="0.3"
              fill={bgColor === "transparent" ? "white" : bgColor}
            />

            {/* Monitor stand */}
            <rect x="11" y="14" width="2" height="1.5" fill={strokeColor} />
          </>
        )}

        {/* Chair seat */}
        <rect
          x="9"
          y="19"
          width="6"
          height="2"
          rx="0.5"
          stroke={strokeColor}
          strokeWidth="1.5"
          fill={bgColor}
        />

        {/* Chair backrest (curved top) */}
        <path
          d="M 9 19 Q 9 17.5 10 17.5 L 14 17.5 Q 15 17.5 15 19"
          stroke={strokeColor}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Chair base/wheels */}
        <circle cx="10.5" cy="21.5" r="0.5" fill={strokeColor} />
        <circle cx="13.5" cy="21.5" r="0.5" fill={strokeColor} />
      </g>
    </svg>
  );
}

export default RegularDeskIcon;
