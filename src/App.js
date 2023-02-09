import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
    return (
        <div className="App">
            <SimpleGraph 
                width="500" 
                height="500" 
                vertices={[
                    {id: "One", fill: "red", label: "One"},
                    {id: "Two", fill: "orange", label: "Two"},
                    {id: "Three", fill: "yellow", label: "Three"},
                    {id: "Four", fill: "green", label: "Four"},
                    {id: "Five", fill: "blue", label: "Five"},
                    {id: "A", fill: "indigo", label: "A"},
                    {id: "B", fill: "violet", label: "B"},
                    {id: "C", fill: "black", label: "C"},
                ]}
                edges={[
                    {id: "OneTwo", source: "One", target: "Two", length: 200},
                    {id: "OneThree", source: "One", target: "Three", length: 200},
                    {id: "OneFour", source: "One", target: "Four", length: 200},
                    {id: "OneFive", source: "One", target: "Five", length: 200},
                    {id: "TwoThree", source: "Two", target: "Three", length: 200},
                    {id: "TwoFour", source: "Two", target: "Four", length: 200},
                    {id: "TwoFive", source: "Two", target: "Five", length: 200},
                    {id: "ThreeFour", source: "Three", target: "Four", length: 200},
                    {id: "ThreeFive", source: "Three", target: "Five", length: 200},
                    {id: "FourFive", source: "Four", target: "Five", length: 200},
                    {id: "AB", source: "A", target: "B", length: 100},
                    {id: "AC", source: "A", target: "C", length: 100},
                    {id: "BC", source: "B", target: "C", length: 100},
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
        const source = oldVerticesPositions.get(e.source);
        const target = oldVerticesPositions.get(e.target);

        const distance = Math.sqrt(Math.pow(target.cx - source.cx, 2) + Math.pow(target.cy - source.cy, 2));
        const forceScalar = springConstant * (distance - e.length);

        const forceAToB = { 
            x: forceScalar * (target.cx - source.cx) / distance,
            y: forceScalar * (target.cy - source.cy) / distance 
        };

        const forceA = forces.get(e.source);
        forceA.x = forceA.x + forceAToB.x;
        forceA.y = forceA.y + forceAToB.y;

        forces.set(source.id, forceA)

        const forceB = forces.get(e.target);
        forceB.x = forceB.x - forceAToB.x;
        forceB.y = forceB.y - forceAToB.y;

        forces.set(target.id, forceB)
    };

    return new Map([...oldVerticesPositions.entries()].map(entry => [entry[0], {
        ...entry[1],
        cx: clamp(entry[1].cx + (entry[1].frozen ? 0 : 1) * timeStep * entry[1].vx, 0, width),
        cy: clamp(entry[1].cy + (entry[1].frozen ? 0 : 1) * timeStep * entry[1].vy, 0, height),
        vx: entry[1].frozen ? 0 : (entry[1].vx + timeStep * forces.get(entry[0]).x),
        vy: entry[1].frozen ? 0 : (entry[1].vy + timeStep * forces.get(entry[0]).y)
    }]))
};


function SimpleGraph(props) {
    const [verticesPositions, setVerticesPositions] = useState(new Map(props.vertices.map((v) => ([
        v.id, 
        {
            cx: Math.random() * props.width, 
            cy: Math.random() * props.height,
            vx: 0,
            vy: 0,
            frozen: false,
            fill: v.fill,
            label: v.label
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
    }, [props.width, props.height, props.edges]);

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
            <rect x="0" y="0" width={props.width} height={props.height} fill="none" stroke="black" />
            <g>
                <g>
                    {
                        props.edges.map(e => {
                            return (
                                <Edge 
                                    key={e.id} 
                                    positionA={verticesPositions.get(e.source)} 
                                    positionB={verticesPositions.get(e.target)}
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
                            fill={v.fill}
                            label={v.label}
                        />)
                    }
                </g>
            </g>
        </svg>
    );
}

const Vertex = (props) => 
{
    const thisVertex = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({x: 0, y: 0});

    const handleOnPointerDown = (event) => {
        thisVertex.current.setPointerCapture(event.pointerId);

        setDragging(true);
        props.freezeVertex(props.id);

        //const screenToLocalTransformationMatrix = thisVertex.current.getScreenCTM();
        const pointerScreenPosition = new DOMPointReadOnly(event.pageX, event.pageY);
        //const pointerLocalPosition = pointerScreenPosition.matrixTransform(screenToLocalTransformationMatrix.inverse());
        setOffset({x: pointerScreenPosition.x - props.cx, y: pointerScreenPosition.y - props.cy});
    };

    const handleOnPointerMove = (event) => {
        if (dragging) {
            //const screenToLocalTransformationMatrix = thisVertex.current.getScreenCTM();
            const pointerScreenPosition = new DOMPointReadOnly(event.pageX, event.pageY);
            //const pointerLocalPosition = pointerScreenPosition.matrixTransform(screenToLocalTransformationMatrix.inverse());
            props.moveVertex(props.id, {x: pointerScreenPosition.x - offset.x, y: pointerScreenPosition.y - offset.y});
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
            <Star 
                outerRadius="10" 
                fill={props.fill}
            />
            <text dominantBaseline="middle" 
                  textAnchor="middle" 
                  y="20"
                  stroke="white"
                  strokeWidth="5"
                  style={{userSelect: "none"}}>
                {props.label}
            </text>
            <text dominantBaseline="middle" 
                  textAnchor="middle" 
                  y="20"
                  style={{userSelect: "none"}}>
                {props.label}
            </text>
        </g>
    );
}

const Edge = (props) => {
    return (
        <line 
            x1={props.positionA.cx} 
            y1={props.positionA.cy} 
            x2={props.positionB.cx} 
            y2={props.positionB.cy} 
            stroke="grey"
        />
    );
}

const Star = ({outerRadius = 10, innerRadiusRatio = 0.5, numPoints = 5, fill="yellow"}) => {
    const theta = Math.PI / numPoints;
    const angularPoints = Array.from(Array(2 * numPoints), (_, i) => ({
        angle: i * theta, 
        r: ((i % 2) === 0) ? outerRadius : (innerRadiusRatio * outerRadius)
    }))

    const cartesianPoints = angularPoints.map(({angle, r}) => ({
        x: r * Math.cos(angle), 
        y: r * Math.sin(angle) 
    }))

    const pathHeadString = `M ${cartesianPoints[0].x}, ${cartesianPoints[0].y}`;
    const pathMiddleString = cartesianPoints.slice(1, cartesianPoints.length).map(({x, y}) => `L ${x}, ${y}`).join(" ");
    const pathTailString = "Z";

    const pathString = "".concat(pathHeadString, " ", pathMiddleString, " ", pathTailString); 
                        

    return (
        <g>
            <path d={pathString} 
            fill={fill}
            stroke="black" />
        </g>
    );
}

const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

export default App;

