import React from 'react';
import { Button, TextField } from '@mui/material';

const handleRunAlgo = (e,cyRef,begin,setStackNext,stackBack,setStackBack,setCurrentNode,setSbs,visualization) => {
  if (e.key === 'Enter' && !visualization){
    //remove css from all highlighted nodes (back stack)
    setSbs(true);
    stackBack.map((node) => {
      return node.removeClass('highlighted');
    })
    var bfs = cyRef.elements().bfs(`#${begin}`,function(){});
    //reset back stack
    setStackBack([]);
    let stack = [];
    var highlightNextEle = function(i,nodeOrder){
        if( i < bfs.path.length ){
          highlightNextEle(i+1,nodeOrder);
          stack.unshift(bfs.path[i]);
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

const handleNextStep = (stackNext,setStackBack) => {
  const top = stackNext.shift();
  if (!top){return -1;}
  top.addClass('highlighted');
  setStackBack(current=>[top,...current]);
  return top;
}

const handleBackStep = (setStackNext,stackBack) => {
const top = stackBack.shift();
if (!top){return -1;}
top.removeClass('highlighted');
setStackNext(current=>[top,...current]);
return top;
}

const BfsDetail = (props) =>{
  const [rootNode, setRootNode] = React.useState();
  const [currentNode, setCurrentNode] = React.useState();
  const [stackNext, setStackNext] = React.useState([]);
  const [stackBack, setStackBack] = React.useState([]);

  return (
    <>
      <div style={{"marginTop":"32px"}}>
      <div>Need to slow down? Here is a step by step animation.</div>
      <div>You can change the start node and hit ENTER to commit the change before click NEXT/BACK. Notice once hit ENTER all animation disappear</div>
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => {setRootNode(e.target.value); props.setSbs(false)}} onKeyDown={(e)=>handleRunAlgo(e,props.cyRef,rootNode,setStackNext,stackBack,setStackBack,setCurrentNode,props.setSbs,props.visualization)}/>
      { rootNode&&props.sbs&&!props.visualization&&<>
        <Button onClick={()=>{handleNextStep(stackNext,setStackBack)}}>Next</Button>
        <Button onClick={()=>{handleBackStep(setStackNext,stackBack)}}>Back</Button>
        </>
      }
      </div>
    </>
  );
  }

export default BfsDetail;