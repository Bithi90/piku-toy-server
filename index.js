const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware 
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
  }

app.use(cors(corsOptions));
app.use(express.json());

const categeories = require('./data/category.json')
const toys = require('./data/toy.json')
const featureditems = require('./data/featured.json')


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avf7i9k.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        const toyCollection = client.db("pikuDB").collection("toy");
        const categoryCollection = client.db("pikuDB").collection("categories");
        const featuredCollection = client.db("pikuDB").collection("featured");
        const userCollection = client.db("pikuDB").collection("user");
        const addToyCollection = client.db("pikuDB").collection("addToy");

        app.post('/user', async(req , res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        //add toy 
        app.post('/addToy', async (req, res) => {
            const addToy = req.body;
            console.log(addToy);
            const result = await addToyCollection.insertOne(addToy);
            res.send(result);
        })

        app.get('/addToy', async (req, res) => {
            console.log(req.query.sellerEmail);
            let query = {};
            if(req.query?.sellerEmail){
                query = {sellerEmail: req.query.sellerEmail}
            }

            const cursor = addToyCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Delet Toy

        app.delete('/toy/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })
        app.delete('/addToy/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addToyCollection.deleteOne(query);
            res.send(result);
        })

        // update

        app.patch('/addedToy/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            
            const updateMyToy = req.body;
            console.log(updateMyToy);
           updatedDoc = {
            $set:{
                update:updateMyToy.update
            },
           };
           const result = await addedCollection.updateOne(filter, updatedDoc);
           res.send(result);
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {

                // Include only the `title` and `imdb` fields in the returned document
                projection: { name: 1, category_id: 1, price: 1, picture: 1, details: 1, rating: 1, available_Quantity: 1 },
            };

            const result = await toyCollection.findOne(query, options);
            res.send(result);
        })

        app.get('/toy', async (req, res) => {
            const result = await toyCollection.find().toArray();
            res.send(result);
        })
        app.get('/featured', async (req, res) => {
            const result = await featuredCollection.find().toArray();
            res.send(result);
        })
        app.get('/categories', async (req, res) => {
            const result = await categoryCollection.find().toArray();
            res.send(result);
        })

        app.get('/categories/:id', (req, res) => {
            const id = parseInt(req.params.id);
            
            if (id === 0) {
                res.send(toys)
            }
            else {
                const categoriesToys = toys.filter(n => parseInt(n.category_id) === id);
                res.send(categoriesToys);
            }
        
        })
        

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir); 





// app.get('/categories', (req, res) => {
//     res.send(categeories);
// })
// app.get('/toys', (req, res) => {
//     res.send(toys);
// })
// app.get('/featured', (req, res) => {
//     res.send(featureditems);
// })


app.get('/', (req, res) => {
    res.send('piku is running')
})

app.listen(port, () => {
    console.log(`piku server is running on port ${port}`);
})  