const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("task management server is running");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.absippg.mongodb.net/?retryWrites=true&w=majority`;

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
    const taskCollocation = client.db("task-management").collection("task");

    app.get("/tasks", async (req, res) => {
      const result = await taskCollocation
        .find()
        .sort({ targetTime: -1 })
        .toArray();
      res.send(result);
      console.log(result);
    });

    app.post("/add-task", async (req, res) => {
      const data = req.body;
      console.log(data);
      const userTask = await taskCollocation
        .find({ name: data?.name })
        .toArray();
      if (userTask) {
        const isExistTask = userTask.find((task) => task.title === data.title);
        if (isExistTask) {
          console.log(isExistTask);
          return res.send({ message: "This task already Exist " });
        }
      }
      const result = await taskCollocation.insertOne(data);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.listen(port);
