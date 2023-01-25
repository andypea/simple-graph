import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
        <SimpleGraph width="300" height="300" />
    </div>
  );
}

function SimpleGraph(props) {
    return (
        <svg width={props.width} height={props.height}>
            <g>
                <circle cx="0" cy="0" r="5" />
                <circle cx={props.width} cy="0" r="5" />
                <circle cx="0" cy={props.height} r="5" />
                <circle cx={props.width} cy={props.height} r="5" />
                <circle cx={props.width / 2} cy={props.height / 2} r="5" />
            </g>
        </svg>
    );
}

export default App;
