import express from 'express'
import { database } from './config.js'
import {set,ref,push} from 'firebase/database'
    

const app = new express()
app.use(express.json())



app.post("/tallyhook", async (req, res) =>{
    try{
       let content = req.body
       let responseKey = push(child(ref(database),'respones')).key

       await set(ref(database,"responses/" + responseKey), {
        content
       })

     

    }
    catch(err){
        console.log(err)
        res.status(500).send("error storing data")
    }
})

app.listen(3000, ()=>{
    console.log("The server is running on port 3000")
})



