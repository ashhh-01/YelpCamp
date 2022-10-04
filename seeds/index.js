//Run to seed our Database
const mongoose=require("mongoose")
const cities=require("./cities")
const axios=require("axios")

const Campground=require("../models/campground")
const {places,descriptors}=require("./seedHelpers")


mongoose.connect('mongodb://localhost:27017/yelpcamp')

const db=mongoose.connection
db.on("error",console.error.bind(console,"Connection error:"))
db.once("open",()=>{
    console.log("Database connected")
})
const sample=array=>array[Math.floor(Math.random()*array.length)]


async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: "sh06DT2_lu6DKlsQdXF7Vd1q8nhWJAZsqNyKbRRZQbk",
          collections: 1114848,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }


const seedDB=async()=>{
    await Campground.deleteMany({})
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000)
        const price=Math.floor(Math.random()*20)+10
        const camp=new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image:await seedImg(),
            description:"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Perspiciatis eaque ratione maiores ut explicabo hic error quasi, animi totam quo ipsum magni doloremque esse reiciendis dolore eos debitis a perferendis.",
            price,
            author:"633c5834904f5a065aeeb8ea"
            
        })
        await camp.save()
    }
}
seedDB().then(()=>{
    mongoose.connection.close()
})