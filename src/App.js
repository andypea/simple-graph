import './App.css';
import { useState, useEffect } from 'react';

function App() {
  return (
    <div className="App">
        <SimpleGraph width="300" height="300" vertices={[
            {key: "One"},
            {key: "Two"},
            {key: "Three"},
        ]} />
    </div>
  );
}

function SimpleGraph(props) {
    // TODO: Update verticesPositions when props.vertices changes.
    // TODO: Copy all properties across when copying objects.

    const [verticesPositions, setVerticesPositions] = useState(props.vertices.map((v) => ({
        key: v.key, 
        cx: Math.random() * props.width, 
        cy: Math.random() * props.height,
        frozen: false 
    })));

    useEffect(() => {
        let frameId = null;

        function onFrame() {
            setVerticesPositions((oldVerticesPositions) => oldVerticesPositions.map((v) => ({
                key: v.key,
                cx: (v.cx + (v.frozen ? 0 : 1) * 0.5) % props.width,
                cy: (v.cy + (v.frozen ? 0 : 1) * 0.5) % props.height,
                frozen: v.frozen
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

    const toggleFreeze = (key) => {
        setVerticesPositions(oldVerticesPositions => oldVerticesPositions.map(v => ({
            key: v.key,
            cx: v.cx,
            cy: v.cy,
            frozen: v.key === key ? (! v.frozen) : v.frozen
        })));
    }
    
    return (
        <svg width={props.width} height={props.height}>
            <rect x="0" y="0" width={props.width} height={props.height} fill="lightgrey" />
            <g>
                {
                    verticesPositions.map((v) => <circle key={v.key} cx={v.cx} cy={v.cy} r="10" onPointerDown={() => toggleFreeze(v.key)} />)
                }
            </g>
        </svg>
    );
}

export default App;

