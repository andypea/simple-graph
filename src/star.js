export const Star = ({
  outerRadius = 10,
  innerRadiusRatio = 0.5,
  numPoints = 5,
  fill = "yellow",
}) => {
  const theta = Math.PI / numPoints;
  const angularPoints = Array.from(Array(2 * numPoints), (_, i) => ({
    angle: i * theta,
    r: i % 2 === 0 ? outerRadius : innerRadiusRatio * outerRadius,
  }));

  const cartesianPoints = angularPoints.map(({ angle, r }) => ({
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
  }));

  const pathHeadString = `M ${cartesianPoints[0].x}, ${cartesianPoints[0].y}`;
  const pathMiddleString = cartesianPoints
    .slice(1, cartesianPoints.length)
    .map(({ x, y }) => `L ${x}, ${y}`)
    .join(" ");
  const pathTailString = "Z";

  const pathString = "".concat(
    pathHeadString,
    " ",
    pathMiddleString,
    " ",
    pathTailString
  );

  return (
    <g>
      <path d={pathString} fill={fill} stroke="black" />
    </g>
  );
};

