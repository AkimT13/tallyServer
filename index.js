import express from 'express'
import { database } from './config.js'
import {set,ref,push, update,child} from 'firebase/database'
    

const app = new express()
app.use(express.json())

const formatData = (data) =>{
    let formatted = {
        name: null,
        email: null,
        age: null,
        
    };

}

app.post("/tallyhook", async (req, res) =>{
    try{
       let content = req.body
       let responseKey = push(child(ref(database),'respones')).key

       await set(ref(database,"responses/" + responseKey), 
        simplify(content)
       )

    }
    catch(err){
        console.log(err)
        res.status(500).send("error storing data")
    }
})

function simplify(tallyContent) {
  const tallyFormEntries = tallyContent.data.fields;
  const output = {};

  tallyFormEntries.forEach((entry) => {
    output[entry.key] = entry.value;
  });

  return output;
}

app.listen(3000, ()=>{
    console.log("The server is running on port 3000")
})



