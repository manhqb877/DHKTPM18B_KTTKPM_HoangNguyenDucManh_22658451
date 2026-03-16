import { useState,useEffect } from "react";

function Posts(){

  const [posts,setPosts] = useState([]);
  const [title,setTitle] = useState("");

  useEffect(()=>{

    fetch("http://localhost:3001/posts")
      .then(res=>res.json())
      .then(data=>setPosts(data))

  },[])

  const addPost = ()=>{

    fetch("http://localhost:3001/posts",{

      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({title})

    }).then(()=>{

      setPosts([...posts,{title}])

    })

  }

  return(

    <div>

      <h2>Posts</h2>

      <input onChange={(e)=>setTitle(e.target.value)}/>

      <button onClick={addPost}>Add</button>

      {posts.map((p,i)=>(

        <p key={i}>{p.title}</p>

      ))}

    </div>

  )

}

export default Posts;