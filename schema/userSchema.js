const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        // unique : true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    fullname:{
        type:String,
        required:true
    },
    role:{
        type:String,
    },
    mobile:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    flag:{
        type:Boolean,
        default:false
    }
})

const user=mongoose.model("practice",userSchema);

module.exports=user;