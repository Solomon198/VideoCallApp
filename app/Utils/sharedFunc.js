

export function getObjectKeys(object,excludekeys){
   let obj = {};
   obj = Object.assign(obj,object);
   let arr = Object.keys(obj);
   arr.forEach((val,index)=>{
       excludekeys.forEach((excludekeysVal)=>{
           if(val == excludekeysVal){
              arr.splice(index,1);
           }
       })
   })
   console.log(arr)
   return arr;
}