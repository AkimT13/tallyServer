import express from 'express'
import { database } from './config.js'
import {set,ref,push, update,child,get} from 'firebase/database'
    



const app = new express()
app.use(express.json())

const formatData = (data) =>{

    

}



const teamHandler = async (response, key) => {
    const teamChoice = response.data.fields[3].value[0]
    const userEmail = response.data.fields[1].value
    //create team and email team id
    if(teamChoice==="aa876992-5e5c-4de0-bb4a-1e9081543670"){ 
        let teamSlots = [];
        teamSlots.push(key)
        let teamKey = push(child(ref(database),'teams')).key
        await set(ref(database,"teams/" + teamKey), teamSlots


    )

    }
    // join team with team id
   else if (teamChoice === "b85b3d71-75f0-4702-b58b-ceb37d52a56c") {
    
    console.log("User wants to join team");
    const teamID = response.data.fields[2].value;
    console.log(teamID);
    const teamRef = ref(database, "teams/" + teamID);

    try {
      const teamDoc = await get(teamRef);
      if (teamDoc.exists()) {
        let teamSlots = teamDoc.val() || [];
        teamSlots.push(key);
        await set(teamRef, teamSlots);
      } else {
        console.log("Team doesn't exist");
      }
    } catch (err) {
      console.log("Error fetching or updating team:", err);

    }

  }
    
}





app.post("/tallyhook", async (req, res) =>{
    console.log("Trying to update database...")
    try{
       let content = req.body
       console.log(content)
       content["accepted"] = null
       content["isTeam"] = null
       console.log(content)


       let responseKey = push(child(ref(database),'responses')).key

       await teamHandler(content,responseKey)

       
       await set(ref(database,"responses/" + responseKey), 
        content
       )
       

       res.status(200).send("Updated database")

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



