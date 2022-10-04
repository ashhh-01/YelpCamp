const express=require("express")
const router=express.Router()
const catchAsync=require("../utils/catchAsync")
const ExpressError=require("../utils/ExpressError")
const Campground=require("../models/campground")
const {campgroundSchema}=require("../schemas")
const {isLoggedin,isAuthor,validateCampground}=require("../middleware")




router.get("/",async(req,res)=>{
    const campgrounds=await Campground.find()
    res.render("campgrounds/index",{campgrounds})
})



router.get("/new",isLoggedin,(req,res)=>{
    res.render("campgrounds/new")
})


router.post("/",isLoggedin,validateCampground,catchAsync(async(req,res)=>{
    // if(!req.body.campground) throw new ExpressError("Invalid Campground",400)
    const campground=new Campground(req.body.campground)
    campground.author=req.user._id
    await campground.save()
    req.flash("success","Successfully made a campground")
    res.redirect(`/campgrounds/${campground._id}`)
}))



router.get("/:id" ,catchAsync(async(req,res)=>{
    const {id}=req.params
    const campground=await Campground.findById(id).populate("reviews").populate("author")
    if(!campground){
        req.flash("error","cant find Your campground!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show",{campground})
}))


router.get("/:id/edit",isLoggedin,isAuthor,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    if(!campground){
        req.flash("error","cannot find campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit",{campground})
}))




router.put("/:id",isLoggedin,isAuthor,validateCampground,catchAsync(async(req,res)=>{
    const {id}=req.params
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash("success","Successfully Updated Campground")
    res.redirect(`/campgrounds/${campground._id}`)
}))



router.delete("/:id",isLoggedin,isAuthor,catchAsync(async(req,res)=>{
    const {id}=req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success","Deleted your Campground")
    res.redirect("/campgrounds")
}))



module.exports=router