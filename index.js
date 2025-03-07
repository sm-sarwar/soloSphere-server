const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.bfkro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const jobsCollection = client.db("soloSphereDB").collection('jobs')


    // get all jobs
    app.get('/all-jobs', async(req, res)=>{
      const result = await jobsCollection.find().toArray()
      res.send(result)
    })

    // add jobs 
    app.post('/add-job', async(req,res )=>{
      const jobInfo = req.body;
      const result = await jobsCollection.insertOne(jobInfo)
      res.send(result);
    })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('soloSphere is running ')
})


app.listen(port, () => {
    console.log(`soloSphere is listening on port ${port}`)
  })