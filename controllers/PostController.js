const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const jwt = require('jsonwebtoken');
const fs = require('fs')
const bcrypt = require('bcrypt');
var path = require('path')
const { collection } = require('../models/UserModel');
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/demo')
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1])
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

const post_Newfeed = function (req, res) {
  var user= req.session.user;
  if(user.fullname){
      user = user
  }else{
      user = req.session.user[0]
  }
  var uploader = upload.fields([{ name: 'image', maxCount: 10 }, { name: 'video', maxCount: 3 }])
  uploader(req, res, next => {
    var { caption } = req.body
    var img = []
    var video = []
    var type = []
    var createdAt = new Date().getTime();

    var files = []
    files = files.concat(req.files)
    if (files[0].image != null && files[0].video != null) {
      console.log("1")
      for (var x = 0; x < files[0].image.length; x++) {
        if (files[0].image[x].fieldname == 'image') {
          img.push(files[0].image[x])
          type.push(path.extname(img[x].filename))
        }
      }
      for (var x = 0; x < files[0].video.length; x++) {
        if (files[0].video[x].fieldname == 'video') {
          video.push(files[0].video[x])
          type.push(path.extname(video[x].filename))
        }
      }

    } else if (files[0].image != null && files[0].video == null) {
      console.log("2")
      for (var x = 0; x < files[0].image.length; x++) {
        if (files[0].image[x].fieldname == 'image') {
          img.push(files[0].image[x])
          type.push(path.extname(img[x].filename))
        }
      }
    } else if (files[0].image == null && files[0].video != null) {
      console.log("3")
      for (var x = 0; x < files[0].video.length; x++) {
        if (files[0].video[x].fieldname == 'video') {
          video.push(files[0].video[x])
          type.push(path.extname(video[x].filename))
        }
      }
    } else if (caption == "") {
      return res.json({
        error: "Vui lòng nhập caption "
      })
    }
    var idUser = user._id
    User.collection.findOne({ _id: ObjectId(idUser) })
    .then(user => {
      if (!user) {
        res.redirect('/login');
      } else {
        Post.collection.insertOne({
          "caption": caption,
          "image": img,
          "video": video,
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
        }, function (error, data) {
          User.collection.updateOne({
            "_id": user._id
          }, {
            $push: {
              "posts": {
                "_id": data.insertedId,
                "myPost":ObjectId(user._id),
                "caption": caption,
                "image": img,
                "video": video,
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
              "message": "Post has been uploaded."
            });
          });
        });
      }
  });
})}
// trang home

const get_Newfeed = function (req, res) {
      var id = req.session.user._id;
      if(id){
        id = id
      }else{
        user = [].concat(req.session.user)
        id=user[0]._id
      }
      User.collection.findOne({
        "_id":ObjectId(id)
      },function(err,user){
        if(err){
          res.json({"error":err})
        }
        if(user == null){
          res.redirect("/login")
        }else{
         var ids = [];
         if(user.followings.length > 0){
           for(var i =0 ;i < user.followings.length; i++){
              var follow = user.followings[i]
              ids.push(follow.idFollowing);
           }
         }
       
       
         if(user.posts){
            for(var i =0 ;i < user.posts.length; i++){
              var post = user.posts[i]
              ids.push(post.myPost);
            }
         }
      
          Post.collection.find({
            "user._id": {
                $in: ids
              }
          })
          .sort({
            "createdAt": -1
          })
          .toArray(function (error, data) {
            res.json({
              "status": "success",
              "message": "Record has been fetched",
              "data": data,
              "id":id,
              "user":user
            });
          });
        }
        })

}

const get_PostModal = function (req, res) {
  var id = req.session.user._id;
  var id_post_current = req.body._id
  if(id){
    id = id
  }else{
    user = [].concat(req.session.user)
    id=user[0]._id
  }
  User.collection.findOne({
    "_id":ObjectId(id)
  },function(err,user){
    if(err){
      res.json({"error":err})
    }
    if(user == null){
      res.redirect("/login")
    }else{
      Post.collection.find({
        "_id": ObjectId(id_post_current)
      })
      .toArray(function (error, data) {
        res.json({
          "status": "success",
          "data": data,
          "id":id,
          "user":user
        });
      });
    }
    })

}

const get_Notice = function (req, res) {
  var id =''
  if(req.session.user.fullname){
    id= req.session.user._id;
  }else{
    req.session.user=req.session.user[0]
    id=req.session.user._id
  }
   
  // console.log("\nreq   : ",req.session.user)
    User.collection.find({
      "_id":ObjectId(id)
    })
    .sort({
      "createdAt": -1
    })
    .toArray(function (error, data) {
      res.json({
        "status": "success",
        "message": "Record has been fetched",
        "data": data,
        "id": id
      });
    });

}


const post_Notice = function (req, res) {
  var id = req.session.user._id;
  var idPost = req.body.idPost
  var idNotice = req.body.idNotice
  User.collection.findOne({
    "notifications._id": ObjectId(idNotice)
  }, function (error, user) {
    if (user == null) {
      res.redirect('/login')
    } else {
      var isRead = false
      var idNoti = ''
      for (var i = 0; i < user.notifications.length; i++) {
        var isR = user.notifications[i]
        if (idNotice == isR._id && isR.isRead === false) {
          isRead = true
          idNoti = isR._id
          break;
        }
      }
      User.collection.updateOne(
        { "_id": user._id },
        {
          $pull: {
            "notifications": {
              "_id": idNoti,
            }
          }
        }

      );
    }
    res.json({
      "status": "success",
      "data": "123"
    })
  }
  )


}

const post_ToggleLike = function (req, res) {
  var user= req.session.user;
  if(user.fullname){
      user = user
  }else{
      user = req.session.user[0]
  }
  var _id = req.body._id

  User.collection.findOne({
    "_id": ObjectId(user._id)
  }, function (error, user) {
    if (error) {
      return res.json({
        "status": "error",
        "message": "Post does not exist."
      });
    }
    if (user == null) {
      return res.json({ "error": "error" })
    } else {
      Post.collection.findOne({
        "_id": ObjectId(_id)
      }, function (error, post) {
        if (post == null) {
          res.json({
            "status": "error",
            "message": "Post does not exist."
          });
        } else {
          var isLiked = false;
          for (var a = 0; a < post.likers.length; a++) {
            var liker = post.likers[a];
            if (liker._id.toString() == user._id.toString()) {
              isLiked = true;
              break;
            }
          }

          if (isLiked) {
            Post.collection.updateOne({
              "_id": ObjectId(_id)
            }, {
              $pull: {
                "likers": {
                  "_id": user._id,
                }
              }
            }, function (error, data) {
              User.collection.updateOne({
                $and: [{
                  "_id": post.user._id
                }, {
                  "posts._id": post._id
                }]
              }, {
                $pull: {
                  "posts.$[].likers": {
                    "_id": user._id,
                  },
                  "notifications": {
                    "idLiked": user._id,
                  }
                }
              });
            
              res.json({
                "status": "unliked",
                "message": "Post has been unliked."
              });
        
            })
          }else{
            User.collection.updateOne({
              "_id": post.user._id
            }, {
              $push: {
                "notifications": {
                  "_id": ObjectId(),
                  "type": "photo_liked",
                  "content": user.fullname + " has liked your post.",
                  "profileImage": user.profileImage,
                  "isRead": false,
                  "post": {
                    "_id": post._id
                  },
                  "idLiked": user._id,
                  "createdAt": new Date().getTime()
                }
              }
            });
            
            Post.collection.updateOne({
              "_id": ObjectId(_id)
            }, {
              $push: {
                "likers": {
                  "_id": user._id,
                  "fullname": user.fullname,
                  "profileImage": user.profileImage
                }
              }
            }, function (error, data) {
              User.collection.findOneAndUpdate(
                { 
                  "posts._id": post._id
                }, { 
                    $push: 
                      { 
                        "posts.$.likers": {
                          "_id": user._id,
                          "fullname": user.fullname,
                          "profileImage": user.profileImage
                        }
                      } 
                },function (error, success) {
                     if (error) {
                         console.log(error);
                     } else {
                      res.json({
                        "status": "success",
                        "message": "Post has been liked."
                      });
                     }
                })
            })
          
          }
      
      
        }
      })
  
  }
  })
}

const post_Comment = function (req,res){
  var user= req.session.user;
  if(user.fullname){
      user = user
  }else{
      user = req.session.user[0]
  }
  var uploader = upload.none()
  uploader(req,res,next =>{
    var {_id,commentPost,nameReply,id_comment,id_user_comment} = req.body
    var name_comment = ""
    if(commentPost.includes(nameReply)){
      var length_name = nameReply.length
      name_comment = commentPost.substr(0,length_name)
      commentPost = commentPost.substr(length_name,commentPost.length)
    }
    User.collection.findOne({
      "_id":ObjectId(user._id)
    },function(err,user){
      if(err){
        res.json({
          "status":err
        })
      }
      else{
        Post.collection.findOne({
          "_id":ObjectId(_id)
        },function(err,post){
          User.collection.updateOne({
            "_id":post.user._id
          }, {
            $push: {
              "notifications": {
                "_id": ObjectId(),
                "type": "post_comment",
                "content": user.fullname + " has commented your post.",
                "profileImage": user.profileImage,
                "post": {
                  "_id": post._id
                },
                "isRead":false,
                "idCommented": user._id,
                "idLiked": user._id,
                "createdAt": new Date().getTime()
              }
            }
          });
          // reply 1 comment user
          if(id_comment){
            Post.collection.updateOne({
              $and: [{
                "_id":ObjectId(_id)
              }, {
                "comments._id": ObjectId(id_comment)
              }]
            }, {
              $push: {
                "comments.$.replies": {
                  "_id": ObjectId(),
                  "name_comment":name_comment,
                  "user_comment": user._id,
                  "fullname": user.fullname,
                  "profileImage": user.profileImage,
                  "content_reply":commentPost,
                  "createdAt": new Date().getTime()
                }
              }
            }, function (error, data) {
              User.collection.findOneAndUpdate(
                { 
                  "_id":ObjectId(id_user_comment)
                }, { 
                    $push: 
                      { 
                        "notifications": {
                          "_id": ObjectId(),
                          "type": "reply_comment",
                          "content": user.fullname + " has commented your comment.",
                          "profileImage": user.profileImage,
                          "post": {
                            "_id": post._id
                          },
                          "isRead":false,
                          "id_reply_comment": user._id,
                          "createdAt": new Date().getTime()
                        }
                      } 
                })

            })
          }
          // comment independent for a post
          else{
            Post.collection.updateOne({
              "_id": ObjectId(_id)
            }, {
              $push: {
                "comments": {
                  "_id": ObjectId(),
                  "id_post":ObjectId(_id),
                  "idComment": user._id,
                  "fullname": user.fullname,
                  "profileImage": user.profileImage,
                  "content_comment":commentPost,
                  "replies":[],
                  "createdAt": new Date().getTime()
                }
              }
            }, function (error, data) {
              User.collection.findOneAndUpdate(
                { 
                  "posts._id":post._id
                }, { 
                    $push: 
                      { 
                        "posts.$.comments": {         
                          "_id": ObjectId(),
                          "id_post":ObjectId(post._id),
                          "idComment": user._id,
                          "fullname": user.fullname,
                          "profileImage": user.profileImage,
                          "content_comment":commentPost,
                          "replies":[],
                          "createdAt": new Date().getTime()
                        }
                      } 
                })
            })
          }
          res.json({
            "status": "success",
            "message": "Record has been fetched",
            "id_post":_id,
          });
        })
      }
    })
  })
 
}

// handle send message with friends
const get_sendMessage = (req,res)=>{
  if(!req.session.user){
      return res.redirect('/login')
  }
  if(req.session.user._id == undefined){
      req.session.user._id = req.session.user[0]._id
  }

  User.collection.find({_id:ObjectId(req.session.user._id)})
  .toArray( function(err,user){
      var lengthPost = 0;
      var like=0
      var post =[]
      var following =[]
      var follower =[]
      for(var i = 0;i<user.length;i++){
          image=user[i].profileImage
          fullname=user[i].fullname
          bio = user[i].bio
          name=user[i].name
          following =  user[i].followings
          follower =  user[i].followers
      }   
        
      if(like == ""){
          like = 0
      }
      
      res.render('homePage/sendMessage',{
          image:image,
          fullname:fullname,
          bio:bio,
          name:name,
          post:post,
          like:like,
          following:following,
          follower:follower,
          userCurrent:"",
          plane:"d"
      })
  })
}

// get message
const get_Message = (req,res)=>{
  if(!req.session.user){
      return res.redirect('/login')
  }
  if(req.session.user._id == undefined){
      req.session.user._id = req.session.user[0]._id
      req.session.user=req.session.user[0]
  }
  var id = req.body._id  // id following
  User.collection.find({
    $and: [{
      "_id":ObjectId(req.session.user._id)
    }, {
      "followings.idFollowing": ObjectId(id)
    }]
  })
  .toArray( function(err,user){
      res.json({
          "status":"success",
          "user":user,
          "id":req.session.user._id
      })
  })
}

const post_sendMessage = (req,res)=>{
  if(!req.session.user){
      return res.redirect('/login')
  }
  var user_current = req.session.user
  if(user_current.fullname){
      use_current=user_current 
  }else{
      user_current = user_current[0]
  }
  var uploader = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }])
  uploader(req, res, next => {
    var { _id,id_follow,message } = req.body
    User.collection.findOne({
      "_id":ObjectId(id_follow)
    },function(err,user){
      if(err){
        return res.json({
          "error":err
        })
      }
      if(user==null){
        return res.redirect('/login')
      }
      else{
          isFollowing = false
          for(var i =0 ;i < user.followings.length;i++){
              var follow = user.followings[i]
              if(follow.idFollowing.toString() == user_current._id.toString()){
                    isFollowing = true;
                    break;
              }
          }
          if(isFollowing){
              User.collection.updateOne({
                $and: [{
                  "_id":ObjectId(user._id)
                }, {
                  "followings.idFollowing": ObjectId(user_current._id)
                }]
              },{
                $push : 
                {
                    "followings.$.inbox":
                    {
                        "_id":ObjectId(),
                        "message":message,
                        "from": user_current._id,
                        "to": user._id
                    }
                }
              },function(err,data){
                User.collection.updateOne({
                  $and: [{
                    "_id":ObjectId(user_current._id)
                  }, {
                    "followings.idFollowing": ObjectId(user._id)
                  }]
                },{
                  $push : 
                  {
                      "followings.$.inbox":
                      {
                          "_id":ObjectId(),
                          "message":message,
                          "from": user_current._id,
                          "to":user._id
                      }
                  }
                })
                res.json({
                    "status":"success",
                    "id":id_follow
                })
              })
          }
          else{
            User.collection.updateOne({
              $and: [{
                "_id":ObjectId(user_current._id)
              }, {
                "followings.idFollowing": ObjectId(user._id)
              }]
          
            },{
              $push : 
              {
                  "followings.$.inbox":
                  {
                      "_id":ObjectId(),
                      "message":message,
                      "from": user_current._id,
                      "to":user._id
                  }
              }
            },function(err,data){
              User.collection.updateOne(
                {"_id": ObjectId(user._id) },
                { 
                    "$set": 
                    { 
                        "notifications.$[com].id_follow_back": user._id
                    } 
                },
                { "arrayFilters": [ 
                    { 
                        "com._id": ObjectId(user._id)
                    }
                ]
            })
              res.json({
                  "status":"success",
                  "id":id_follow
              })
            })
            User.collection.updateOne({
              "_id":ObjectId(user._id)
            },{
              $set : 
              {
                "notifications.": {
                  "_id": ObjectId(user._id),
                  "type": "received_message",
                  "idFollowed":user_current._id,
                  "content": user_current.fullname + " sent you a message, follow back to read the message",
                  "profileImage": user_current.profileImage,
                  "createdAt": new Date().getTime()
                }
              }
            })
          }
      }
    })

  })
  

}

module.exports = {
  post_Newfeed, 
  get_Newfeed, 
  post_ToggleLike, 
  post_Comment,
  get_Notice, 
  post_Notice,
  get_PostModal,
  get_sendMessage, 
  post_sendMessage,
  get_Message
};

