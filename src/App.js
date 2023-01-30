import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
  return (
    <div className="App">
        <SimpleGraph width="500" height="500" vertices={[
            {id: "One"},
            {id: "Two"},
            {id: "Three"},
        ]} />
    </div>
  );
}

function SimpleGraph(props) {
    // TODO: Update verticesPositions when props.vertices changes.
    // TODO: Copy all properties across when copying objects.
    // TODO: Bug: if SimpleGraph width or height is specified as a percentage.

    const [verticesPositions, setVerticesPositions] = useState(props.vertices.map((v) => ({
        id: v.id, 
        cx: Math.random() * props.width, 
        cy: Math.random() * props.height,
        frozen: false 
    })));

    useEffect(() => {
        let frameId = null;

        function onFrame() {
            setVerticesPositions((oldVerticesPositions) => oldVerticesPositions.map((v) => ({
                ...v,
                cx: (v.cx + (v.frozen ? 0 : 1) * 0.5) % props.width,
                cy: (v.cy + (v.frozen ? 0 : 1) * 0.5) % props.height,
            })));

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
            setVerticesPositions((oldVerticesPositions) => oldVerticesPositions.map((v) => ({
                ...v,
                cx: (v.id === id) ? position.x : v.cx, 
                cy: (v.id === id) ? position.y : v.cy, 
            })));
    }

    return (
        <svg width={props.width} height={props.height}>
            <rect x="0" y="0" width={props.width} height={props.height} fill="lightgrey" />
            <g>
                {
                    verticesPositions.map((v) => <Vertex key={v.id} id={v.id} cx={v.cx} cy={v.cy} moveVertex={moveVertex} />)
                }
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

export default App;

