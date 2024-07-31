export const SendCreate = (res,message,data)=>{
    res.status(201).json({success: true, message,data})
}
export const SendSuccess =(res,message,data)=>{
    res.status(200).json({success: true,message,data});
}
export const SendError400 = (res,message,error)=>{
    res.status(400).json({success: false,message,error,data:{}}) // Bad Request
}
export const SendError = (res,status,message,error)=>{
    res.status(status).json({success: false,message,error,data:{}}) 
}