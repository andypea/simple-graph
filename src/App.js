import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
  return (
    <div className="App">
        <SimpleGraph 
            width="500" 
            height="500" 
            vertices={[
                {id: "One"},
                {id: "Two"},
                {id: "Three"},
                {id: "Four"},
                {id: "Five"},
                {id: "A"},
                {id: "B"},
                {id: "C"},
            ]}
                     edges={[
                         {id: "OneTwo", vertexA: "One", vertexB: "Two", length: 200},
                         {id: "OneThree", vertexA: "One", vertexB: "Three", length: 200},
                         {id: "OneFour", vertexA: "One", vertexB: "Four", length: 200},
                         {id: "OneFive", vertexA: "One", vertexB: "Five", length: 200},
                         {id: "TwoThree", vertexA: "Two", vertexB: "Three", length: 200},
                         {id: "TwoFour", vertexA: "Two", vertexB: "Four", length: 200},
                         {id: "TwoFive", vertexA: "Two", vertexB: "Five", length: 200},
                         {id: "ThreeFour", vertexA: "Three", vertexB: "Four", length: 200},
                         {id: "ThreeFive", vertexA: "Three", vertexB: "Five", length: 200},
                         {id: "FourFive", vertexA: "Four", vertexB: "Five", length: 200},
                         {id: "AB", vertexA: "A", vertexB: "B", length: 100},
                         {id: "AC", vertexA: "A", vertexB: "C", length: 100},
                         {id: "BC", vertexA: "B", vertexB: "C", length: 100},
        ]}/>
    </div>
  );
}

const updateVerticesPositions = (oldVerticesPositions, width, height, friction, timeStep, edges, springConstant) => {
    const forces = new Map([...oldVerticesPositions.entries()].map((entry) => [entry[0], {x: 0, y: 0}]));

    for (const k of oldVerticesPositions.keys()) {
        const vertex = oldVerticesPositions.get(k);
        const oldForce = forces.get(k);

        forces.set(k, {
            x: oldForce.x - friction * vertex.vx,
            y: oldForce.y - friction * vertex.vy
        })
    }

    for (const e of edges) {
        const vertexA = oldVerticesPositions.get(e.vertexA);
        const vertexB = oldVerticesPositions.get(e.vertexB);

        const distance = Math.sqrt(Math.pow(vertexB.cx - vertexA.cx, 2) + Math.pow(vertexB.cy - vertexA.cy, 2));
        const forceScalar = springConstant * (distance - e.length);

        const forceAToB = { 
            x: forceScalar * (vertexB.cx - vertexA.cx) / distance,
            y: forceScalar * (vertexB.cy - vertexA.cy) / distance 
        };

        const forceA = forces.get(e.vertexA);
        forceA.x = forceA.x + forceAToB.x;
        forceA.y = forceA.y + forceAToB.y;

        forces.set(vertexA.id, forceA)
        
        const forceB = forces.get(e.vertexB);
        forceB.x = forceB.x - forceAToB.x;
        forceB.y = forceB.y - forceAToB.y;

        forces.set(vertexB.id, forceB)
    };

    return new Map([...oldVerticesPositions.entries()].map(entry => [entry[0], {
        ...entry[1],
        cx: (entry[1].cx + (entry[1].frozen ? 0 : 1) * timeStep * entry[1].vx) % width,
        cy: (entry[1].cy + (entry[1].frozen ? 0 : 1) * timeStep * entry[1].vy) % height,
        vx: entry[1].frozen ? 0 : (entry[1].vx + timeStep * forces.get(entry[0]).x),
        vy: entry[1].frozen ? 0 : (entry[1].vy + timeStep * forces.get(entry[0]).y)
    }]))
};


function SimpleGraph(props) {
    // TODO: Update verticesPositions when props.vertices changes.
    // TODO: Copy all properties across when copying objects.
    // TODO: Bug: if SimpleGraph width or height is specified as a percentage.
    // TODO: Check is the dragging works correctly in Safari.
    // TODO: Vertices shouldn't need to pass their own ID to the move, freeze, unfreeze, etc. functions.
    // TODO: Extract the simulation data and code from the React component and make the functions more clearly pure.
    // TODO: Add code to validate the passed in properties.
    // TODO: Replace the graph edge / vertices specs with something more standard.
    // TODO: Add a force that repels neighbouring vertices.
    // TODO: Allow people to customise the vertex and edge appearance.
    // TODO: Make into a WebComponent, usable outside React.

    const [verticesPositions, setVerticesPositions] = useState(new Map(props.vertices.map((v) => ([
        v.id, 
        {
            cx: Math.random() * props.width, 
            cy: Math.random() * props.height,
            vx: 0,
            vy: 0,
            frozen: false 
        }]))));

    const timeStep = 0.005;
    const friction = 10;
    const springConstant = 10;
    
    useEffect(() => {
        let frameId = null;

        function onFrame() {
            setVerticesPositions((oldVerticesPositions) => updateVerticesPositions(oldVerticesPositions, props.width, props.height, friction, timeStep, props.edges, springConstant)); 

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
    }, [props.width, props.height]);

    const moveVertex = (id, position) => {
            setVerticesPositions((oldVerticesPositions) => new Map(oldVerticesPositions.entries()).set(id, {...oldVerticesPositions.get(id), cx: position.x, cy: position.y}))
    };

    const freezeVertex = (id) => {
            setVerticesPositions((oldVerticesPositions) => new Map(oldVerticesPositions.entries()).set(id, {...oldVerticesPositions.get(id), frozen: true}))
    };
    
    const unfreezeVertex = (id) => {
            setVerticesPositions((oldVerticesPositions) =>  new Map(oldVerticesPositions.entries()).set(id, {...oldVerticesPositions.get(id), frozen: false}))
    };

    return (
        <svg width={props.width} height={props.height}>
            <rect x="0" y="0" width={props.width} height={props.height} fill="lightgrey" />
            <g>
                <g>
                    {
                        props.edges.map(e => {
                            return (
                                <Edge 
                                    key={e.id} 
                                    // TODO: Don't pass the whole object here.
                                    positionA={verticesPositions.get(e.vertexA)} 
                                    positionB={verticesPositions.get(e.vertexB)}
                                />
                            )
                    }) 
                    }
                </g>
                <g>
                    {
                        [...verticesPositions.entries()].map(([id, v]) => <Vertex 
                            key={id} 
                            id={id} 
                            cx={v.cx} 
                            cy={v.cy} 
                            moveVertex={moveVertex} 
                            freezeVertex={freezeVertex}
                            unfreezeVertex={unfreezeVertex}
                            />)
                    }
                </g>
            </g>
        </svg>
    );
}

const Vertex = (props) => {
    // TODO: Does this work on Safari (I believe it has a bug in `getScreenCTM`.

    const thisVertex = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({x: 0, y: 0});

    const handleOnPointerDown = (event) => {
        thisVertex.current.setPointerCapture(event.pointerId);
        
        setDragging(true);
        props.freezeVertex(props.id);
            
        const screenToLocalTransformationMatrix = thisVertex.current.getScreenCTM();
        const pointerScreenPosition = new DOMPointReadOnly(event.pageX, event.pageY);
        const pointerLocalPosition = pointerScreenPosition.matrixTransform(screenToLocalTransformationMatrix.inverse());
        setOffset({x: pointerLocalPosition.x - props.cx, y: pointerLocalPosition.y - props.cy});
    };
    
    const handleOnPointerMove = (event) => {
        if (dragging) {
            const screenToLocalTransformationMatrix = thisVertex.current.getScreenCTM();
            const pointerScreenPosition = new DOMPointReadOnly(event.pageX, event.pageY);
            const pointerLocalPosition = pointerScreenPosition.matrixTransform(screenToLocalTransformationMatrix.inverse());
            props.moveVertex(props.id, {x: pointerLocalPosition.x - offset.x, y: pointerLocalPosition.y - offset.y});
        }
    };
    
    const handleOnPointerUp = (event) => {
        setDragging(false);
        props.unfreezeVertex(props.id);
        thisVertex.current.releasePointerCapture(event.pointerId);
    };

    return <circle id={props.id} 
                   cx={props.cx} 
                   cy={props.cy} 
                   r="20" 
                   onPointerDown={handleOnPointerDown} 
                   onPointerMove={handleOnPointerMove} 
                   onPointerUp={handleOnPointerUp} 
                   ref={thisVertex}
                   />
}

const Edge = (props) => {
    // TODO: Refactor so that these positions are just `x` and `y`, not `cx` and `cy`.
    return (
        <line 
            x1={props.positionA.cx} 
            y1={props.positionA.cy} 
            x2={props.positionB.cx} 
            y2={props.positionB.cy} 
            stroke="black"
        />
    );
}

export default App;

