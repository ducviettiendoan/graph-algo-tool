function minKey(key,mstSet,V)
{
    // Initialize min value
    let min = Number.MAX_VALUE;
    let min_index;
 
    for (let v = 0; v < V; v++){
        if (mstSet[v] === false && key[v] < min){
            min = key[v];
            min_index = v;
        }
    }
    return min_index;
}
 
//utility to find key by value on Obj
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
// A utility function to print the
// constructed MST stored in parent[]
const makeHL = (parent,orderHL,V,cyRef,idChart) => {
    //add highlight on printing out selected edges.
    // const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
    const hl = [];
    for (let i = 1; i < V; i++){
        //convert number to node id
        let targetId = orderHL[i]
        let source = getKeyByValue(idChart,parent[targetId]);
        let target = getKeyByValue(idChart,targetId);
        //addClass
        hl.push(cyRef.elements(`node#${source}`)[0]);
        hl.push(cyRef.elements(`node#${target}`)[0]);
        let edge = cyRef.edges(`edge[source="${source}"][target="${target}"]`);
        edge.length>0?hl.push(cyRef.edges(`edge[source="${source}"][target="${target}"]`)[0]):hl.push(cyRef.edges(`edge[source="${target}"][target="${source}"]`)[0]);
    }
    return hl;
}
 
// Function to construct and print MST for  a graph represented using adjacency in matrix representation
export function primMST(graph,V,cyRef,idChart)
{
    // Array to store constructed MST
    let parent = [];
    // Key values used to pick minimum weight edge in cut
    let key = [];
    // To represent set of vertices included in MST
    let mstSet = [];
    //order to highlight
    let orderHL = [];
    // Initialize all keys as INFINITE
    for (let i = 0; i < V; i++){
        key[i] = Number.MAX_VALUE;
        mstSet[i] = false;
    }
    // Always include first 1st vertex in MST.
    // Make key 0 so that this vertex is picked as first vertex.
    key[0] = 0;
    parent[0] = -1; // First node is always root of MST
 
    // The MST will have V vertices
    for (let count = 0; count < V; count++)
    {
        // Pick the minimum key vertex from the set of vertices not yet included in MST. Render to browser
        let u = minKey(key, mstSet,V);
        orderHL.push(u);
        // Add the picked vertex to the MST Set
        mstSet[u] = true;
        // Update key value and parent index of the adjacent vertices of the picked vertex. 
        // Consider only those vertices which are not yet included in MST
        for (let v = 0; v < V; v++){
            // graph[u][v] is non zero only for adjacent vertices of m
            // mstSet[v] is false for vertices not yet included in MST
            // Update the key only if graph[u][v] is smaller than key[v]
            if (graph[u][v] && mstSet[v] === false && graph[u][v] < key[v]){
                parent[v] = u;
                key[v] = graph[u][v];
            }
        }
    }
    const k = makeHL(parent,orderHL,V,cyRef,idChart);
    console.log("PRIM AFTER RUN",k);
    return k;
}

//detect invalid adj matrix input
//Return 1 for valid, 0 for invalid
export const detectInvalid = (matrix) => {
    const row = matrix.length;
    const col = matrix[0].length;
    let inValid = false;
    let m = {};
    for (let i=0; i<row; i++){
        for (let j=0; j<col; j++){
            if (matrix[i][j] === 1){
                let curr = `${i}${j}`;
                let r_curr = curr.split("").reverse().join("");
                if (m.hasOwnProperty(r_curr)){
                    m[r_curr] -= 1;
                }else{
                    m[curr] = 1;
                }
            }
        }
    }
    console.log("DEBUG",m);
    Object.keys(m).forEach((key)=>{
        if (m[key] === 1){
            inValid = true;
        }
    });
    if (inValid){return 0;}
    return 1;
}

export const detectInvalidWeight = (matrix) => {
    const row = matrix.length;
    const col = matrix[0].length;
    let inValid = false;
    let m = {};
    for (let i=0; i<row; i++){
        for (let j=0; j<col; j++){
            if (matrix[i][j] > 0){
                let curr = `${i}${j}`;
                let r_curr = curr.split("").reverse().join("");
                if (m.hasOwnProperty(r_curr) && matrix[i][j] === m[r_curr]){
                    m[r_curr] = 0;
                }else{
                    m[curr] = matrix[i][j];
                }
            }
            else if(matrix[i][j] < 0){
                return 0;
            }
        }
    }
    console.log("DEBUG",m);
    Object.keys(m).forEach((key)=>{
        if (m[key] !== 0){
            inValid = true;
        }
    });
    if (inValid){return 0;}
    return 1;
}