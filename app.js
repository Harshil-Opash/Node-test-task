const express=require("express")
const app=express();
const mongoose=require("mongoose");
const ragistartion=require("./routes/route")


const db="mongodb+srv://harshil:root@cluster0.y6kcj5w.mongodb.net/userdata?retryWrites=true&w=majority"
mongoose.connect(db).then(()=>{
    console.log("database connected");
})

app.use(express.json());
app.use("/",ragistartion)

app.listen(4500,()=>{
    console.log("server started at the port 4500");
});