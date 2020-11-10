var express = require('express');
const { helpers } = require('handlebars');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');


/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelpers.getAllProduct().then((products) => {
    res.render('admin/view_products', { admin: true, products });
  })

});
router.get('/add-product', function (req, res, next) {
  res.render('admin/add_product')
})
router.post('/add-product', (req, res) => {

  productHelpers.addproduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err)
        res.render('admin/add_product');
      else
        console.log(err)
    })
  })
});

router.get('/delete-product/:id', (req, res, next) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then(() => {
    res.redirect('/admin/')
  })
});

router.get('/edit-product/:id', (req, res, next) => {
  productHelpers.getProductDetails(req.params.id).then((product)=>{
    res.render('admin/edit_product',{product})
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
