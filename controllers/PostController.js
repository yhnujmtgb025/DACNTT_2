const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var path = require('path')
const multer = require('multer');
const { collection } = require('../models/UserModel');

// trang home
const post_Newfeed = (req, res) => {
  var user = req.session.user;
  var { caption } = req.body;
  var image = ''
  var type = ''
  if(req.file){
     image ="/img/" + req.file.filename
     type = path.extname(image)
  }
  var createdAt = new Date().getTime();
  User.findOne({ _id: user._id })
    .then(user => {
      if (!user) {
        res.redirect('/login');
      }else{
        Post.collection.insertOne({
            "caption": caption,
						"image": image,
						"video": "",
						"type": type,
						"createdAt": createdAt,
						"likers": [],
						"comments": [],
						"shares": [],
						"user": {
							"_id": user._id,
							"name": user.name,
							"fullname": user.fullname,
							"profileImage": user.profileImage
						}
        },function (error, data) {
          User.collection.updateOne({
            "_id": user._id
          }, {
            $push: {
              "posts": {
                "_id": data.insertedId,
                "caption": caption,
                "image":image,
                "video": "",
                "type": type,
                "createdAt": createdAt,
                "likers": [],
                "comments": [],
                "shares": []
              }
            }
          }, function (error, data) {
                res.json({
                "status": "success",
                "message": "Post has been uploaded.",
                data:data
              });
          });
        })
      }
    })
    .catch(error => {
      res.redirect('/login')
    })

}

const get_Newfeed = (req,res) =>{
    var id = req.session.user;
    var img = req.session.user.profileImage;
 
    User.findOne({
      "_id": id
    }, function (error, user) {
      if (user == null) {
        res.redirect('/login')
      } else {
        var ids = [];
        ids.push(user._id);
        Post.collection.find({
          "user._id": {
            $in: ids
          }
        })
        .sort({
          "createdAt": -1
        })
        .toArray()
        .then(data=>{
          return res.json({
            "status": "success",
            "message": "Record has been fetched",
            "data": data
          });
        })
        .catch(err=>{
            return res.end("Loi")
        })
      }
    });
  
}


module.exports = {
  post_Newfeed,
  get_Newfeed
}