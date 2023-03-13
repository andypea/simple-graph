import { useState, useEffect, useRef } from "react";
import { updateVerticesPositions } from "./numericalSimulation.js";

export function SimpleGraph({render = (fill, label) => <DefaultVertexElement fill={fill} label={label} />, width = 100, height = 100, ...props} = {}) {
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

const DefaultVertexElement = (props) => {
  return (
    <g>
      <circle r="5" fill={props.fill} stroke="black" />
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

