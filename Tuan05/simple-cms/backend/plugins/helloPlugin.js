module.exports = {

  name: "Hello Plugin",

  init: function(app){

    app.get("/plugin/hello",(req,res)=>{

      res.json({
        message:"Hello from Plugin"
      })

    })

  }

}