const express=require("express")
const passport = require("passport")
const router=express.Router()
const User=require("../models/user")
const catchAsync=require("../utils/catchAsync")



router.get("/register",(req,res)=>{
    res.render("users/register")
})

router.post("/register",catchAsync(async(req,res)=>{
    try{
        const {email ,username, password}=req.body
        const user=new User({email,username})
        const registeredUser=await User.register(user,password)
        req.login(registeredUser,err=>{
            if(err) return next(err)
        })
        req.flash("success","Welcome to YelpCamp")
        res.redirect("/campgrounds")
    }catch(e){
        req.flash("error",e.message)
        res.redirect("register")
    }
}))

router.get("/login",(req,res)=>{
    res.render("../views/users/login.ejs")
})

router.post("/login",passport.authenticate("local",{failureFlash:true,failureRedirect:"/login",keepSessionInfo:true}),(req,res)=>{
    req.flash("success","Welcome to YelpCamp")
    const redirectURL=req.session.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectURL)
})

router.get("/logout",(req,res)=>{
    req.logout(function(err){
        if(err) return next(err)
    })
    req.flash("success","Logged Out!")
    res.redirect("/campgrounds")
})

module.exports=router