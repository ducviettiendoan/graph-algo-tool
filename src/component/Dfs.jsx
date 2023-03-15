import React from 'react';
import { Button, TextField } from '@mui/material';

const POSITION_X = 400;
const POSITION_Y = 250;

const handleAddNode = (addNode,elements,setElements,nodes,setNodes,cyRef,inputNode) => {
    const random_x = Math.floor(Math.random() * 100) + 1;
    const add_x = random_x > 50 ? random_x:random_x-100;
    const add_y = Math.floor(Math.random() * 100) + 50;
    console.log(add_x,add_y);
    let new_node = {};
    elements.length === 0 ? new_node = { data: { id: `${addNode}`, label: `Node ${addNode}` }, position: { x: POSITION_X, y: POSITION_Y} } : 
    new_node = { data: { id: `${addNode}`, label: `Node ${addNode}` }, position: { x: elements[0].position.x+add_x, y: elements[0].position.y+add_y} } //position based on 1st node
    setElements([...elements, new_node]);
    setNodes([...nodes,new_node.data.id]);
    if (cyRef){
      cyRef.add(new_node);
    }
    if (inputNode.current){
      inputNode.current.children[1].children[0].value = null;
    }
}

const handleAddEdge = (addEdge,nodes,elements,setElements,cyRef,inputEdge) => {
    let edge = addEdge.split(',');
    //handle edge does not exist
    if (nodes.includes(edge[0]) && nodes.includes(edge[1])){
        let new_edge = { data: { source: `${edge[0]}`, target: `${edge[1]}`, label: `Edge from Node${edge[0]} to Node${edge[1]}`}};
        setElements([...elements, new_edge]);
        cyRef.add(new_edge);
    }else{
        console.error("Cannot add edge!");
    }
    //handle clear TextField value
    if (inputEdge.current){
      inputEdge.current.children[1].children[0].value = null;
    }
}

const handleDfs = (cyRef,begin,order,setOrder) => {
  var dfs = cyRef.elements().dfs(`#${begin}`, function(){}, true);
  var i = 0;
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
}

const Dfs = (props) =>{
  const [newNode, setNewNode] = React.useState(null);
  const [newEdge, setNewEdge] = React.useState(null);
  const [nodes, setNodes] = React.useState([]);
  const [rootNode, setRootNode] = React.useState();
  const [order, setOrder] = React.useState();
  const [orderRender, setOrderRender] = React.useState([]);
  //handle clean TextField value after onClick add.
  const inputNode = React.useRef();
  const inputEdge = React.useRef();

  React.useEffect(()=>{
    setOrderRender([...orderRender,order]);
  },[order]);
  return (
    <>
    <div>
        <TextField id="outlined-basic" label="Node" variant="outlined" ref={inputNode} onChange={(e) => setNewNode(e.target.value)}/>
        <Button variant='contained' onClick={()=>handleAddNode(newNode,props.elements,props.setElements,nodes,setNodes,props.cyRef,inputNode)}>Add node</Button>
        <TextField id="outlined-basic" label="Edge" variant="outlined" ref={inputEdge} onChange={(e) => {setNewEdge(e.target.value)}}/>
        <Button variant='contained' onClick={()=>handleAddEdge(newEdge,nodes,props.elements,props.setElements,props.cyRef,inputEdge)}>Add edge</Button>
      </div>
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => setRootNode(e.target.value)}/>
      <Button variant='contained' onClick={()=>{handleDfs(props.cyRef,rootNode,order,setOrder)}}>Run DFS</Button>
      <div>
        {orderRender.map((node)=>{
          return(<span>{node}</span>);
        })}
      </div>
    </>
  );
}

export default Dfs;