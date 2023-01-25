import './App.css';

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
    return (
        <svg width={props.width} height={props.height}>
            <rect x="0" y="0" width={props.width} height={props.height} fill="lightgrey" />
            <g>
                {
                    props.vertices.map((v) => <circle key={v.key} cx={Math.random() * props.width} cy={Math.random() * props.height} r="5" />)
                }
            </g>
        </svg>
    );
}

export default App;
