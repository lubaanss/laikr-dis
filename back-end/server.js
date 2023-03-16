// require mongoose and express
require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')

const userRoute = require("./src/routes/user.route")


// Aplikacijas konfigurācija
const PORT = process.env.PORT || 4000;
mongoose.connect('mongodb://localhost/webproject').then((conectInfo) =>
{
    // Datubaze no parametra conectInfo.connections[0].name
    console.log(`Connected to "${conectInfo.connections[0].name}" database`);
}).catch(() =>
{
    console.log('Error: Could not connect to database');
});

// Ekspresa konfigurācija
const app = express();
app.use(express.json());
app.use(cors());


app.use("/users",userRoute)



app.listen(PORT,() =>
{
    console.log(`Server is running on port ${PORT}.`);
});
app.get("/",(req,resp) =>
{
    console.log("Server is running");
    resp.send("Server is Running");
})
