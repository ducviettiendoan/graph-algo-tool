import React from 'react';
import { Button, TextField } from '@mui/material';
import { primMST } from '../../util/util';

const handleRunAlgo = (cyRef,setStackNext,stackBack,setStackBack,setCurrentNode,setSbs) => {
      console.log("Running handleRunAlgo");
      const V = cyRef.nodes();
      const idChart = {};
      setSbs(true);
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
      let prim = primMST(graph,V.length,cyRef,idChart);
    //   var dfs = cyRef.elements().bfs(`#${begin}`,function(){});
      console.log("BFS detail: ",prim);
      //remove css from all highlighted nodes (back stack)
      stackBack.map((node) => {
        return node.removeClass('highlighted');
      })
      //reset back stack
      setStackBack([]);
      let stack = [];
      var highlightNextEle = function(i,nodeOrder){
          if( i < prim.length ){
            highlightNextEle(i+1,nodeOrder);
            stack.unshift(prim[i]);
          }
      };
      highlightNextEle(0,0);
      setStackNext(stack);
      try{
        setCurrentNode(stack[0]);
      }catch(err){
        console.log(err);
      }
    }
  
  const handleNextStep = (setCurrentNode,stackNext,setStackBack) => {
    const top = stackNext.shift();
    if (!top){return -1;}
    top.addClass('highlighted');
    setStackBack(current=>[top,...current]);
    return top;
  }
  
  const handleBackStep = (setCurrentNode,setStackNext,stackBack) => {
  console.log(stackBack);
  const top = stackBack.shift();
  if (!top){return -1;}
  top.removeClass('highlighted');
  setStackNext(current=>[top,...current]);
  return top;
  }

const PrimDetail = (props) =>{
  const [currentNode, setCurrentNode] = React.useState();
  const [stackNext, setStackNext] = React.useState([]);
  const [stackBack, setStackBack] = React.useState([]);
  return (
    <>
      <div style={{"marginTop":"32px"}}>
      <div>Need to slow down? Here is a step by step animation.</div>
      <div>You can change the start node and hit ENTER to commit the change before click NEXT/BACK. Notice once hit ENTER all animation disappear</div>
      {/* Add new route ?*/}
      {/* <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => setRootNode(e.target.value)} onKeyDown={(e)=>handleRunAlgo(e,props.cyRef,rootNode,setStackNext,stackBack,setStackBack,setCurrentNode)}/> */}
      {!props.sbs && <Button onClick={()=>{handleRunAlgo(props.cyRef,setStackNext,stackBack,setStackBack,setCurrentNode,props.setSbs)}}>SBS</Button>}
      {props.sbs&&
      <>
        <Button onClick={()=>{handleNextStep(setCurrentNode,stackNext,setStackBack)}}>Next</Button>
        <Button onClick={()=>{handleBackStep(setCurrentNode,setStackNext,stackBack)}}>Back</Button>
        </>
      }
      </div>
    </>
  );
}
export default PrimDetail;