import { Router } from "express";


const router = Router();

router.get('/',(req,res)=>{
    console.log('base route')
    res.send("base url")
});

router.post('/register',(req,res)=>{
    console.log('registering user')
    res.json({message:"registering user"})
});
router.post('/login',(req,res)=>{
    console.log('login user')
    res.json({message:"login user"})
});

export default router;