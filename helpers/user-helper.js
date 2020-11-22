var db = require('../config/connection')
var collection=require('../config/collections')
var bcrypt=require('bcrypt')
const { response } = require('express')
var objectId = require('mongodb').ObjectID

module.exports={

    signupData:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.ops[0])
            })
        })

    },
    Dologin:(userData)=>{
        
        return new Promise(async(resolve,reject)=>{
            let loginstatus=false;
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.user=user;
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })

            }else{
                console.log("login failed");
                resolve({status:false})

            }
        })
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let cartUser=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cartUser){
                let proExist=cartUser.products.findIndex(product=>product.item==proId)
                console.log(proExist);
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
                    {
                        $inc:{ 'products.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $push:{products:proObj}
                    }).then((response)=>{
                        resolve()
                    })
               }
            }else{
                cartObj={
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProduct: (userId) => {
        return new Promise( (resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,productName:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray().then((cartItems)=>{
                console.log(cartItems);
                resolve(cartItems)
            })

        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
            }resolve(count)
        })
    },
    changeProductQuatity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve,reject) => {
            if ((details.count == -1) && (details.quantity == 1)) {
                // console.log(details.cart);
                // console.log(details.product);
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: {products: { item: objectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }).then((response) => {
                        resolve({state:true})
                    })
            }
        })
    },

    removeCartProduct:(details)=>{
        console.log(details.cart);
        console.log(details.product);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: objectId(details.cart) },
            {
                $pull: {products: { item: objectId(details.product) } }
            }).then((response) => {
                resolve({ removeProduct: true })
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let Total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:["$quantity","$product.price"]}}
                    }
                }
            ]).toArray()
            console.log(Total[0].total);
            resolve(Total[0].total)
        })
    },
    placeOrder:(order,product,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,product,total);
            let orderStatus=order.payment==='COD'?'placed':'pending'
            let orderObj={
                delivaryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pin
                },
                userId:objectId(order.userId),
                paymentMethode:order.payment,
                products:product,
                totalAmount:total,
                orderStatus:orderStatus
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).removeOne({user:objectId(order.userId)})
                resolve()
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cartItems.products);
            resolve(cartItems.products)
        })
    }
}