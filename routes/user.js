const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helper')

/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user;
  productHelpers.getAllProduct().then((products)=>{
    res.render('user/view-products', { products,user });
  })

});

router.get('/login',function(req,res,next){
  res.render('user/login')
});

router.get('/signup',function(req,res,next){
  res.render('user/signup')
});

router.post('/signup',(req,res,next)=>{ 
  userHelper.signupData(req.body).then((data)=>{
    res.redirect('/login')
  })
});
router.post('/login',(req,res,next)=>{
  userHelper.Dologin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true;
      req.session.user=response.user;
      res.redirect('/')
    }else{
      res.redirect('/login')
    }
  })
});
router.get('/logout',(req,res,next)=>{
  req.session.destroy();
  res.redirect('/')
})

module.exports = router;
