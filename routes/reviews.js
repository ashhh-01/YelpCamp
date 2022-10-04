const express=require("express")
const router=express.Router({mergeParams:true})
const ExpressError=require("../utils/ExpressError")
const Campground=require("../models/campground")
const Review=require("../models/review")
const {reviewSchema}=require("../schemas")
const catchAsync=require("../utils/catchAsync")

const {validateReview}=require("../middleware")



router.post("/",validateReview,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    const review=new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success","Added your review")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:reviewId",catchAsync(async(req,res)=>{
    const {id,reviewId}=req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success","Deleted your review")

    res.redirect(`/campgrounds/${id}`)
}))
module.exports =router