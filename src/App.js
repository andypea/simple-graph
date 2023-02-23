import { useState, useEffect, useRef } from "react";

const reconcileVertexPositions = (
  vertices,
  oldVerticesPositions,
  width,
  height
) => {
  const newVerticesPositions = new Map();

  for (const vertex of vertices) {
    if (oldVerticesPositions.has(vertex.id)) {
      newVerticesPositions.set(vertex.id, oldVerticesPositions.get(vertex.id));
    } else {
      newVerticesPositions.set(vertex.id, {
        cx: Math.random() * width,
        cy: Math.random() * height,
        vx: 0,
        vy: 0,
        frozen: false,
      });
    }
  }

  return newVerticesPositions;
};

const updateVerticesPositions = (
  oldVerticesPositions,
  width,
  height,
  friction,
  timeStep,
  edges,
  springConstant,
  vertices
) => {
  // First create a new Map containing all the vertices listed.
  const newVerticesPositions = reconcileVertexPositions(
    vertices,
    oldVerticesPositions,
    width,
    height
  );

  const forces = new Map(vertices.map((vertex) => [vertex.id, { x: 0, y: 0 }]));

  for (const vertex of vertices) {
    const vertexPosition = newVerticesPositions.get(vertex.id);
    const force = forces.get(vertex.id);

    forces.set(vertex.id, {
      x: force.x - friction * vertexPosition.vx,
      y: force.y - friction * vertexPosition.vy,
    });
  }

  for (const e of edges) {
    if (
      !newVerticesPositions.has(e.source) ||
      !newVerticesPositions.has(e.target)
    ) {
      continue;
    }

    // TODO: Check both vertices exist!
    const source = newVerticesPositions.get(e.source);
    const target = newVerticesPositions.get(e.target);

    const distance = Math.sqrt(
      Math.pow(target.cx - source.cx, 2) + Math.pow(target.cy - source.cy, 2)
    );
    const forceScalar = springConstant * (distance - e.length);

    const forceSourceToTarget = {
      x: (forceScalar * (target.cx - source.cx)) / distance,
      y: (forceScalar * (target.cy - source.cy)) / distance,
    };

    const forceSource = forces.get(e.source);
    forces.set(e.source, {
      x: forceSource.x + forceSourceToTarget.x,
      y: forceSource.y + forceSourceToTarget.y,
    });

    const forceTarget = forces.get(e.target);
    forces.set(e.target, {
      x: forceTarget.x - forceSourceToTarget.x,
      y: forceTarget.y - forceSourceToTarget.y,
    });
  }

  for (const vertex of vertices) {
    const oldPosition = newVerticesPositions.get(vertex.id);
    newVerticesPositions.set(vertex.id, {
      cx: clamp(
        oldPosition.cx +
          (oldPosition.frozen ? 0 : 1) * timeStep * oldPosition.vx,
        0,
        width
      ),
      cy: clamp(
        oldPosition.cy +
          (oldPosition.frozen ? 0 : 1) * timeStep * oldPosition.vy,
        0,
        height
      ),
      vx: oldPosition.frozen
        ? 0
        : oldPosition.vx + timeStep * forces.get(vertex.id).x,
      vy: oldPosition.frozen
        ? 0
        : oldPosition.vy + timeStep * forces.get(vertex.id).y,
      frozen: oldPosition.frozen,
    });
  }

  return newVerticesPositions;
};

export function SimpleGraph({render = (fill, label) => <VertexDisplay fill={fill} label={label} />, width = 100, height = 100, ...props} = {}) {
  const [verticesPositions, setVerticesPositions] = useState(new Map());

  const timeStep = 0.005;
  const friction = 10;
  const springConstant = 10;

  useEffect(() => {
    let frameId = null;

    function onFrame() {
      setVerticesPositions((oldVerticesPositions) =>
        updateVerticesPositions(
          oldVerticesPositions,
          width,
          height,
          friction,
          timeStep,
          props.edges,
          springConstant,
          props.vertices
        )
      );

      frameId = requestAnimationFrame(onFrame);
    }

    function start() {
      frameId = requestAnimationFrame(onFrame);
    }

    function stop() {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    start();
    return () => stop();
  }, [width, height, props.edges, props.vertices]);

  const moveVertex = (id, position) => {
    setVerticesPositions((oldVerticesPositions) =>
      new Map(oldVerticesPositions.entries()).set(id, {
        ...oldVerticesPositions.get(id),
        cx: position.x,
        cy: position.y,
      })
    );
  };

  const freezeVertex = (id) => {
    setVerticesPositions((oldVerticesPositions) =>
      new Map(oldVerticesPositions.entries()).set(id, {
        ...oldVerticesPositions.get(id),
        frozen: true,
      })
    );
  };

  const unfreezeVertex = (id) => {
    setVerticesPositions((oldVerticesPositions) =>
      new Map(oldVerticesPositions.entries()).set(id, {
        ...oldVerticesPositions.get(id),
        frozen: false,
      })
    );
  };

  return (
    <svg width={width} height={height}>
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="none"
        stroke="black"
      />
      <g>
        <g>
          {props.edges
            .filter(
              (e) =>
                verticesPositions.has(e.source) &&
                verticesPositions.has(e.target)
            )
            .map((e) => {
              return (
                <Edge
                  key={e.id}
                  source={verticesPositions.get(e.source)}
                  target={verticesPositions.get(e.target)}
                />
              );
            })}
        </g>
        <g>
          {props.vertices
            .filter((v) => verticesPositions.has(v.id))
            .map((v) => {
              const position = verticesPositions.get(v.id);
              return (
                <Vertex
                  key={v.id}
                  id={v.id}
                  cx={position.cx}
                  cy={position.cy}
                  moveVertex={moveVertex}
                  freezeVertex={freezeVertex}
                  unfreezeVertex={unfreezeVertex}
                  fill={v.fill}
                  label={v.label}
                  render={render}
                />
              );
            })}
        </g>
      </g>
    </svg>
  );
}

const Vertex = (props) => {
  const thisVertex = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleOnPointerDown = (event) => {
    thisVertex.current.setPointerCapture(event.pointerId);

    setDragging(true);
    props.freezeVertex(props.id);

    //const screenToLocalTransformationMatrix = thisVertex.current.getScreenCTM();
    const pointerScreenPosition = new DOMPointReadOnly(
      event.pageX,
      event.pageY
    );
    //const pointerLocalPosition = pointerScreenPosition.matrixTransform(screenToLocalTransformationMatrix.inverse());
    setOffset({
      x: pointerScreenPosition.x - props.cx,
      y: pointerScreenPosition.y - props.cy,
    });
  };

  const handleOnPointerMove = (event) => {
    if (dragging) {
      //const screenToLocalTransformationMatrix = thisVertex.current.getScreenCTM();
      const pointerScreenPosition = new DOMPointReadOnly(
        event.pageX,
        event.pageY
      );
      //const pointerLocalPosition = pointerScreenPosition.matrixTransform(screenToLocalTransformationMatrix.inverse());
      props.moveVertex(props.id, {
        x: pointerScreenPosition.x - offset.x,
        y: pointerScreenPosition.y - offset.y,
      });
    }
  };

  const handleOnPointerUp = (event) => {
    setDragging(false);
    props.unfreezeVertex(props.id);
    thisVertex.current.releasePointerCapture(event.pointerId);
  };

  return (
    <g
      ref={thisVertex}
      transform={`translate(${props.cx} ${props.cy})`}
      onPointerDown={handleOnPointerDown}
      onPointerMove={handleOnPointerMove}
      onPointerUp={handleOnPointerUp}
    >
      {props.render(props.fill, props.label)}
    </g>
  );
};

const VertexDisplay = (props) => {
  return (
    <g>
      <Star outerRadius="10" fill={props.fill} />
      <text
        dominantBaseline="middle"
        textAnchor="middle"
        y="20"
        stroke="white"
        strokeWidth="5"
        style={{ userSelect: "none" }}
      >
        {props.label}
      </text>
      <text
        dominantBaseline="middle"
        textAnchor="middle"
        y="20"
        style={{ userSelect: "none" }}
      >
        {props.label}
      </text>
    </g>
  );
};

const Edge = (props) => {
  return (
    <line
      x1={props.source.cx}
      y1={props.source.cy}
      x2={props.target.cx}
      y2={props.target.cy}
      stroke="grey"
    />
  );
};

const Star = ({
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

const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

