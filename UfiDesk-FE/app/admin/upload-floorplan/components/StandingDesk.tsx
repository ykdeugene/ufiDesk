import { Direction } from "~/admin/upload-floorplan/types/deskiunfo.types";

interface DeskIconProps {
  size?: number;
  strokeColor?: string;
  bgColor?: string;
  hasMonitor?: boolean;
  direction?: Direction;
}

export function StandingDeskIcon({
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
        {/* Desk surface - circular */}
        <circle
          cx="12"
          cy="12"
          r="8"
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

        {/* Person's head (circle representing user standing at desk) */}
        <circle
          cx="12"
          cy={hasMonitor ? "22" : "2"}
          r="2"
          stroke={strokeColor}
          strokeWidth="1"
          fill="none"
        />
      </g>
    </svg>
  );
}

export default StandingDeskIcon;
