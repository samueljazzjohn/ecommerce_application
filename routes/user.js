const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helper')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var user=req.session.user;
  productHelpers.getAllProduct().then((products)=>{
    res.render('user/view-products', { products,user });
  })

});

router.get('/login',function(req,res,next){
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  }
});

router.get('/signup',function(req,res,next){
  res.render('user/signup')
});

router.post('/signup',(req,res,next)=>{ 
  userHelper.signupData(req.body).then((data)=>{
    res.redirect('/login')
    req.session.loggedIn=true
    req.session.user=data
    res.redirect('/')
  })
});
router.post('/login',(req,res,next)=>{
  userHelper.Dologin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true;
      req.session.user=response.user;
      res.redirect('/')
    }else{
      req.session.loginErr="invalid username or password"
      res.redirect('/login')
    }
  })
});
router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/')
})
router.get('/cart/',verifyLogin,async(req,res,next)=>{
  // var user=req.session.user;
  let products=await userHelper.getCartProduct(req.session.user._id)
    console.log(products);
    res.render('user/cart')

})
router.get('/add-to-cart/:id',verifyLogin,(req,res,next)=>{
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/login')
  })
})

module.exports = router;
