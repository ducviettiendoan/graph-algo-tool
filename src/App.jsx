import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Dfs from './component/Dfs';
import Bfs from './component/Bfs';
import Nav from './component/Nav';
import Home from './component/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// const elements = [
//   { data: { id: 'one', label: 'Node 1' }, position: { x: 400, y: 250} },
//   { data: { id: 'two', label: 'Node 2' }, position: { x: 500, y: 250} },
//   { data: { id: 'three', label: 'Node 3' }, position: { x: 500, y: 350} },
//   { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
//   { data: { source: 'one', target: 'three', label: 'Edge from Node1 to Node3' } }
// ];

function App() {
  const cyRef = React.useRef();
  const [elements, setElements] = React.useState([]);
  //test animation
  // cyRef.current ? console.log(cyRef.current.elements()):console.log('@@');
  if (cyRef.current){
    cyRef.current.style()
      .selector('node')
        .style({'label':'data(id)'})
        .css({
          'content': 'data(id)'
        })
      .selector('edge')
        .css({
          // 'target-arrow-shape': 'triangle',
          'width': 4,
          'line-color': '#ddd',
          // 'target-arrow-color': '#ddd',
          'curve-style': 'bezier'
        })
      .selector('.highlighted')
        .css({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          // 'target-arrow-color': '#61bffc',
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'
        })
    cyRef.current.zoomingEnabled(false);
  }
  return (
    <>
      <BrowserRouter>
        <Nav/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/bfs" element={<Bfs cyRef = {cyRef.current} elements = {elements} setElements = {setElements}/>} />
          <Route path="/dfs" element={<Dfs cyRef = {cyRef.current} elements = {elements} setElements = {setElements}/>} />
        </Routes>
      </BrowserRouter>
      <div style={{display:"flex", justifyContent:"center"}}>
        <CytoscapeComponent 
          cy={(cy)=>{cyRef.current = cy}}
          style={{width:'900px', height:'900px'}}
          elements={elements}   
        />
      </div>
    </>
  );
}

export default App;
