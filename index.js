const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.bfkro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobsCollection = client.db("soloSphereDB").collection("jobs");
    const bidCollection = client.db("soloSphereDB").collection("bids");

    // get all jobs
    app.get("/all-jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    // get all jobs posted by specific jobs
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    // get a single data by id form db
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // get all bids by specific email address
    app.get("/bids/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bidCollection.find(query).toArray();
      res.send(result);
    });

    // post a bid request
    app.post("/bid", async (req, res) => {
      const bidData = req.body;
      const query = { email: bidData.email, jobId: bidData.jobId };
      const alreadyExists = await bidCollection.findOne(query);

      if (alreadyExists)
        return res
          .status(400)
          .send("You have already placed a bid on this job ");

    
      const result = await bidCollection.insertOne(bidData);
      const filter = { _id: new ObjectId(bidData.jobId) };
      const update = {
        $inc: { bid_count: 1 },
      };
      const options = { upsert: true };
      const updatedBidCount = await jobsCollection.updateOne(
        filter,
        update,
        options
      );
      res.send(result);
    });

    // add jobs
    app.post("/add-job", async (req, res) => {
      const jobInfo = req.body;
      const result = await jobsCollection.insertOne(jobInfo);
      res.send(result);
    });

    // update specific user jobs
    app.put("/update-job/:id", async (req, res) => {
      const id = req.params.id;
      const jobInfo = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedJob = {
        $set: jobInfo,
      };
      const options = { upsert: true };
      const result = await jobsCollection.updateOne(query, updatedJob, options);
      res.send(result);
    });

    // delete specific user jobs
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("soloSphere is running ");
});

app.listen(port, () => {
  console.log(`soloSphere is listening on port ${port}`);
});
