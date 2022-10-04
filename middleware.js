const {campgroundSchema}=require("./schemas")
const ExpressError=require("./utils/ExpressError")
const Campground=require("./models/campground")
const {reviewSchema}=require("./schemas")

module.exports.isLoggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl  //req.path<- just the routing path whereas req.originalUrl<- Entire path
        req.flash("error","You must be signed-in!")
        return res.redirect("/login")
    }
    next()
}

module.exports.validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(msg,400)
    }else{
        next()
    }
}

module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const campground=await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash("error","Permission denied")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


module.exports.validateReview=(req,res,next)=>{
    const {err}=reviewSchema.validate(req.body)
    if(err){
        const msg=err.details.map(e=>e.message).join(",")
        throw new ExpressError(msg,400)
    }else{
        next()
    }
}
