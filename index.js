import express, { response } from "express";
import { database } from "./config.js";
import { set, ref, push, update, child, get } from "firebase/database";
import { sendEmailHtml } from "./emailer.js";
import bodyParser from "body-parser";
import QRCode from "qrcode"
import { generateQRCode } from "./qrCodeGenerator.js";
import cors from "cors"

const app = new express();
app.use(express.json({limit:'10mb'}));

app.use(cors());


const formatData = (data) => {};

const teamHandler = async (response, key) => {
  const teamChoice = response.data.fields[33].value[0];
  const userEmail = response.data.fields[7].value;
  const userName = response.data.fields[4].value;

  let emailData = {
    name: userName,
    personalKey: key
  };
  
  console.log(userEmail)
  //create team and email team id
  if (teamChoice === "1a2071c6-bc0a-4a17-8b36-9d2f8e11a6d4") {
    let teamSlots = [];
    teamSlots.push(key);
    let teamKey = push(child(ref(database), "teams")).key;
    await set(ref(database, "teams/" + teamKey), teamSlots);
    console.log("User wants to create a team")
    console.log("Key: " + teamKey)
   


    
    emailData.teamCode = teamKey
    emailData.personalCode = key
    response.isTeam = true;
    response.teamID = teamKey
    

    await sendEmailHtml(userEmail, "Your application team code", "teamTemplate", emailData);
  }

  // join team with team id
  else if (teamChoice === "cf5063f4-ff1b-4c7a-99e2-0c327971c932") {
    console.log("User wants to join team");
    const teamKey = response.data.fields[34].value;
    console.log(teamKey);
    const teamRef = ref(database, "teams/" + teamKey);

    
    try {
      const teamDoc = await get(teamRef);
      if (teamDoc.exists() && teamDoc.val().length < 4) {
        let teamSlots = teamDoc.val() || [];
        teamSlots.push(key);
        await set(teamRef, teamSlots);

        emailData.teamCode = teamKey;
        
        await sendEmailHtml(userEmail, "You've joined a team", "teamJoinTemplate", emailData);
       
        response.isTeam = true;
        response["teamID"] = teamKey;
      }
      
      
       else {
        console.log("Team doesn't exist or full");

        // TODO Send email confirming email has been sent. 
        var textString = `No team has been found with ${teamKey}.`
        await sendEmailHtml(userEmail, "The team you tried joining does not exist or is full", "teamNotExist", emailData);

        console.log(`Team not found email sent to ${userEmail}`);
        // There needs to be a system to handle errors 
      }
    } catch (err) {
      console.log("Error fetching or updating team:", err);
      // TODO Send email with error that team has not been joined. 
    }
  }
  else{ // no team
    console.log("User wants to join with no team")
    await sendEmailHtml(userEmail, "We've received your application!", "generalConfirmation", emailData);
  }
};

app.post("/tallyhook", async (req, res) => { // tally webhook is attached to this route, it will process any incoming forms and store it as well as email handling

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
    
    await teamHandler(content, responseKey);

    await set(ref(database, "responses/" + responseKey), content);

    res.status(200).send("Updated database");

    
    var textString = `We've received your application! We will begin accepting applications shortly.`
    

    
  } catch (err) {
    console.log(err);
    res.status(500).send("error storing data");
  }
});

app.post('/modifyApplication', async (req, res) => { 
  try {
    const content = req.body;
    const choice = content.data.fields[1].value[0];
    const personalKey = content.data.fields[0].value;
    const userRef = ref(database, "responses/" + personalKey);

    const userSnapshot = await get(userRef);
    if (!userSnapshot.exists()) {
      console.log("Invalid personal key: User not found.");
    } else {
      const user = userSnapshot.val();
      const userEmail = user.data.fields[7].value;
      let emailData = { name: user.data.fields[4].value };

      if (choice === "71da61d4-5eb5-46e9-8e46-f17ee72e264f") { // Join Team
        const targetTeamID = content.data.fields[2].value;
        console.log("User wants to join a team (Teamchangeform)")

        if (user.isTeam && user.teamID === targetTeamID) {
          // User is already in the target team
          emailData.teamCode = targetTeamID;
          await sendEmailHtml(userEmail, "You've successfully joined a new team!", "teamJoin(Change)", emailData);
          console.log("User is already in the target team.");
        } else {
          const targetTeamRef = ref(database, "teams/" + targetTeamID);
          const teamSnapshot = await get(targetTeamRef);
          
          if (teamSnapshot.exists() && teamSnapshot.val().length < 4) {
            // Remove from old team if they have one
            
            if (user.isTeam) {
              console.log("Removing from old team")
              const oldTeamRef = ref(database, "teams/" + user.teamID);
              const oldTeamSnapshot = await get(oldTeamRef);
              let oldTeamMembers = oldTeamSnapshot.val() || [];
              oldTeamMembers = oldTeamMembers.filter(id => id !== personalKey);
              await set(oldTeamRef, oldTeamMembers);
            }

            // Add to new team
            console.log("Adding to new team")
            console.log(targetTeamID)
            let teamMembers = teamSnapshot.val() || [];
            teamMembers.push(personalKey);
            await set(targetTeamRef, teamMembers);

            // Update user data
            await update(userRef, { isTeam: true, teamID: targetTeamID });
            
            // Confirmation email
            emailData.teamCode = targetTeamID;
            await sendEmailHtml(userEmail, "You've successfully joined a new team!", "teamJoin(Change)", emailData);

          } else {
            await sendEmailHtml(userEmail, "Error joining team", "teamChangeError", emailData);
            console.log("Error joining team");
          }
        }

      } else if (choice === "ed727858-2c94-41fd-b55e-87e69264b448") { // Leave Team
        if (user.isTeam) {
          console.log("User wants to leave team")
          const teamRef = ref(database, "teams/" + user.teamID);
          const teamSnapshot = await get(teamRef);
          let teamMembers = teamSnapshot.val() || [];
          teamMembers = teamMembers.filter(id => id !== personalKey);
          await set(teamRef, teamMembers);
          67
          await update(userRef, { isTeam: false, teamID: null });
          await sendEmailHtml(userEmail, "You've left your team", "teamLeave", emailData);
        } else {
          console.log("User is not part of any team.");
        }

      } else { // Create My Own Team
        console.log("User wants to create new team")
        // Remove from old team if exists
        if (user.isTeam) {
          console.log("Removing user from old team")
          const oldTeamRef = ref(database, "teams/" + user.teamID);
          const oldTeamSnapshot = await get(oldTeamRef);
          let oldTeamMembers = oldTeamSnapshot.val() || [];
          oldTeamMembers = oldTeamMembers.filter(id => id !== personalKey);
          await set(oldTeamRef, oldTeamMembers);
        }
        
        console.log("Creating new team")
        // Create a new team
        let newTeamID = push(child(ref(database), "teams")).key;
        await set(ref(database, "teams/" + newTeamID), [personalKey]);
        console.log("TeamID: " + newTeamID)
        // Update user data
        await update(userRef, { isTeam: true, teamID: newTeamID });
        
        // Send new team code email
        emailData.teamCode = newTeamID;
        await sendEmailHtml(userEmail, "Your new team has been created!", "teamCreate(Change)", emailData);
      }
    }
    
    res.status(200).send("Team preferences updated successfully.");
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating data');
  }
});

app.post('/rawJSONView', async (req,res)=>{ //replace a tally form with this route if you want to see/store unproccessed JSON data without email functionality

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


   let responseKey = push(child(ref(database),"rawData")).key

    await set(ref(database , "rawData/" + responseKey),content)
    res.status(200).send("Updated database")
    

    }
    catch{
        console.log('error updating database')
    }

    
})


app.post("/generate-qrcodes", async (req,res)=>{

  const users = req.body.users; // List of { key, email }

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({ error: "Invalid request format" });
  }

  const results = [];

  for (const { key, email } of users) {
    const qrCode = await generateQRCode(key);
    if (!qrCode) {
      results.push({ key, emailSucceeded: false });
      continue;
    }

    
    const emailSucceeded = await sendEmailHtml(email,"You've been accepted to sfhacks","qrCode",{qrCode});
    results.push({ key, emailSucceeded });
  }

  res.json(results);
  
  
    
    
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


