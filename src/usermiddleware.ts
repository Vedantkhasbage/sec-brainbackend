const JWT_KEY=process.env.JWT_KEY as string

import { NextFunction,Request,Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

 export function userMiddleware(req:Request,res:Response,next:NextFunction){
    const token=req.headers["authorization"] as string
    console.log(token)
    const verifyuserWithToken=jwt.verify(token,JWT_KEY);
    console.log(verifyuserWithToken)
    if(verifyuserWithToken){

                 if(typeof verifyuserWithToken==="string"){
                        res.status(403).send({
                            message:"Not log In"
                        })
                    return;
                 }   
        req.userId=(verifyuserWithToken as JwtPayload).id
          next();
    } else{
        res.json({
            message:"user not found"
        })
    }

}