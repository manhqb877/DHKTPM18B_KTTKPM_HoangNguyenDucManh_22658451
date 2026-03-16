import { useState } from "react";
import Posts from "./Posts";
import Plugins from "./Plugins";

function App(){

  const [page,setPage] = useState("posts");

  return(

    <div>

      <h1>CMS Admin</h1>

      <button onClick={()=>setPage("posts")}>Posts</button>
      <button onClick={()=>setPage("plugins")}>Plugins</button>

      {page==="posts" && <Posts/>}
      {page==="plugins" && <Plugins/>}

    </div>

  )

}

export default App;