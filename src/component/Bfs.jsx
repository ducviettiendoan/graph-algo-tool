import React from 'react';
import { Button, TextField } from '@mui/material';
import { JsonInput } from '@mantine/core';
import BfsDetail from './sbs/BfsDetail';
import { detectInvalid } from '../util/util';

const POSITION_X = 400;
const POSITION_Y = 250;

const addNode = (cyRef,node,setDuplicateN,elements,setElements,nodes,setNodes) => {
  const random_x = Math.floor(Math.random() * 100) + 1;
  const add_x = random_x > 50 ? random_x:random_x-100;
  const add_y = Math.floor(Math.random() * 100) + 50;
  //find whether the node exists in cyRef
  if (cyRef && cyRef.elements(`node#${node}`).size()>0){
    setDuplicateN(true);
    return;
  }
  let new_node = {};
  // elements.length === 0 ? new_node = { data: { id: `${node}`, label: `Node ${node}` }, position: { x: POSITION_X, y: POSITION_Y} } : 
  new_node = { data: { id: `${node}`, label: `Node ${node}` }, position: { x: POSITION_X+add_x, y: POSITION_Y+add_y} } //position based on 1st node
  console.log(new_node);
  setElements([...elements, new_node]);
  setNodes([...nodes,new_node.data.id]);
  console.log("add node");
  if (cyRef){
    cyRef.add(new_node);
  }
}

const handleAddNode = (e,node,elements,setElements,nodes,setNodes,cyRef,inputNode,setDuplicateN,setSbs) => {
  if (e.key==='Enter'){
    setDuplicateN(false);
    setSbs(false);
    addNode(cyRef,node,setDuplicateN,elements,setElements,nodes,setNodes);
    //handle clear TextField value
    if (inputNode.current[0]){
      inputNode.current[0].children[1].children[0].value = null;
    }
  }
}
 
const addEdge = (cyRef,a_edge,nodes,elements,setElements,setDuplicateE) => {
  let edge = a_edge.split(',');
  if (cyRef){
    //find edge exist in cyRef in both way a->b and b->a.
    let a = cyRef.edges(`edge[source="${edge[0]}"][target="${edge[1]}"]`).size();
    let b = cyRef.edges(`edge[source="${edge[1]}"][target="${edge[0]}"]`).size();
    if (a || b){
      setDuplicateE(true);
      return;
    }
  }
  //handle edge does not exist (2 nodes does not exist)
  if (cyRef.elements(`node#${edge[0]}`) && cyRef.elements(`node#${edge[1]}`)){
      let new_edge = { data: { source: `${edge[0]}`, target: `${edge[1]}`, label: `Edge from Node${edge[0]} to Node${edge[1]}`}};
      setElements([...elements, new_edge]);
      if (cyRef){
        cyRef.add(new_edge);
      }
  }else{
      console.error("Cannot add edge!");
  }
}
const handleAddEdge = (e,a_edge,nodes,elements,setElements,cyRef,inputEdge,setDuplicateE,setSbs) => {
  if (e.key==='Enter'){
    setDuplicateE(false);
    setSbs(false);
    addEdge(cyRef,a_edge,nodes,elements,setElements,setDuplicateE);
    //handle clear TextField value
    if (inputEdge.current[0]){
      inputEdge.current[0].children[1].children[0].value = null;
    }
  }
}

const handleAnimationBfs = async(cyRef,begin,order,setOrder,visit) => {
    var bfs = cyRef.elements().bfs(`#${begin}`, function(){});
    var i = 0;
    const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
    var highlightNextEle = async function(){
      if( i < bfs.path.length ){
        bfs.path[i].addClass('highlighted');
        if (bfs.path[i].isNode()){
            if (!visit.has(bfs.path[i])){visit.add(bfs.path[i].data('id'))}
            setOrder(bfs.path[i]);
        }
        i++;
        await timeout(1000);
        await highlightNextEle();
      }
    };
    await highlightNextEle();
    setOrder(null);
}

const handleRemoveAnimation = (cyRef,begin,setOrderRender) => {
  cyRef.elements().map((ele)=>{ele.removeClass('highlighted')})
  setOrderRender([]);
}

const handleBfs = async(cyRef,begin,order,setOrder,setOrderRender,setSbs,setVisualization) => {
  let visit = new Set();
  setSbs(false);
  setVisualization(true);
  //always remove before run in case for sbs is running and interrupt.
  await handleRemoveAnimation(cyRef,begin,setOrderRender);
  await handleAnimationBfs(cyRef,begin,order,setOrder,visit);
  const nodes = cyRef.nodes().map((node)=>{return node.data('id')})
  for (let i=0; i<nodes.length; i++){
    if (!visit.has(nodes[i])){
      await handleAnimationBfs(cyRef,nodes[i],order,setOrder,visit);
    }
  }
  await handleRemoveAnimation(cyRef,begin,setOrderRender);
  setVisualization(false);
}

// get node k and all edges coming out from it
const handleRemoveNode = (cyRef,inputNode,node,setRemoveNode,setSbs)=>{
  //cy selector 
  const removeElements = cyRef.elements(`node#${node}, edge[source = "${node}"]`);
  cyRef.remove(removeElements);
  setRemoveNode("");
  setSbs(false);
  if (inputNode.current[1]){
    inputNode.current[1].children[1].children[0].value = null;
  }
}
const handleRemoveEdge = (cyRef,inputEdge,edge,setRemoveEdge,setSbs) => {
  edge = edge.split(',');
  //cy selector
  const a = cyRef.edges(`edge[source="${edge[0]}"][target="${edge[1]}"]`);
  const b = cyRef.edges(`edge[source="${edge[1]}"][target="${edge[0]}"]`);
  const removeEdge = a.length>0?a:b;
  cyRef.remove(removeEdge);
  setRemoveEdge("");
  setSbs(false);
  if (inputEdge.current[1]){
    inputEdge.current[1].children[1].children[0].value = null;
  }
}

const handleAdjMatrixInput = (cyRef,adjMatrix,setDuplicateN,setDuplicateE,elements,setElements,nodes,setNodes,setValidation) => {
  console.log(adjMatrix);
  if (adjMatrix.length === 0){
    setValidation(false);
    return null;
  }
  console.log(adjMatrix);
  for (let i=0; i<adjMatrix.length;i++){
    if (adjMatrix[i].length !== adjMatrix.length){
      setValidation(false);
      return null;
    }
  }
  console.log(adjMatrix);
  //validate matrix input
  setValidation(true);
  const inputValidate = detectInvalid(adjMatrix,setValidation);
  if (!inputValidate){
    setValidation(false);
    return;
  }
  //add Node
  for (let i=1;i<=adjMatrix.length;i++){
    addNode(cyRef,i,setDuplicateN,elements,setElements,nodes,setNodes);
  }
  //add Edge
  let row = adjMatrix.length;
  let col = adjMatrix[0].length;
  for (let i=0;i<row;i++){
    for (let j=0;j<col;j++){
      if (adjMatrix[i][j] === 1){
        let edge = `${i+1},${j+1}`;
        addEdge(cyRef,edge,nodes,elements,setElements,setDuplicateE);
      }
    }
  }
}

const handleCreateGraphAdjMatrix = (cyRef,setDuplicateN,setDuplicateE,elements,setElements,nodes,setNodes,value,setValidation,setClearGraph) => {
  console.log(value);
  //make sure cyRef is empty
  if (cyRef.elements().length > 0){
    console.log(cyRef.elements(),"Empty your graph!");
    //set state to open a clear graph button.
    setClearGraph(true);
    return;
  }
  handleAdjMatrixInput(cyRef,value,setDuplicateN,setDuplicateE,elements,setElements,nodes,setNodes,setValidation);
}

const handleClearGraph = (cyRef,setClearGraph) => {
  cyRef.elements().map((ele)=> ele.remove());
  setClearGraph(false);
}

const Bfs = (props) =>{
  const [newNode, setNewNode] = React.useState(null);
  const [newEdge, setNewEdge] = React.useState(null);
  const [nodes, setNodes] = React.useState([]);
  const [rootNode, setRootNode] = React.useState();
  const [order, setOrder] = React.useState(null);
  const [orderRender, setOrderRender] = React.useState([]);
  const [removeEdge, setRemoveEdge] = React.useState();
  const [removeNode, setRemoveNode] = React.useState();
  const [duplicateN, setDuplicateN] = React.useState(false);
  const [duplicateE, setDuplicateE] = React.useState(false);
  const [sbs, setSbs] = React.useState(false);
  //visualization true = algo animation is running do not interrupt
  const [visualization, setVisualization] = React.useState(false);

  //adj matrix input validation states
  const [value, setValue] = React.useState('');
  const [adjMatrix, setAdjMatrix] = React.useState([]);
  const [validation, setValidation] = React.useState([]);
  const [clearGraph, setClearGraph] = React.useState(false);

  //this 2 ref are used for multiple components
  const inputNode = React.useRef([]); 
  const inputEdge = React.useRef([]);
  React.useEffect(()=>{ 
    if (orderRender[0]){
      const head = props.cyRef.elements(`node#${orderRender[0]}`)
      const neighbors = head.neighborhood(function( ele ){
        return ele.isNode();
      });
      if (neighbors.length < 2 || neighbors.includes(order)){
        setOrderRender(orderRender.shift());
      }
    }
    order && setOrderRender([...orderRender,order._private.data.id]);
  },[order]);

  console.log(nodes);
  console.log(props.cyRef);
  return (
    <>
      <div>
        <TextField id="outlined-basic" 
          label="Node" 
          variant="outlined" 
          ref={el => inputNode.current[0] = el} 
          onChange={(e) => setNewNode(e.target.value)} 
          onKeyDown={(e)=>handleAddNode(e,newNode,props.elements,props.setElements,nodes,setNodes,props.cyRef,inputNode,setDuplicateN,setSbs)}
        />
        <TextField id="outlined-basic" 
          label="Edge" variant="outlined" 
          ref={el => inputEdge.current[0] = el} 
          onChange={(e) => {setNewEdge(e.target.value)}} 
          onKeyDown={(e)=>handleAddEdge(e,newEdge,nodes,props.elements,props.setElements,props.cyRef,inputEdge,setDuplicateE,setSbs)}
        />
      </div>
      <TextField id="outlined-basic" 
        label="Execute" 
        variant="outlined" 
        onChange={(e) => setRootNode(e.target.value)}
      />
      <Button variant='contained' 
        onClick={()=>{handleBfs(props.cyRef,rootNode,order,setOrder,setOrderRender,setSbs,setVisualization)}}
      >Run BFS</Button>
      <TextField id="outlined-basic" 
        label="Remove Edge" 
        variant="outlined" 
        ref={el => inputEdge.current[1] = el} 
        onChange={(e) => setRemoveEdge(e.target.value)}
      />
      <Button variant="contained" 
        onClick={()=>{handleRemoveEdge(props.cyRef,inputEdge,removeEdge,setRemoveEdge,setSbs)}}
      >Remove edge</Button>
      <TextField id="outlined-basic" 
        label="Remove Node" variant="outlined"  
        ref={el => inputNode.current[1] = el} 
        onChange={(e) => setRemoveNode(e.target.value)}
      />
      <Button variant="contained" 
        onClick={()=>{handleRemoveNode(props.cyRef,inputNode,removeNode,setRemoveNode,setSbs)}}
      >Remove node</Button>
      <div> Queue: 
        {orderRender.map((node)=>{
          return(<span>{node}</span>);
        })}
      </div>
      {duplicateN && <div>Node is already exist</div>}
      {duplicateE && <div>Edge is already exist</div>}

      <BfsDetail cyRef={props.cyRef} sbs={sbs} setSbs={setSbs} visualization={visualization}/>
      <JsonInput value={value} onChange={setValue} autosize style={{"width":"20%"}}/>
      <Button onClick={()=>handleCreateGraphAdjMatrix(props.cyRef,setDuplicateN,setDuplicateE,props.elements,props.setElements,nodes,setNodes,JSON.parse(value),setValidation,setClearGraph)}>
        Generate Graph
      </Button>
      {clearGraph && 
        <>
        <div>Clear your graph before generating a new one</div>
        <Button onClick={()=>handleClearGraph(props.cyRef,setClearGraph)}>Clear Graph</Button>
        </>
      }
      {!validation && <div>Input is not valid for undirected graph</div>}
    </>
  );
  }

export default Bfs;