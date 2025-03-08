import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin'

import { getDatabase, ref,set,remove } from "firebase/database";

import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config()
const key = process.env.ADMIN_INFO
const serviceAccount = JSON.parse(Buffer.from(key,'base64').toString('utf-8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sfhacks2025-default-rtdb.firebaseio.com"
});
const database = admin.database();


//test writing/reading from database
const write = (s, id)=>{
  try{
    set(ref(database,'blah/' + id), {
        word: s
    });
    console.log("successfully written")
  }
  catch (err){
    console.log(err)
  }
    
    return


}

const clearDb = ()=>{ // if you run this function it will fucking delete everything
  const responsesRef = ref(database, 'responses');
  const teamsRef = ref(database, 'teams')
  remove(responsesRef)
  .then(() => {
    console.log('Responses node deleted successfully.');
  })
  .catch((error) => {
    console.error('Error deleting responses node:', error);
  });
  remove(teamsRef)
  .then(() => {
    console.log('Responses node deleted successfully.');
  })
  .catch((error) => {
    console.error('Error deleting responses node:', error);
  });
  
}








export {database}