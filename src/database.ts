import mongoose ,{model,Schema} from 'mongoose';

mongoose.connect(process.env.mongourl as string)


const userSchema=new Schema({
    name:String,
    email:{
        require:true,
        unique:true,
        type:String
    },
    password:{
        type:String,
        require:true
    }
})

const conentSchema=new Schema({
    type:String,
    link:String,
    userId:{
        type:mongoose.Types.ObjectId,
        require:true,
        ref:'user'
    },
    title:String,
    tag:[{type:mongoose.Types.ObjectId,ref:"Tag"}]
})

const shareSchema=new Schema({
    hash:String,
    userId:{
        type:mongoose.Types.ObjectId,
        require:true,
        ref:'user',
        unique:true
    }
})
 export const shareModel=mongoose.model("share",shareSchema);

 export const userModel=mongoose.model("user",userSchema);
export const contentModel=mongoose.model("contnet",conentSchema);