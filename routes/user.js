const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
const { changeProductQuatity } = require('../helpers/user-helper');
var userHelper=require('../helpers/user-helper')

const verifyLogin=(req,res,next)=>{
  if(req.session.user.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  var user=req.session.user;
  let count=null
  if(req.session.user){
  count=await userHelper.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProduct().then((products)=>{
    res.render('user/view-products', { products,user,count });
  })

});

router.get('/login',function(req,res,next){
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
  }
});

router.get('/signup',function(req,res,next){
  res.render('user/signup')
});

router.post('/signup',(req,res,next)=>{ 
  userHelper.signupData(req.body).then((data)=>{
    res.redirect('/login')
    req.session.user=data
    req.session.user.loggedIn=true
    res.redirect('/')
  })
});
router.post('/login',(req,res,next)=>{
  userHelper.Dologin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user;
      req.session.user.loggedIn=true;
      res.redirect('/')
    }else{
      req.session.userLoginErr="invalid username or password"
      res.redirect('/login')
    }
  })
});
router.get('/logout',(req,res)=>{
  req.session.user=null;
  res.redirect('/')
})
router.get('/cart/',verifyLogin,async(req,res,next)=>{
  let products=await userHelper.getCartProduct(req.session.user._id)
  let total=0
  if(products.length>0)
  {
   total=await userHelper.getTotalAmount(req.session.user._id)
   res.render('user/cart',{products,user:req.session.user,total})
  }
  else{
    res.redirect('/')
  }

})
router.get('/add-to-cart/:id',(req,res,next)=>{
  // console.log("api call");
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})



router.post('/change-product-quantity',(req,res,next)=>{
  userHelper.changeProductQuatity(req.body).then(async(response)=>{
    response.total=await userHelper.getTotalAmount(req.body.user)

    res.json(response)
  })
})

router.post('/remove-cart-product',(req,res,next)=>{
  console.log(req.body);
  userHelper.removeCartProduct(req.body).then((response)=>{
    res.json({status:true})
  })
})

router.get('/place-order',verifyLogin,async(req,res,next)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id)
  console.log(total)
  res.render('user/place-order',{user:req.session.user,total})
})

router.post('/place-order',async(req,res,next)=>{
  console.log(req.body)
  let product=await userHelper.getCartProductList(req.body.userId)
  let Total=await (userHelper.getTotalAmount(req.body.userId))
  userHelper.placeOrder(req.body,product,Total).then((orderId)=>{
    if(req.body.payment==='COD'){
      res.json({CodSuccess:true})
    }else{
      userHelper.generateRazorpay(orderId,Total).then((response)=>{
        console.log("online")
        console.log(response)
        res.json(response)
      })
    }

  })

  router.get('/order-success',verifyLogin,(req,res,next)=>{
    res.render('user/order-success',{user:req.session.user})
  })

  router.get('/orders',verifyLogin,async(req,res,next)=>{
    let orders=await userHelper.getUserOrders(req.session.user._id)
    res.render('user/orders',{user:req.session.user,orders})
  })
  router.get('/view-order-product/:id',verifyLogin, async(req,res,next)=>{
    let products=await userHelper.getOrderProducts(req.params.id)
    res.render('user/view-order-products',{user:req.session.user,products})
  })
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body,req.body['order[receipt]']);
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment success")
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false,errMsg:''})
  })
})

module.exports = router;
