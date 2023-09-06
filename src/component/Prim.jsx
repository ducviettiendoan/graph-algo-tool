import React from 'react';
import { Button, TextField } from '@mui/material';
// import * as ReactDOM from 'react-dom';
import { primMST } from '../util/util';
import PrimDetail from './sbs/PrimDetail';
import { JsonInput } from '@mantine/core';
import { detectInvalidWeight } from '../util/util';

const POSITION_X = 400;
const POSITION_Y = 250;

const addNode = (cyRef,node,setDuplicateN,elements,setElements,nodes,setNodes,inputNode) => {
  const random_x = Math.floor(Math.random() * 100) + 1;
  const add_x = random_x > 50 ? random_x:random_x-100;
  const add_y = Math.floor(Math.random() * 100) + 50;  
  if (cyRef && cyRef.elements(`node#${node}`).size()>0){
    setDuplicateN(true);
    return;
  }
  let new_node = {};
  console.log(cyRef.nodes());
  cyRef.nodes().length === 0 ? new_node = { data: { id: `${node}`, label: `Node ${node}` }, position: { x: POSITION_X, y: POSITION_Y} } : 
  new_node = { data: { id: `${node}`, label: `Node ${node}` }, position: { x: cyRef.nodes()[0].position('x')+add_x, y: cyRef.nodes()[0].position('y')+add_y} } //position based on 1st node
  setElements([...elements, new_node]);
  setNodes([...nodes,new_node.data.id]);
  if (cyRef){
    cyRef.add(new_node);
  }
  if (inputNode && inputNode.current[0]){
    inputNode.current[0].children[1].children[0].value = null;
  }
}

const handleAddNode = (e,node,elements,setElements,nodes,setNodes,cyRef,inputNode,setDuplicateN,setSbs) => {
  if (e && e.key==='Enter'){
    setSbs(false);
    addNode(cyRef,node,setDuplicateN,elements,setElements,setNodes,nodes,inputNode);
  }
}

const addEdge = (cyRef,a_edge,nodes,elements,setElements,setDuplicateE,inputEdge,setForceW) => {
  let edge = a_edge.split(',');
  //invalid edge validation
  if (edge.length<3 || edge[2]==='' || isNaN(edge[2])){
    if (inputEdge.current[0]){
      inputEdge.current[0].children[1].children[0].value = null;
    }
    setForceW(prev=>!prev);
    setTimeout(() => {
      setForceW(prev=>!prev);
    }, 1000);
    return;
  }
  //overwrite old weight or return edge already exist if same edge with same weight.
  if (cyRef){
    let a = cyRef.edges(`edge[source="${edge[0]}"][target="${edge[1]}"]`).data();
    let b = cyRef.edges(`edge[source="${edge[1]}"][target="${edge[0]}"]`).data();
    let findEdge;
    a ? findEdge = a : findEdge = b;
    if (findEdge){
      if (edge[2] === findEdge.weight){
        setDuplicateE(true);
        return;
      }
      //delete edge and re-add.
      const removeEdge = cyRef.edges(`edge[source="${findEdge.source}"][target="${findEdge.target}"][weight="${findEdge.weight}"]`);
      cyRef.remove(removeEdge);
    }
  }
  //handle edge does not exist
  if (cyRef.elements(`node#${edge[0]}`) && cyRef.elements(`node#${edge[1]}`)){
      let new_edge = { data: { source: `${edge[0]}`, target: `${edge[1]}`, label: `Edge from Node${edge[0]} to Node${edge[1]}`, weight: `${edge[2]}`}};
      setElements([...elements, new_edge]);
      cyRef.add(new_edge);
      cyRef._private.elements[cyRef._private.elements.length-1].addClass('weight');  
  }else{
      console.error("Cannot add edge!");
  }
  //handle clear TextField value
  if (inputEdge && inputEdge.current[0]){
    inputEdge.current[0].children[1].children[0].value = null;
  }
}
const handleAddEdge = (e,a_edge,nodes,elements,setElements,cyRef,inputEdge,setDuplicateE,setForceW,setSbs) => {
  if (e&&e.key==="Enter"){
    setDuplicateE(false);
    setSbs(false);
    addEdge(cyRef,a_edge,inputEdge,setForceW,setDuplicateE,nodes,elements,setElements);
  }
}

const handlePrim = async(cyRef,setHL,order,setOrder,setSbs,setVisualization,hl,setRenderEdges) => {
    setSbs(false);
    setVisualization(true);
    //always remove all animations before run new visualization (reset all sbs animations)
    await cyRef.elements().map(ele=>{
      ele.removeClass('highlighted');
    })
    //construct the graph as param for prim func above. Follow: https://www.geeksforgeeks.org/prims-minimum-spanning-tree-mst-greedy-algo-5/#
    const V = cyRef.nodes();
    const idChart = {};
    V.map((v,i)=>{
        idChart[v.data('id')] = i;
    })
    const [r,c] = [V.length, V.length]; 
    const graph = Array(r).fill().map(()=>Array(c).fill(0));
    V.map((vertex)=>{
        const neighbors = vertex.neighborhood(function( ele ){
            return ele.isNode();
        });
        neighbors.map((v)=>{
            const s = vertex.data('id');
            const t = v.data('id');
            const sTot = cyRef.edges(`edge[source="${s}"][target="${t}"]`).data('weight');
            sTot?graph[idChart[s]][idChart[t]] = parseInt(sTot) : graph[idChart[s]][idChart[t]] = parseInt(cyRef.edges(`edge[source="${t}"][target="${s}"]`).data('weight'));
        })
    });
    const k = primMST(graph,V.length,cyRef,idChart);
    setHL(k);
    let i = 0;
    const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
    var highlightNextEle = async function(edge){
        if( i < k.length ){
            k[i].addClass('highlighted');
            setOrder(k[i]);
            i++;
            await timeout(1000);
            await highlightNextEle();
        }
    };
    await highlightNextEle();
    await cyRef.elements().map(ele=>{
      ele.removeClass('highlighted');
    })
    setHL(null);
    setRenderEdges([]);
    setOrder(null);
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
  setSbs(false);
  setRemoveEdge("");
  if (inputEdge.current[1]){
    inputEdge.current[1].children[1].children[0].value = null;
  }
}

const handleAdjMatrixInput = (cyRef,adjMatrix,setDuplicateN,setDuplicateE,elements,setElements,nodes,setNodes,setValidation,inputNode,inputEdge,setForceW) => {
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
  const inputValidate = detectInvalidWeight(adjMatrix,setValidation);
  if (!inputValidate){
    setValidation(false);
    return;
  }
  //add Node
  for (let i=1;i<=adjMatrix.length;i++){
    addNode(cyRef,i,setDuplicateN,elements,setElements,nodes,setNodes,inputNode);
  }
  //add Edge
  let row = adjMatrix.length;
  let col = adjMatrix[0].length;
  for (let i=0;i<row;i++){
    for (let j=0;j<col;j++){
      if (adjMatrix[i][j] !== 0){
        let edge = `${i+1},${j+1},${adjMatrix[i][j]}`;
        addEdge(cyRef,edge,nodes,elements,setElements,setDuplicateE,inputEdge,setForceW);
      }
    }
  }
}

const handleCreateGraphAdjMatrix = (cyRef,setDuplicateN,setDuplicateE,elements,setElements,nodes,setNodes,value,setValidation,setClearGraph,inputNode,inputEdge,setForceW) => {
  console.log(value);
  //make sure cyRef is empty
  if (cyRef.elements().length > 0){
    console.log(cyRef.elements(),"Empty your graph!");
    //set state to open a clear graph button.
    setClearGraph(true);
    return;
  }
  handleAdjMatrixInput(cyRef,value,setDuplicateN,setDuplicateE,elements,setElements,nodes,setNodes,setValidation,inputNode,inputEdge,setForceW);
}

const handleClearGraph = (cyRef,setClearGraph) => {
  cyRef.elements().map((ele)=> ele.remove());
  setClearGraph(false);
}

const Prim = (props) =>{
  const [newNode, setNewNode] = React.useState(null);
  const [newEdge, setNewEdge] = React.useState(null);
  const [nodes, setNodes] = React.useState([]);
  //handle clean TextField value after onClick add.
  const [removeEdge, setRemoveEdge] = React.useState();
  const [removeNode, setRemoveNode] = React.useState();
  const [duplicateN, setDuplicateN] = React.useState(false);
  const [duplicateE, setDuplicateE] = React.useState(false);
  //this 2 ref are used for multiple components
  const inputNode = React.useRef([]);
  const inputEdge = React.useRef([]);
  //highlight elements state
  const [hl,setHL] = React.useState(null);
  //render elements
  const [order,setOrder] = React.useState();
  const [renderEdges,setRenderEdges] = React.useState([]);
  //Force edge to have weight
  const [forceW, setForceW] = React.useState(false);

  //adj matrix input validation states
  const [value, setValue] = React.useState('');
  const [adjMatrix, setAdjMatrix] = React.useState([]);
  const [validation, setValidation] = React.useState([]);
  const [clearGraph, setClearGraph] = React.useState(false);

  //SBS
  const [sbs, setSbs] = React.useState(false);

  //visualization true = algo animation is running do not interrupt
  const [visualization, setVisualization] = React.useState(false);

  //keep track of all considering edges 
  let ARR = [];
  //visited edges.
  let visited = [];
  React.useEffect(()=>{
    order&&setRenderEdges([...renderEdges,order])
  },[order,forceW])
  //RENDERING: O(n^2) where n is the 
  // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
  return (
    <>
      {/* Add UI instruction here later */}
      <div id="hello">
        <TextField id="outlined-basic" label="Node" 
        variant="outlined" 
        ref={el=>inputNode.current[0]=el} 
        onChange={(e) => setNewNode(e.target.value)} 
        onKeyDown={(e)=>handleAddNode(e,newNode,props.elements,props.setElements,nodes,setNodes,props.cyRef,inputNode,setDuplicateN,setSbs)}
        />
        <TextField id="outlined-basic" label="Edge" 
        variant="outlined" 
        ref={el=>inputEdge.current[0]=el} 
        onChange={(e) => {setNewEdge(e.target.value)}} 
        onKeyDown={(e)=>handleAddEdge(e,newEdge,nodes,props.elements,props.setElements,props.cyRef,inputEdge,setDuplicateE,setForceW,setSbs)}
        />
      </div>
      <Button variant='contained' onClick={()=>{handlePrim(props.cyRef,setHL,order,setOrder,setSbs,setVisualization,hl,setRenderEdges)}}>Run Prim</Button>
      <TextField id="outlined-basic" label="Remove Edge" variant="outlined" ref={el => inputEdge.current[1] = el} onChange={(e) => setRemoveEdge(e.target.value)}/>
      <Button variant="contained" onClick={()=>{handleRemoveEdge(props.cyRef,inputEdge,removeEdge,setRemoveEdge,setSbs)}}>Remove edge</Button>
      <TextField id="outlined-basic" label="Remove Node" variant="outlined" ref={el => inputNode.current[1] = el} onChange={(e) => setRemoveNode(e.target.value)}/>
      <Button variant="contained" onClick={()=>{handleRemoveNode(props.cyRef,inputNode,removeNode,setRemoveNode,setSbs)}}>Remove node</Button>
      {renderEdges && <div style={{marginBottom:"16px", fontWeight: 'bold'}}>Edges to choose are all the edges that are connected to already visited nodes</div>}
      {forceW&&<div style={{color:"red"}}>Please include weight when adding edges</div>}
      <div>
        {renderEdges && 
        renderEdges.map((edge)=>{
            if (edge.isNode()){
                const neighbors = edge.neighborhood(function(ele){
                    return ele.isNode();
                });
                //create considering edges here
                neighbors.map(n=>{
                  const a = `${edge.data().id}-${n.data().id}`;
                  const b = `${n.data().id}-${edge.data().id}`;
                  if (!visited.includes(a) && !visited.includes(b)){
                    ARR.push(a);
                    visited.push(a);
                    visited.push(b);
                  }
                })
                return(
                  <div>
                    <span>Edges to choose: </span>
                    {ARR.map(e=>{
                      return(
                        <span style={{marginRight: "5px"}}>{e}</span>)})
                    }
                    <span style={{marginLeft:"5px"}}>Visiting node: {edge.data().id}</span>
                  </div>
                )
            }
            if (edge.isEdge()){
                const a = `${edge.data().source}-${edge.data().target}`;
                const b = `${edge.data().target}-${edge.data().source}`;
                ARR = ARR.filter(edge => edge !== a && edge !== b);
                return(
                    <div><span>Minimum edge weight: </span>{`${edge.data().source}-${edge.data().target}`}</div>
                );
            }
        })}
      </div>
      {duplicateN && <div>Node is already exist</div>}
      {duplicateE && <div>Edge with the same weight is already exist</div>}
      <PrimDetail cyRef={props.cyRef} sbs={sbs} setSbs={setSbs} visualization={visualization}/>
      <JsonInput value={value} onChange={setValue} autosize style={{"width":"20%"}}/>
      <Button onClick={()=>handleCreateGraphAdjMatrix(props.cyRef,setDuplicateN,setDuplicateE,props.elements,props.setElements,nodes,setNodes,JSON.parse(value),setValidation,setClearGraph,null,null,setForceW)}>
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
export default Prim;