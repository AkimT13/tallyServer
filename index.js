import express from 'express'
import { database } from './config.js'
import {set,ref,push, update,child} from 'firebase/database'
    



const app = new express()
app.use(express.json())

const formatData = (data) =>{

    

}

const teamHandler = async (response, key) => {
    const teamChoice = response.data.fields[3].value[0]
    if(teamChoice==="aa876992-5e5c-4de0-bb4a-1e9081543670"){
        let teamSlots = [];
        teamSlots.push(key)
        let teamKey = push(child(ref(database),'teams')).key
        await set(ref(database,"teams/" + teamKey), teamSlots

    )
    return
    }
}



app.post("/tallyhook", async (req, res) =>{
    console.log("Trying to update database...")
    try{
       let content = req.body

       let responseKey = push(child(ref(database),'responses')).key

       teamHandler(content,responseKey)
       
       await set(ref(database,"responses/" + responseKey), 
        content
       )
       console.log("Updated database")

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



