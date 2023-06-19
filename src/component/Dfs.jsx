import React from 'react';
import { Button, TextField } from '@mui/material';
import tippy from 'tippy.js';
import {dObj} from '../static.js';

const handleAddNode = (e,addNode,elements,setElements,nodes,setNodes,cyRef,inputNode,setDuplicateN) => {
  if (e.key==='Enter'){
    setDuplicateN(false);
    const random_x = Math.floor(Math.random() * 100) + 1;
    const add_x = random_x > 50 ? random_x:random_x-100;
    const add_y = Math.floor(Math.random() * 100) + 50;
    if (cyRef && cyRef.elements(`node#${addNode}`).size()>0){
      console.log(cyRef.elements(`node#${addNode}`).size());
      setDuplicateN(true);
      return;
    }
    let new_node = {};
    //default node start & end = -1
    elements.length === 0 ? new_node = { data: { id: `${addNode}`, label: `${addNode},${dObj.START},${dObj.END}`}, position: { x: dObj.POSITION_X, y: dObj.POSITION_Y} } : 
    new_node = { data: { id: `${addNode}`, label: `${addNode},${dObj.START},${dObj.END}` }, position: { x: elements[0].position.x+add_x, y: elements[0].position.y+add_y} } //position based on 1st node
    setElements([...elements, new_node]);
    setNodes([...nodes,new_node.data.id]);
    console.log(new_node);
    if (cyRef){
      cyRef.add(new_node);
    }
    if (inputNode.current[0]){
      inputNode.current[0].children[1].children[0].value = null;
    }
    console.log(cyRef._private.elements);
  }
}

const handleAddEdge = (e,addEdge,nodes,elements,setElements,cyRef,inputEdge,setDuplicateE) => {
  if (e.key==='Enter'){
    setDuplicateE(false);
    let edge = addEdge.split(',');
    if (cyRef){
      let a = cyRef.edges(`edge[source="${edge[0]}"][target="${edge[1]}"]`).size();
      let b = cyRef.edges(`edge[source="${edge[1]}"][target="${edge[0]}"]`).size();
      if (a || b){
        setDuplicateE(true);
        return;
      }
    }
    //handle edge does not exist
    if (nodes.includes(edge[0]) && nodes.includes(edge[1])){
        let new_edge = { data: { source: `${edge[0]}`, target: `${edge[1]}`, label: `Edge from Node${edge[0]} to Node${edge[1]}`}};
        setElements([...elements, new_edge]);
        cyRef.add(new_edge);
    }else{
        console.error("Cannot add edge!");
    }
    //handle clear TextField value
    if (inputEdge.current[1]){
      inputEdge.current[0].children[1].children[0].value = null;
    }
  }
}

//handle animation in async await as a recursive highlightNextEle runs
const handleAnimationDfs = async (cyRef,begin,order,setOrder,setOrderRender) => {
  var dfs = cyRef.elements().dfs(`#${begin}`,function(){});
  console.log(dfs);
  //need this to delay the highlight for 1s.
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
  //async await in recursion -> need to timeout before another recursive call.
  let total = 0;
  var highlightNextEle = async function(i,nodeOrder){
    if( i < dfs.path.length ){
      dfs.path[i].addClass('highlighted');
      if (dfs.path[i].isNode()){
        nodeOrder += 1;
        setOrder(dfs.path[i]._private.data.id);
        //ensure label in form of str with colon seperated, no spaces
        const extract = dfs.path[i].data().label.split(',')
        //extract start
        extract[1] = nodeOrder;
        dfs.path[i].data().label = extract.join(',')
      }
      await timeout(1000);
      console.log('before: ',i);
      await highlightNextEle(i+1,nodeOrder);
      total = Math.max(total,nodeOrder);
      if (dfs.path[i].isNode()){
        console.log(dfs.path[i]._private.data.id,nodeOrder,total+(total-nodeOrder+1));
        const extract = dfs.path[i].data().label.split(',')
        //extract end
        extract[2] = total+(total-nodeOrder+1);
        dfs.path[i].data().label = extract.join(',')
      }
      dfs.path[i].removeClass('highlighted');
      await timeout(1000);
    }
  };
  //put await as highlightNextEle returns a Promise
  await highlightNextEle(0,0);
  dfs.path.map((ele,i)=>{
    if (ele.isNode()){
      const extract = ele.data().label.split(',')
      //reset start, end
      extract[1] = -1;
      extract[2] = -1;
      dfs.path[i].data().label = extract.join(',')
      //This line for rerendering all node with resert start,end only.
      dfs.path[i].removeClass('resetDfs');
    }
  })
  setOrder(null);
  setOrderRender([]);
}
const handleDfs = async(cyRef,begin,order,setOrder,setOrderRender) => {
  await handleAnimationDfs(cyRef,begin,order,setOrder,setOrderRender);
  // await handleRemoveAnimation(cyRef, begin,setOrderRender);
}

// get node k and all edges coming out from it
const handleRemoveNode = (cyRef,inputNode,node,setRemoveNode)=>{
  //cy selector 
  const removeElements = cyRef.elements(`node#${node}, edge[source = "${node}"]`);
  cyRef.remove(removeElements);
  setRemoveNode("");
  if (inputNode.current[1]){
    inputNode.current[1].children[1].children[0].value = null;
  }
}
const handleRemoveEdge = (cyRef,inputEdge,edge,setRemoveEdge) => {
  edge = edge.split(',');
  const a = cyRef.edges(`edge[source="${edge[0]}"][target="${edge[1]}"]`);
  const b = cyRef.edges(`edge[source="${edge[1]}"][target="${edge[0]}"]`);
  const removeEdge = a.length>0?a:b;
  cyRef.remove(removeEdge);
  setRemoveEdge("");
  if (inputEdge.current[1]){
    inputEdge.current[1].children[1].children[0].value = null;
  }
}

const Dfs = (props) =>{
  const [newNode, setNewNode] = React.useState(null);
  const [newEdge, setNewEdge] = React.useState(null);
  const [nodes, setNodes] = React.useState([]);
  const [rootNode, setRootNode] = React.useState();
  const [order, setOrder] = React.useState();
  const [orderRender, setOrderRender] = React.useState([]);
  //handle clean TextField value after onClick add.
  const [removeEdge, setRemoveEdge] = React.useState();
  const [removeNode, setRemoveNode] = React.useState();
  const [duplicateN, setDuplicateN] = React.useState(false);
  const [duplicateE, setDuplicateE] = React.useState(false);
  const [reset,setReset] = React.useState(false);
  //this 2 ref are used for multiple components
  const inputNode = React.useRef([]);
  const inputEdge = React.useRef([]);

  React.useEffect(()=>{
    setOrderRender([...orderRender,order]);
  },[order]);
  return (
    <>
      <div>
        <TextField id="outlined-basic" label="Node" variant="outlined" ref={el=>inputNode.current[0]=el} onChange={(e) => setNewNode(e.target.value)} onKeyDown={(e)=>handleAddNode(e,newNode,props.elements,props.setElements,nodes,setNodes,props.cyRef,inputNode,setDuplicateN)}/>
        {/* <Button variant='contained' onClick={()=>handleAddNode(newNode,props.elements,props.setElements,nodes,setNodes,props.cyRef,inputNode,setDuplicateN)}>Add node</Button> */}
        <TextField id="outlined-basic" label="Edge" variant="outlined" ref={el=>inputEdge.current[0]=el} onChange={(e) => {setNewEdge(e.target.value)}} onKeyDown={(e)=>handleAddEdge(e,newEdge,nodes,props.elements,props.setElements,props.cyRef,inputEdge,setDuplicateE)}/>
        {/* <Button variant='contained' onClick={()=>handleAddEdge(newEdge,nodes,props.elements,props.setElements,props.cyRef,inputEdge,setDuplicateE)}>Add edge</Button> */}
      </div>
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => setRootNode(e.target.value)}/>
      <Button variant='contained' onClick={()=>{handleDfs(props.cyRef,rootNode,order,setOrder,setOrderRender)}}>Run DFS</Button>
      <TextField id="outlined-basic" label="Remove Edge" variant="outlined" ref={el => inputEdge.current[1] = el} onChange={(e) => setRemoveEdge(e.target.value)}/>
      <Button variant="contained" onClick={()=>{handleRemoveEdge(props.cyRef,inputEdge,removeEdge,setRemoveEdge)}}>Remove edge</Button>
      <TextField id="outlined-basic" label="Remove Node" variant="outlined" ref={el => inputNode.current[1] = el} onChange={(e) => setRemoveNode(e.target.value)}/>
      <Button variant="contained" onClick={()=>{handleRemoveNode(props.cyRef,inputNode,removeNode,setRemoveNode)}}>Remove node</Button>
      <div>
        {orderRender.map((node)=>{
          return(<span>{node}</span>);
        })}
      </div>
      {duplicateN && <div>Node is already exist</div>}
      {duplicateE && <div>Edge is already exist</div>}
    </>
  );
}

export default Dfs;