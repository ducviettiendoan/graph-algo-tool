import React from 'react';
import { Button, TextField } from '@mui/material';
import {dObj} from '../../static.js';

/////DESCRIPTION/////
// The feature mainly use 2 stacks for ordering the next node to highlight a node or unhighlight a 
// current node and go back to the previous node.

const handleRunAlgo = (e,cyRef,begin,setStackNext,stackBack,setStackBack,setCurrentNode,setSbs) => {
    if (e.key === 'Enter'){
      console.log("Running handleRunAlgo:", begin);
      setSbs(true);
      var dfs = cyRef.elements().dfs(`#${begin}`,function(){});
      let total = 0;
      let queue = [];
      const orderNode = function(i,nodeOrder,visit,time){
        if( i < dfs.path.length ){
          if (dfs.path[i].isNode()){
            const node_id = dfs.path[i].data('id')
            if (!visit.has(node_id)){visit.add(node_id)}
            nodeOrder += 1;
            //ensure label in form of str with colon seperated, no spaces
            const extract = dfs.path[i].data().label.split(',')
            //extract start
            extract[1] = nodeOrder+time;
            // dfs.path[i].data().label = extract.join(',')
            queue.push([dfs.path[i],extract.join(',')]);
          }else{queue.push([dfs.path[i],'fw'])}
          orderNode(i+1,nodeOrder,visit,time);
          total = Math.max(total,nodeOrder);
          if (dfs.path[i].isNode()){
            const extract = dfs.path[i].data().label.split(',');
            //extract end
            extract[2] = total+(total-nodeOrder+1)+time;
            // dfs.path[i].data().label = extract.join(',');
            queue.push([dfs.path[i],extract.join(',')]);
          }else{queue.push([dfs.path[i],'bt'])}
          // return total+(total-nodeOrder+1)+time;
        }
      }
      let visit = new Set();
      orderNode(0,0,visit,0);
      console.log("DFS detail: ",dfs,queue);
      //remove css from all highlighted nodes (back stack) to reset previous handleRunAlgo
      stackBack.map((node) => {
        return node.removeClass('highlighted');
      })
      //reset back stack
      setStackBack([]);
      let stack = [];
      var highlightNextEle = function(i,nodeOrder){
          if( i < queue.length ){
            highlightNextEle(i+1,nodeOrder);
            stack.unshift(queue[i]);
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

const handleNextStep = (setCurrentNode,stackNext,setStackBack,setStackNext) => {
    //why not set state for stackNext but shift() the state directly?
    const top = stackNext.shift();
    // setStackNext(stackNext);
    if (!top){return -1;}
    // console.log('bf',top[0]);
    if (top[0].isNode()){
      parseInt(top[1].split(',')[1]) !==-1 ? top[0].addClass('highlighted') : top[0].removeClass('highlighted');
    }else{
      top[1]==='fw'?top[0].addClass('highlighted') : top[0].removeClass('highlighted');
    }
    setStackBack(current=>[top,...current]);
    const topExtract = top[1].split(',');
    const extract = top[0].data().label.split(',');
    // console.log("before",topExtract,extract);
    parseInt(topExtract[2]) === -1 ? extract[1] = topExtract[1] : extract[2] = topExtract[2];
    // console.log("after",extract);
    top[0].data().label = extract.join(',');
    // console.log('aft',top[0]);
}

const handleBackStep = (setCurrentNode,setStackNext,stackBack) => {
  const top = stackBack.shift();
  if (!top){return -1;}
  if (top[0].isNode()){
    parseInt(top[1].split(',')[1]) !==-1 ? top[0].removeClass('highlighted') : top[0].addClass('highlighted');
  }else{
    top[1]==='bt'?top[0].addClass('highlighted') : top[0].removeClass('highlighted');
  }
  setStackNext(current=>[top,...current]);
  const topExtract = top[1].split(',');
  const extract = top[0].data().label.split(',');
  parseInt(topExtract[2])===-1 ? extract[1]=-1 : extract[2]=-1;
  top[0].data().label = extract.join(',');
}

const DfsDetail = (props) =>{
  const [rootNode, setRootNode] = React.useState();
  const [currentNode, setCurrentNode] = React.useState();
  const [stackNext, setStackNext] = React.useState([]);
  const [stackBack, setStackBack] = React.useState([]);
  const [stackCurr, setStackCurr] = React.useState([]);

  console.log("Stack Next", stackNext);
  console.log("Stack Back", stackBack);
  return (
    <div style={{"marginTop":"32px"}}>
      <div>Need to slow down? Here is a step by step animation.</div>
      <div>You can change the start node and hit ENTER to commit the change before click NEXT/BACK. Notice once hit ENTER all animation disappear</div>
      {/* Add new route ?*/}
      <TextField id="outlined-basic" label="Node" variant="outlined" onChange={(e) => {setRootNode(e.target.value); props.setSbs(false)}} onKeyDown={(e)=>handleRunAlgo(e,props.cyRef,rootNode,setStackNext,stackBack,setStackBack,setCurrentNode,props.setSbs)}/>
      {rootNode&&props.sbs&&<>
        <Button onClick={()=>{handleNextStep(setCurrentNode,stackNext,setStackBack,setStackNext)}}>Next</Button>
        <Button onClick={()=>{handleBackStep(setCurrentNode,setStackNext,stackBack)}}>Back</Button>
        </>
      }
    </div>
  );
}

export default DfsDetail;