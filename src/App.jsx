import './App.css';
import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Button, duration, TextField } from '@mui/material';

const POSITION_X = 400;
const POSITION_Y = 250;

// const elements = [
//   { data: { id: 'one', label: 'Node 1' }, position: { x: 400, y: 250} },
//   { data: { id: 'two', label: 'Node 2' }, position: { x: 500, y: 250} },
//   { data: { id: 'three', label: 'Node 3' }, position: { x: 500, y: 350} },
//   { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
//   { data: { source: 'one', target: 'three', label: 'Edge from Node1 to Node3' } }
// ];
const handleAddNode = (addNode,elements,setElements,nodes,setNodes,cyRef) => {
  const random_x = Math.floor(Math.random() * 100) + 1;
  const add_x = random_x > 50 ? random_x:random_x-100;
  const add_y = Math.floor(Math.random() * 100) + 50;
  console.log(add_x,add_y);
  let new_node = {};
  elements.length === 0 ? new_node = { data: { id: `${addNode}`, label: `Node ${addNode}` }, position: { x: POSITION_X, y: POSITION_Y} } : 
  new_node = { data: { id: `${addNode}`, label: `Node ${addNode}` }, position: { x: elements[0].position.x+add_x, y: elements[0].position.y+add_y} } //position based on 1st node
  setElements([...elements, new_node]);
  setNodes([...nodes,new_node.data.id]);
  cyRef.add(new_node);
}

const handleAddEdge = (addEdge,nodes,elements,setElements,cyRef) => {
  let edge = addEdge.split(',');
  //handle edge does not exist
  if (nodes.includes(edge[0]) && nodes.includes(edge[1])){
    let new_edge = { data: { source: `${edge[0]}`, target: `${edge[1]}`, label: `Edge from Node${edge[0]} to Node${edge[1]}`}};
    setElements([...elements, new_edge]);
    cyRef.add(new_edge);
  }else{
    console.error("Cannot add edge!");
  }
}
const handleBfs = (cyRef,begin,orderRender,setOrderRender) => {
  var bfs = cyRef.elements().bfs(`#${begin}`, function(){}, true);
  var i = 0;
  var highlightNextEle = function(){
    if( i < bfs.path.length ){
      bfs.path[i].addClass('highlighted');
      i++;
      setOrderRender([...orderRender,bfs.path[i]])
      setTimeout(highlightNextEle, 1000);
    }
  };
  highlightNextEle();
}
const handleDfs = (cyRef,begin,order,setOrder) => {
  var dfs = cyRef.elements().dfs(`#${begin}`, function(){}, true);
  var i = 0;
  // let queueRender = [];
  var highlightNextEle = function(){
    if( i < dfs.path.length ){
      dfs.path[i].addClass('highlighted');
      if (dfs.path[i].isNode()){
        setOrder(dfs.path[i]._private.data.id);
      }
      i++;
      setTimeout(highlightNextEle, 1000);
    }
  };
  highlightNextEle();
  // console.log(queueRender);
  // setOrderRender(queueRender);
}

function App() {
  const [elements, setElements] = React.useState([]);
  const [newNode, setNewNode] = React.useState(null);
  const [newEdge, setNewEdge] = React.useState(null);
  const [nodes, setNodes] = React.useState([]);
  const [rootNode, setRootNode] = React.useState();
  const [order, setOrder] = React.useState();
  const [orderRender, setOrderRender] = React.useState([]);
  const cyRef = React.useRef();

  React.useEffect(()=>{
    setOrderRender([...orderRender,order]);
  },[order]);
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
          'target-arrow-shape': 'triangle',
          'width': 4,
          'line-color': '#ddd',
          'target-arrow-color': '#ddd',
          'curve-style': 'bezier'
        })
      .selector('.highlighted')
        .css({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'target-arrow-color': '#61bffc',
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'
        })
    cyRef.current.zoomingEnabled(false);
  }
  // console.log(orderRender);
  return (
    <>
      <div>
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => setNewNode(e.target.value)}/>
      <Button variant='contained' onClick={()=>handleAddNode(newNode,elements,setElements,nodes,setNodes,cyRef.current)}>Add node</Button>
      <TextField id="outlined-basic" label="Edge" variant="outlined" onChange={(e) => {setNewEdge(e.target.value)}}/>
      <Button variant='contained' onClick={()=>handleAddEdge(newEdge,nodes,elements,setElements,cyRef.current)}>Add edge</Button>
      </div>
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => setRootNode(e.target.value)}/>
      <Button variant='contained' onClick={()=>handleBfs(cyRef.current,rootNode,orderRender,setOrderRender)}>Run BFS</Button>
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => setRootNode(e.target.value)}/>
      <Button variant='contained' onClick={()=>{handleDfs(cyRef.current,rootNode,order,setOrder)}}>Run DFS</Button>
      <div>
        {orderRender.map((node)=>{
          return(<span>{node}</span>);
        })}
      </div>
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
