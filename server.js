import express from 'express'
import mongoose from 'mongoose'
import Messages from './messages.js'
import Pusher from 'pusher'
import cors from 'cors'
//config
const app=express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
    appId: "1135211",
    key: "1dda3cfe66bdb72fabb6",
    secret: "915d94316da69b76ffae",
    cluster: "us3",
    useTLS: true
  });

//middleware
app.use(express.json());

app.use(cors())

// database config
const connection_url = "mongodb+srv://ohms1:root@cluster0.808ta.mongodb.net/<whatsapp?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology:true
});

const db = mongoose.connection

db.once('open', ()=> {
    console.log("Database Connected")
    const msgCollection = db.collection("messagecontents");
    const changestream = msgCollection.watch();
    changestream.on("change", (change) => {
        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger("message", "inserted", {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            })
        }
        else {
            console.log('error with pusher trigger')
        }


    } )
})

// api routes
app.get("/", (req, res) => res.status(200).send("hello world"))

app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        }
        else {
            res.status(200).send(data)
        }
    })
})

app.post ("/messages/new", (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err){
            res.status(500).send(err)
        }
        else {
            res.status(201).send('new message created')
        }
    })
})

//listen
app.listen(port, () => console.log('Listening on localhost:9000'))
