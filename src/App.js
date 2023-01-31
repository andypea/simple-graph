import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
  return (
    <div className="App">
        <SimpleGraph width="500" 
                     height="500" 
                     vertices={[
                         {id: "One"},
                         {id: "Two"},
                         {id: "Three"}]}
                     edges={[
                         {id: "OneTwo", vertexA: "One", vertexB: "Two", length: 1},
                         {id: "TwoThree", vertexA: "Two", vertexB: "Three", length: 2},
        ]}/>
    </div>
  );
}

function SimpleGraph(props) {
    // TODO: Update verticesPositions when props.vertices changes.
    // TODO: Copy all properties across when copying objects.
    // TODO: Bug: if SimpleGraph width or height is specified as a percentage.
    // TODO: Check is the dragging works correctly in Safari.
    // TODO: Vertices shouldn't need to pass their own ID to the move, freeze, unfreeze, etc. functions.
    // TODO: Extract the simulation data and code from the React component and make the functions more clearly pure.

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
    const friction = 0.01;
    
    useEffect(() => {
        let frameId = null;

        function onFrame() {
            setVerticesPositions(
                (oldVerticesPositions) => new Map([...oldVerticesPositions.entries()].map(entry => [entry[0], {
                    ...entry[1],
                    cx: (entry[1].cx + (entry[1].frozen ? 0 : 1) * timeStep * entry[1].vx) % props.width,
                    cy: (entry[1].cy + (entry[1].frozen ? 0 : 1) * timeStep * entry[1].vy) % props.height,
                    vx: entry[1].frozen ? 0 : (entry[1].vx - timeStep * Math.sign(entry[1].cx - props.width / 2) * Math.pow(entry[1].cx - props.width / 2, 2) - friction * entry[1].vx),
                    vy: entry[1].frozen ? 0 : (entry[1].vy - timeStep * Math.sign(entry[1].cy - props.width / 2) * Math.pow(entry[1].cy - props.width / 2, 2) - friction * entry[1].vy)
                }]))
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

