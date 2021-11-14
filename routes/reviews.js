const express = require('express');
const router = express.Router({mergeParams:true}); // for using same params has in params of index page.
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const campground = require('../models/campgrounds');
const {validateReview , isLoggedIn ,isReviewAuthor} = require('../middleware');

router.post('/',isLoggedIn, validateReview , catchAsync(async(req,res)=>{
    const camp = await campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Successfully,Added your Review!');
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // This is for pulling/deleting the review inside campground schema.
    await Review.findByIdAndDelete(reviewId); // this is complete removal from reviews schema as one to many realtion is here and one campground has many reviews possible.
    req.flash('success', 'Successfully Deleted Review');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;