import React from 'react';
import { Button, TextField } from '@mui/material';
// import * as ReactDOM from 'react-dom';
import { primMST } from '../util/util';
import PrimDetail from './sbs/PrimDetail';

const POSITION_X = 400;
const POSITION_Y = 250;

const handleAddNode = (e,addNode,elements,setElements,nodes,setNodes,cyRef,inputNode,setDuplicateN,setSbs) => {
  if (e && e.key==='Enter'){
    setSbs(false);
    const random_x = Math.floor(Math.random() * 100) + 1;
    const add_x = random_x > 50 ? random_x:random_x-100;
    const add_y = Math.floor(Math.random() * 100) + 50;    
    if (cyRef && cyRef.elements(`node#${addNode}`).size()>0){
      setDuplicateN(true);
      return;
    }
    let new_node = {};
    elements.length === 0 ? new_node = { data: { id: `${addNode}`, label: `Node ${addNode}` }, position: { x: POSITION_X, y: POSITION_Y} } : 
    new_node = { data: { id: `${addNode}`, label: `Node ${addNode}` }, position: { x: elements[0].position.x+add_x, y: elements[0].position.y+add_y} } //position based on 1st node
    setElements([...elements, new_node]);
    setNodes([...nodes,new_node.data.id]);
    if (cyRef){
      cyRef.add(new_node);
    }
    if (inputNode.current[0]){
      inputNode.current[0].children[1].children[0].value = null;
    }
  }
}

const handleAddEdge = (e,addEdge,nodes,elements,setElements,cyRef,inputEdge,setDuplicateE,setForceW,setSbs) => {
  if (e&&e.key==="Enter"){
    setDuplicateE(false);
    setSbs(false);
    let edge = addEdge.split(',');
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
    if (nodes.includes(edge[0]) && nodes.includes(edge[1])){
        let new_edge = { data: { source: `${edge[0]}`, target: `${edge[1]}`, label: `Edge from Node${edge[0]} to Node${edge[1]}`, weight: `${edge[2]}`}};
        setElements([...elements, new_edge]);
        cyRef.add(new_edge);
        cyRef._private.elements[cyRef._private.elements.length-1].addClass('weight');  
    }else{
        console.error("Cannot add edge!");
    }
    //handle clear TextField value
    if (inputEdge.current[0]){
      inputEdge.current[0].children[1].children[0].value = null;
    }
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
    </>
  );
}
export default Prim;