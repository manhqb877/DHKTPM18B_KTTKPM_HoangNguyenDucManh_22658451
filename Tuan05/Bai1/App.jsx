import { useState, useEffect } from "react";

function App() {

  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  const addPost = () => {
    fetch("http://localhost:3001/posts", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({title})
    });
  };

  return (
    <div>
      <h1>Simple CMS</h1>

      <input onChange={(e)=>setTitle(e.target.value)} />

      <button onClick={addPost}>Add Post</button>

      {posts.map((p,i)=>(<p key={i}>{p.title}</p>))}

    </div>
  );
}

export default App;