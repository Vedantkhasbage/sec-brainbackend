

export const random=(len:number)=>{
   let option="qwertyuiopasdfghjklzxcvbnm1234567890";

   let ans="";
   for(let i=0;i<len;i++){
      ans+=option[Math.floor(Math.random()*option.length)]
   }

  return ans;


}