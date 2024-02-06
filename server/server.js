const mongoose = require("mongoose")
const Document = require("./Document")
const express = require("express");
const path = require('path');
const app = express();

mongoose.connect("mongodb+srv://mukesh_singh_09:Msr1150935@cluster0.r79zfbk.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
},()=>{
  console.log("database connection established")
})


app.use(express.static(path.join(__dirname, 'build')));
// Put all API endpoints under '/api'
app.get('/api/data', (req, res) => {
  // Handle API request
  res.json({data: "Some data"});
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port,()=>{
  console.log(`server listening on ${port}`);
});




const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
  },
})




const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
