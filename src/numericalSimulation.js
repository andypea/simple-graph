export const updateVerticesPositions = (
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


const clamp = (x, min, max) => Math.min(Math.max(x, min), max);
