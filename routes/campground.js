const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const campground = require('../models/campgrounds');
const { isLoggedIn ,validateCampground, isAuthor} = require('../middleware');



router.get('/',catchAsync(async(req,res)=>{
    const campgrounds = await campground.find({});
    res.render('campgrounds/index',{ campgrounds })
}))

router.get('/about',catchAsync(async(req,res)=>{
    const campgrounds = await campground.find({});
    res.render('campgrounds/About',{ campgrounds })
}))

router.get('/contactus',catchAsync(async(req,res)=>{
    const campgrounds = await campground.find({});
    res.render('campgrounds/contactus',{ campgrounds })
}))

router.get('/new',isLoggedIn ,(req,res)=>{
    res.render('campgrounds/new');
})

router.post('/',isLoggedIn,validateCampground,catchAsync(async(req,res,next)=>{  // Basic Custom erroe
        // console.log(req.body.campground);
        // if(!req.body.campground) throw new ExpressError('Invalid Campground',404); // throw to CatchAsync 
        const camp = new campground(req.body.campground);
        camp.author = req.user._id;
        await camp.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${camp._id}`);
}))


router.get('/:id' , catchAsync(async(req,res)=>{
    const camp = await campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(camp);
    if(!camp){
        req.flash('error','Cannot Find That Campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{camp});
    
}))

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(async (req,res)=>{
    const camp = await campground.findById(req.params.id);
    if(!camp){
        req.flash('error','Cannot Find That Campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{ camp });
}))

router.put('/:id',isLoggedIn,isAuthor, validateCampground, catchAsync(async(req,res)=>{
    const camp = await campground.findByIdAndUpdate(req.params.id , req.body.campground);
    req.flash('success', 'Successfully Updated');
    //here ... just open the outer bracket and ramaining inside is take and updated in.
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req,res)=>{
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))


module.exports = router;