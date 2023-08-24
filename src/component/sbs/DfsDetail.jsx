import React from 'react';
import { Button, TextField } from '@mui/material';
import {dObj} from '../../static.js';

/////DESCRIPTION/////
// The feature mainly use 2 stacks for ordering the next node to highlight a node or unhighlight a 
// current node and go back to the previous node.

const handleRunAlgo = (e,cyRef,begin,setStackNext,stackBack,setStackBack,setCurrentNode) => {
    if (e.key === 'Enter'){
      console.log("Running handleRunAlgo:", begin);
      var dfs = cyRef.elements().dfs(`#${begin}`,function(){});
      console.log("DFS detail: ",dfs);
      //remove css from all highlighted nodes (back stack)
      stackBack.map((node) => {
        return node.removeClass('highlighted');
      })
      //reset back stack
      setStackBack([]);
      let stack = [];
      var highlightNextEle = function(i,nodeOrder){
          if( i < dfs.path.length ){
            highlightNextEle(i+1,nodeOrder);
            stack.unshift(dfs.path[i]);
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

const DfsDetail = (props) =>{
  const [rootNode, setRootNode] = React.useState();
  const [currentNode, setCurrentNode] = React.useState();
  const [stackNext, setStackNext] = React.useState([]);
  const [stackBack, setStackBack] = React.useState([]);

  return (
    <div style={{"marginTop":"32px"}}>
      <div>Need to slow down? Here is a step by step animation.</div>
      <div>You can change the start node and hit ENTER to commit the change before click NEXT/BACK. Notice once hit ENTER all animation disappear</div>
      {/* Add new route ?*/}
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => setRootNode(e.target.value)} onKeyDown={(e)=>handleRunAlgo(e,props.cyRef,rootNode,setStackNext,stackBack,setStackBack,setCurrentNode)}/>
      { rootNode&&<>
        <Button onClick={()=>{handleNextStep(setCurrentNode,stackNext,setStackBack)}}>Next</Button>
        <Button onClick={()=>{handleBackStep(setCurrentNode,setStackNext,stackBack)}}>Back</Button>
        </>
      }
    </div>
  );
}

export default DfsDetail;