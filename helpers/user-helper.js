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
        return new Promise(async(resolve,reject)=>{
            let cartUser=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cartUser){
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $push:{products:objectId(proId)}
                    }).then((response)=>{
                        resolve()
                    })
            }else{
                cartObj={
                    user:objectId(userId),
                    products:[objectId(proId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProduct:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        let:{proLists:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:["$_id","$$proLists"]
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
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
    }
}