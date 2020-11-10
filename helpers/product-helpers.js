var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
var objectId = require('mongodb').ObjectID

module.exports = {

    addproduct: (product, callback) => {

        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.ops[0]._id)
        }
        )
    },

    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: objectId(proId) }).then((response) => {
                resolve()
            })
        })

    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    updateProduct:(proId,details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    phName:details.phName,
                    category:details.category,
                    price:details.price,
                    description:details.description
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}