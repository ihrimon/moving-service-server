const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 4000;

// MiddleWare
app.use(cors());
app.use(express.json());

// add Database User with env
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zaiok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {

        // Connect to database
        await client.connect();
        const database = client.db("moving_services")
        const serviceCollection = database.collection("services")
        const usersCollection = database.collection('users');
        const orderCollection = database.collection("orders")
        const reviewCollection = database.collection('reviews');

        // Get Services to database
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        })

        // Send review to database
        app.post('/reviews', async (req, res) => {
            console.log("hitting")
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })

        // Get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        })

        // // Get Single product id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await serviceCollection.findOne(query);
            res.json(package);
        })

        // // Send Order to database
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // // Get Orders to database
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // // Get email with filter for my orders
        app.post('/orders/email', async (req, res) => {
            const email = req.body.email;
            const query = { "email": email };
            const result = await orderCollection.find(query).toArray();
            res.json(result);
        })

        // // Send User to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // // Upsert using for google login user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });  

        // //update status
        // app.post('/updateStatus', async (req, res) => {
        //     const id = req.body.id;
        //     const status = req.body.status;
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true };
        //     const updateStatus = {
        //         $set: {
        //             "status": status === 'Pending' ? 'Shipped' : 'Pending'
        //         },
        //     };
        //     const result = await orderCollection.updateOne(filter, updateStatus, options);
        //     res.json(result);
        // });

        // Delete Orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Moving Service website node mongo server')
});

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})