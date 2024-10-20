import express, { response } from "express";
import { database } from "./config.js";
import { set, ref, push, update, child, get } from "firebase/database";
import { sendEmailHtml } from "./emailer.js";
import bodyParser from "body-parser";

const app = new express();
app.use(express.json({limit:'10mb'}));


const formatData = (data) => {};

const teamHandler = async (response, key) => {
  const teamChoice = response.data.fields[33].value[0];
  const userEmail = response.data.fields[7].value;
  const userName = response.data.fields[4].value;

  let emailData = {
    name: userName
  };
  
  console.log(userEmail)
  //create team and email team id
  if (teamChoice === "1a2071c6-bc0a-4a17-8b36-9d2f8e11a6d4") {
    let teamSlots = [];
    teamSlots.push(key);
    let teamKey = push(child(ref(database), "teams")).key;
    await set(ref(database, "teams/" + teamKey), teamSlots);
    

    // TODO Send email with team ID.
    emailData.teamCode = teamKey
    response.isTeam = true;
    

    await sendEmailHtml(userEmail, "Your application team code", "teamTemplate", emailData);
  }

  // join team with team id
  else if (teamChoice === "cf5063f4-ff1b-4c7a-99e2-0c327971c932") {
    console.log("User wants to join team");
    const teamID = response.data.fields[34].value;
    console.log(teamID);
    const teamRef = ref(database, "teams/" + teamID);
    
    try {
      const teamDoc = await get(teamRef);
      if (teamDoc.exists()) {
        let teamSlots = teamDoc.val() || [];
        teamSlots.push(key);
        await set(teamRef, teamSlots);

        emailData.teamCode = teamID;
        
        await sendEmailHtml(userEmail, "You've joined a team", "teamJoinTemplate", emailData);
        sendEmail(userEmail, "First name", "You've joined a team", textString)
        response.isTeam = true;
      } else {
        console.log("Team doesn't exist");

        // TODO Send email confirming email has been sent. 
        var textString = `No team has been found with ${teamKey}.`
        sendEmail(userEmail, "First name", "The team you tried joining does not exist", textString)


        // There needs to be a system to handle errors 
      }
    } catch (err) {
      console.log("Error fetching or updating team:", err);
      // TODO Send email with error that team has not been joined. 
    }
  }
};

app.post("/tallyhook", async (req, res) => {

  console.log("Trying to update database...");
  try {
    let content = req.body;
    console.log("Adding isAccepted, isTeam, and removing list of countries and schools")
    content["accepted"] = false;
    content["isTeam"] = false;
    if (Array.isArray(content.data?.fields)) {
      // Set 'options' to null at specific indices
      if (content.data.fields[10]) {
          content.data.fields[10].options = null;
      }
      if (content.data.fields[11]) {
          content.data.fields[11].options = null;
      }
  }

    



    let responseKey = push(child(ref(database), "responses")).key;
    let userEmail = content.data.fields[7].value;
    let userName =  content.data.fields[4].value;
    let emailData = {
      name: userName,
    };


    // TODO Send email confirming data has been saved. 
    await sendEmailHtml(userEmail, "We've received your application!", "generalConfirmation", emailData);
    await teamHandler(content, responseKey);

    await set(ref(database, "responses/" + responseKey), content);

    res.status(200).send("Updated database");

    
    var textString = `We've received your application! We will begin accepting applications shortly.`
    sendEmail(userEmail, "First name", "We've received your application!", textString)

    
  } catch (err) {
    console.log(err);
    res.status(500).send("error storing data");
  }
});

app.post('/rawJSONView', async (req,res)=>{

    try{

   let content = req.body
   
   if (Array.isArray(content.data?.fields)) {
    // Set 'options' to null at specific indices
    if (content.data.fields[10]) {
        content.data.fields[10].options = null;
    }
    if (content.data.fields[11]) {
        content.data.fields[11].options = null;
    }
}


   let responseKey = push(child(ref(database),"responses")).key

    await set(ref(database , "responses/" + responseKey),content)
    res.status(200).send("Updated database")
    

    }
    catch{
        console.log('error updating database')
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

app.listen(3000, () => {
  console.log("The server is running on port 3000");
});


