const express=require("express")
const app= express()
const path=require("path")
const mongoose=require("mongoose")
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate")
const session=require("express-session")
const flash=require("connect-flash")
const passport=require("passport")
const LocalStrategy=require("passport-local")

const Campground=require("./models/campground")
const catchAsync=require("./utils/catchAsync")
const ExpressError=require("./utils/ExpressError")
const { join } = require("path")
const {campgroundSchema, reviewSchema}=require("./schemas")
const Review=require("./models/review")
const campgroundRoutes=require("./routes/campground")
const reviewRoutes=require("./routes/reviews")
const userRoutes=require("./routes/users")
const User=require("./models/user")

//connection with error handler
mongoose.connect('mongodb://localhost:27017/yelpcamp')

const db=mongoose.connection
db.on("error",console.error.bind(console,"Connection error:"))
db.once("open",()=>{
    console.log("Database connected")
})

//Templating engine
app.engine("ejs",ejsMate)
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

//Use Form Data
app.use(express.urlencoded({extended:true}))
//Use PUT/PATCH and DELETE functionality 
app.use(methodOverride("_method"))

const sessionConfig={
    secret:"ThisisSecret",
    resave:false,
    saveUninitialized:true,
    cookies:{
        httpOnly:true,
        expires:Date.now()*1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser()) //Inside Session
passport.deserializeUser(User.deserializeUser()) //Outside Session



//Extra Layer of Validation
const validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(msg,400)
    }else{
        next()
    }
}
const validateReview=(req,res,next)=>{
    const {err}=reviewSchema.validate(req.body)
    if(err){
        const msg=err.details.map(e=>e.message).join(",")
        throw new ExpressError(msg,400)
    }else{
        next()
    }
}

app.use((req,res,next)=>{
    res.locals.currentUser=req.user
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    next()
})



app.use("/",userRoutes)
app.use("/campgrounds",campgroundRoutes)
app.use("/campgrounds/:id/reviews",reviewRoutes)
app.use(express.static(path.join(__dirname,"public")))


app.get("/",(req,res)=>{
    res.render("home")
})

app.post("/campgrounds/:id/reviews",validateReview,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    const review=new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id/reviews/:reviewId",catchAsync(async(req,res)=>{
    const {id,reviewId}=req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.all("*",(req,res,next)=>{
    next(new ExpressError("Page Not Found",404))
})
app.use((err,req,res,next)=>{
    const {statusCode=500}=err
    if(!err.message) err.message="Oh No something went wrong"
    res.status(statusCode).render("error",{err})
})
app.listen(3000,()=>{
    console.log("Listening on Port 3000")
})