import dotenv from 'dotenv'
dotenv.config();

declare global {
    namespace Express {
      export interface Request {
       userId?:string           //to ignore the ts-ignore error by typecsript defined useid as global
      }
    }
  }
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
// import userRouter from './router/user'
import z from 'zod'
import bcrypt from 'bcrypt'
import { contentModel, shareModel, userModel } from './database';
import { userMiddleware } from './usermiddleware';
import { random } from './randomlink';
const JWT_KEY=process.env.JWT_KEY as string

const app=express();
app.use(express.json())
app.use(cors())

app.post("/api/v1/signUp",async(req,res)=>{
    const requiredDataTypes=z.object({
        name:z.string().min(3).max(100),
        email:z.string().min(5).max(100).email(),
        password:z.string().min(5).max(100)
    })
    

    const checkrequiredDataTypes=requiredDataTypes.safeParse(req.body);
    if(!checkrequiredDataTypes.success){
        res.json({
            message:"Invalid Input Format"
        })
     return;
    }
    console.log(checkrequiredDataTypes);

    const{name,email,password}=req.body;
     const hashedpassword=await bcrypt.hash(password,5);

   try {  const adduserinDB=await userModel.create({
            name:name,
            email:email,
            password:hashedpassword
       })
       res.json({
        message:"Success"
       })
    } catch(e){
        res.status(411).json({
            message:"user already exists"
        })
    }
})


app.post("/api/v1/signIn",async(req,res)=>{
      const requiredDataTypes=z.object({
        email:z.string().min(3).max(100).email(),
        password:z.string().min(3).max(100)
      })
       const checkrequiredDataTypes=requiredDataTypes.safeParse(req.body);
       if(!checkrequiredDataTypes.success){
        res.json({
            message:"Invalid input"
        })
        return;
       }
       
       const{email,password}=req.body;
      try{
        const checkWithEmail=await userModel.findOne({
          email:email
       })
            

       if(!checkWithEmail){
        res.status(404).json({
            message:"user not found"
        })
          return;
       }

       const findUserInDB=await bcrypt.compare(password,checkWithEmail.password as string);
       if(!findUserInDB){
        res.status(404).json({
            message:"user not found"
        })
          return;
       }

       const token=jwt.sign({
         id:checkWithEmail._id
       },JWT_KEY)

        res.json({
            token:token
        })

} catch(e){
    res.status(404).json({
        message:"user not found"
    })
}

})



app.post("/api/v1/content",userMiddleware,async(req,res)=>{
       const userId=req.userId;
        const {type,link,title}=req.body;
        const addData=await contentModel.create({
             type:type,
             link:link,
              userId:userId,
              title:title,
              tag:[]
        })
        res.json({
            message:"content added"
        })

})




app.get("/api/v1/mycontent",userMiddleware,async(req,res)=>{
    const userId=req.userId;
   const content=await contentModel.find({
        userId
    }).populate("userId","name")

    res.json({
        content:content
    })
})

app.delete("/api/v1/delete",userMiddleware,async(req,res)=>{

    const userId=req.userId;
     
    const deletedContent=await contentModel.deleteMany({
        userId
    })
    res.json({
        message:deletedContent
    })


})

app.delete("api/v1/deletespecific",userMiddleware,async(req,res)=>{
  const userId=req.userId;
  
})

app.post("/api/v1/brain/share",userMiddleware,async(req,res)=>{
         const userId=req.userId;
         const share=req.body.share;
         if(share){

           const existingLink=await shareModel.findOne({
                 _id:userId
           })
            if(existingLink){
                res.json({
                  message:existingLink.hash
                })
                return;
            }

            const hash=random(10)
             const sharelink=await shareModel.create({
                hash:hash, //sharable random link
                userId:userId
             })

             res.json({
                message:hash
             })

        } else{
            const deletelink=await shareModel.deleteOne({
              userId:userId
            })
            res.json({
                message:"link deleted!!!"
             })
        }

        
})



app.get("/api/v1/brain/:sharelink",async(req,res)=>{
        
      const hash=req.params.sharelink;
       console.log(hash)
      const link=await shareModel.findOne({
        hash
      })

      console.log(link)
     
      if(!link){
        res.status(411).send({
            message:"Invalid Link"
        })
        return;
      }

      const content=await contentModel.find({
         userId:link.userId
      })

      if(!content){
        res.status(411).send({
            message:"wrong"
        })
      }
         
      const user=await userModel.findOne({
        _id:link.userId
      })
        
      if(!user){
        res.status(404).send({
            message:"User not found"
        })
        return;
      }

      res.json({
        username:user.name,
        Content:content
      })
})

app.listen(2000,()=>{
    console.log("app started")
})