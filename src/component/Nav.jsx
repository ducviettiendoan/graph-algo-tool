import React from "react";
import { Link } from "@mui/material";

const Nav = () => {
    return (
        <nav style={{display:"flex", justifyContent:"space-around"}}>
            <Link href="/"><div>Home</div></Link>
            <Link href="/bfs"><div>BFS</div></Link>
            <Link href="/dfs"><div>DFS</div></Link>
        </nav>
    )
}

export default Nav;