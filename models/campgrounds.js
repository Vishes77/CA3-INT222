const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundsSchema = new Schema({
    tittle : String,
    image:String,
    price : Number,
    description : String,
    location :String,
    author :{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

//this is added in case if entire campground get deleted the all reviews of the campground on review chema will also get deleed.
CampgroundsSchema.post('findOneAndDelete', async function (doc) {
    if (doc) { //doc the document which get deleted
        await Review.deleteMany({ // this will delete all reviews of given riview id.
            _id: {
                $in: doc.reviews
            }
        })
    }
})

 
module.exports = mongoose.model('Campground',CampgroundsSchema);

// 617e6ed4915a959597768072 618a9c64b5374e27a799b12e