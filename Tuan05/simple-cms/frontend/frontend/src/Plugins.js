import { useEffect,useState } from "react";

function Plugins(){

  const [plugins,setPlugins] = useState([]);

  useEffect(()=>{

    fetch("http://localhost:3001/plugins")
      .then(res=>res.json())
      .then(data=>setPlugins(data))

  },[])

  return(

    <div>

      <h2>Installed Plugins</h2>

      {plugins.map((p,i)=>(

        <p key={i}>{p}</p>

      ))}

    </div>

  )

}

export default Plugins;