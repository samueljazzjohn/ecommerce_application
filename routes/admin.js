var express = require('express');
const { helpers } = require('handlebars');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');

let admin={name:"admin",email:"admin@gmail.com",password:"jazz1999"}

const verifyLogin=(req,res,next)=>{
  console.log(req.session.admin.loggedIn)
  if(req.session.admin.loggedIn){
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  var admin=req.session.admin
  console.log(admin)
  productHelpers.getAllProduct().then((products) => {
    res.render('admin/view_products', { admin,products});
  })
});

router.get('/admin-login',function(req,res,next){
  if(req.session.admin){
    res.render('admin/admin_login')
  }else{
    res.render('admin/admin_login',{"loginErr":req.session.adminLoginErr})
    req.session.userLoginErr=false
  }
});

router.post('/admin-login',(req,res,next)=>{
  console.log(admin)
  console.log(req.body.password)
    if(req.body.email === admin.email && req.body.password === admin.password){
      console.log("iflogin")
      req.session.admin=admin;
      req.session.admin.loggedIn=true;
      res.redirect('/admin/')
    }else{
      req.session.adminLoginErr="invalid username or password"
      res.redirect('/admin/admin-login')
    }
});

router.get('/logout',(req,res)=>{
  req.session.admin=null;
  res.redirect('/admin/admin-login')
})

router.get('/add-product',verifyLogin, function (req, res, next) {
  res.render('admin/add_product',{admin})
})
router.post('/add-product', (req, res) => {
  req.body.price=parseInt(req.body.price)
  productHelpers.addproduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err)
        res.render('admin/add_product',{admin});
      else
        console.log(err)
    })
  })
});

router.get('/delete-product/:id',verifyLogin, (req, res, next) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then(() => {
    res.redirect('/admin/')
  })
});

router.get('/edit-product/:id',verifyLogin, (req, res, next) => {
  productHelpers.getProductDetails(req.params.id).then((product)=>{
    res.render('admin/edit_product',{product,admin})
  })

});

router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id;
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image=req.files.image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
module.exports = router;
