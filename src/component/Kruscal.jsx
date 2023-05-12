import React from 'react';
import { Button, TextField } from '@mui/material';

const POSITION_X = 400;
const POSITION_Y = 250;

const handleAddNode = (addNode,elements,setElements,nodes,setNodes,cyRef,inputNode,setDuplicateN) => {
    const random_x = Math.floor(Math.random() * 100) + 1;
    const add_x = random_x > 50 ? random_x:random_x-100;
    const add_y = Math.floor(Math.random() * 100) + 50;    
    if (cyRef && cyRef.elements(`node#${addNode}`).size()>0){
      console.log(cyRef.elements(`node#${addNode}`).size());
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

const handleAddEdge = (addEdge,nodes,elements,setElements,cyRef,inputEdge,setDuplicateE) => {
  setDuplicateE(false);
    let edge = addEdge.split(',');
    //overwrite old weight or return edge already exist if same edge with same weight.
    if (cyRef){
      let a = cyRef.edges(`edge[source="${edge[0]}"][target="${edge[1]}"]`).data();
      let b = cyRef.edges(`edge[source="${edge[1]}"][target="${edge[0]}"]`).data();
      console.log(a,b,cyRef);
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

//handle animation in async await as a recursive highlightNextEle runs
const handleKruskal = (cyRef) => {
    var k = cyRef.elements().kruskal(function(edge){
        return edge.data('weight');
    });
    var i = 0;
    console.log("@@@",k);
    //need this to delay the highlight for 1s.
  var highlightNextEle = function(edge){
    if( i < k.length ){
        k[i].addClass('highlighted');
        i++;
        highlightNextEle();
    }
  };
  highlightNextEle();
}

const handleRemoveAnimation = (cyRef) => {
    var k = cyRef.elements().kruskal(function(edge){
        return edge.data('weight'); 
    });
    console.log(k);
    var i = 0;
    var removeStyleNextEle = function(){
        if( i < k.length ){
            k[i].removeClass('highlighted');
            i++;
            removeStyleNextEle();
        }
    }
    removeStyleNextEle();
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
  console.log(edge);
  console.log(cyRef);
  //cy selector
  const removeEdge = cyRef.edges(`edge[source="${edge[0]}"][target="${edge[1]}"]`);
  cyRef.remove(removeEdge);
  setRemoveEdge("");
  if (inputEdge.current[1]){
    inputEdge.current[1].children[1].children[0].value = null;
  }
}
const Kruskal = (props) =>{
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

  return (
    <>
      {/* Add UI instruction here later */}
      <div>
        <TextField id="outlined-basic" label="Node" variant="outlined" ref={el=>inputNode.current[0]=el} onChange={(e) => setNewNode(e.target.value)}/>
        <Button variant='contained' onClick={()=>handleAddNode(newNode,props.elements,props.setElements,nodes,setNodes,props.cyRef,inputNode,setDuplicateN)}>Add node</Button>
        <TextField id="outlined-basic" label="Edge" variant="outlined" ref={el=>inputEdge.current[0]=el} onChange={(e) => {setNewEdge(e.target.value)}}/>
        <Button variant='contained' onClick={()=>handleAddEdge(newEdge,nodes,props.elements,props.setElements,props.cyRef,inputEdge,setDuplicateE)}>Add edge</Button>
      </div>
      <Button variant='contained' onClick={()=>{handleKruskal(props.cyRef)}}>Run Kruscal</Button>
      <Button variant='contained' onClick={()=>{handleRemoveAnimation(props.cyRef)}}>Clear Animation</Button>
      <TextField id="outlined-basic" label="Remove Edge" variant="outlined" ref={el => inputEdge.current[1] = el} onChange={(e) => setRemoveEdge(e.target.value)}/>
      <Button variant="contained" onClick={()=>{handleRemoveEdge(props.cyRef,inputEdge,removeEdge,setRemoveEdge)}}>Remove edge</Button>
      <TextField id="outlined-basic" label="Remove Node" variant="outlined" ref={el => inputNode.current[1] = el} onChange={(e) => setRemoveNode(e.target.value)}/>
      <Button variant="contained" onClick={()=>{handleRemoveNode(props.cyRef,inputNode,removeNode,setRemoveNode)}}>Remove node</Button>
      {duplicateN && <div>Node is already exist</div>}
      {duplicateE && <div>Edge with the same weight is already exist</div>}
    </>
  );
}

export default Kruskal;