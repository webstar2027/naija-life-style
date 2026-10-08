const express=require('express');const path=require('path');const app=express();const PORT=process.env.PORT||10000;
app.use(express.json());app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(req,res)=>res.json({ok:true,game:'Naija Lifestyle',version:'3.0.0'}));
app.get('*splat',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Naija Lifestyle running on port ${PORT}`));
