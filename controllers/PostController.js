const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const jwt = require('jsonwebtoken');
const fs = require('fs')
const bcrypt = require('bcrypt');
var path = require('path')
const { collection } = require('../models/UserModel');
const {Socket,io,chat}= require('../utils/socket.js')

const PAGE_SIZE=3

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

// post new feed
const post_Newfeed = function (req, res) {
  var user= req.session.user;
  var uploader = upload.fields([{ name: 'image', maxCount: 10 }, { name: 'video', maxCount: 3 }])
  uploader(req, res, next => {
    var { caption } = req.body
    var img = []
    var video = []
    var type = []
    var createdAt = new Date().getTime();  
    createdAt=createdAt.toString()
    var files = []
    files = files.concat(req.files)
    if (files[0].image != null && files[0].video != null) {
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
      for (var x = 0; x < files[0].image.length; x++) {
        if (files[0].image[x].fieldname == 'image') {
          img.push(files[0].image[x])
          type.push(path.extname(img[x].filename))
        }
      }
    } else if (files[0].image == null && files[0].video != null) {
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
                "editedAt":"",
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
  })

}

// get new feed
const get_Newfeed = function (req, res) {
      var id = req.session.user._id;
      var dataUser=''
      var sumPost =0
      var idCurrent=''
      var uploader = upload.any()
      uploader(req, res, next => {
        var {mode} = req.body
        mode = JSON.parse(mode)
        
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
  
          //  bài post thằng mình đang follow
           if(user.followings.length > 0){
             for(var i =0 ;i < user.followings.length; i++){
                var follow = user.followings[i]
                ids.push(follow.idFollowing);
             }
           }
         
          //  bai post của mình
          var post = ''
           if(user.posts){
             for(var i =0 ;i < user.posts.length;i++){
              post = user.posts[i].myPost
             }
             
           }
           if(post){
            ids.push(post);
           }
           User.collection.find({
           })
           .toArray(function(err,data){
                dataUser=data
           })
           Post.collection.find({
            "user._id": {
                $in: ids
              }
            }).toArray(function (error, data) {
                sumPost=data.length
            });
            
            if(mode == "newload"){
            
                Post.collection.find({
                  "user._id": {
                      $in: ids
                    }
                })
                .sort({
                  "createdAt": -1
                })
                .limit(1)
                .toArray(function (error, data) {
                  res.json({
                    "status": "success",
                    "message": "Record has been fetched",
                    "data": data,
                    "dataUser":dataUser,
                    "idCurrent":user._id,
                    "id":id,
                    "user":user,
                    "sumPost":sumPost
                  });
                });
            }
            else{
            
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
                  "dataUser":dataUser,
                  "idCurrent":user._id,
                  "id":id,
                  "user":user,
                  "sumPost":sumPost
                });
              });
            }
            
         
          }
          
        })


      })
}

// get new feed load more
const get_Newfeed_Loadmore = function (req, res) {
  var id = req.session.user._id;
  var dataUser=''
  var idCurrent=''
  var uploader = upload.any()
  uploader(req, res, next => {
    var {id_post, posted} = req.body
    var post_load = []
    var pos =  JSON.parse(id_post)
    posted = JSON.parse(posted)
    var lastPost = ''
    for(var i =0; i< pos.length;i++){
      post_load.push(pos[i])
    }
    if(post_load.length > 0){
      lastPost=post_load[post_load.length-1]
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

            //  bài post thằng mình đang follow
            if(user.followings.length > 0){
              for(var i =0 ;i < user.followings.length; i++){
                  var follow = user.followings[i]
                  ids.push(follow.idFollowing);
              }
            }

          //  bai post của mình
            var post=''
            if(user.posts){
              for(var i =0 ;i < user.posts.length;i++){
                post = user.posts[i].myPost
              }
            }
            if(post){
              ids.push(post)
            }
          }

            User.collection.find({
      })
      .toArray(function(err,data){
            dataUser=data
      })

      // van con bai post chua dc post
      if(posted > 0){
          Post.collection.find({
            "user._id":{
              $in:ids
            }
          })
          .toArray(function (error, data) {
            var start = []
            start.push(data[posted-1])
            res.json({
              "status": "success",
              "message": "Record has been fetched",
              "data": start,
              "dataUser":dataUser,
              "idCurrent":user._id,
              "id":id,
              "user":user,
              "lastPost":lastPost
          
            });
          });
      }
      else{
        res.json({
          "status": "unload",
          "dataUser":dataUser,
          "idCurrent":user._id,
          "id":id,
          "user":user
        });
      }
    })
    
  })


}

// update post
const post_UpdateNewFeed = function (req, res) {
  var id = req.session.user._id;
  var uploader = upload.fields([{ name: 'image', maxCount: 10 }, { name: 'video', maxCount: 3 }])
  uploader(req, res, next => {
    var { _id,caption1,image,video } = req.body
    var img = []
    var vid = []
    var type = []
    var editedAt = new Date().getTime();  
    // update image original (delete or keep stable), not add new image 
    if(image!=undefined){
      var file = []
      file=file.concat(image)
      for (var x = 0; x < file.length; x++) {
        var tem = JSON.parse(file[x])
        img.push(tem)
        type.push(path.extname(tem.filename))
      }
    }
    if(video!=undefined){
      var file = []
      file=file.concat(video)
      for (var x = 0; x < file.length; x++) {
        var tem = JSON.parse(file[x])
        vid.push(tem)
        type.push(path.extname(tem.filename))
      }
    }
    // add new image
    var files = []
    files = files.concat(req.files)
    if (files[0].image != null && files[0].video != null) {
      for (var x = 0; x < files[0].image.length; x++) {
        if (files[0].image[x].fieldname == 'image') {
          img.push(files[0].image[x])
          type.push(path.extname(img[x].filename))
        }
      }
      for (var x = 0; x < files[0].video.length; x++) {
        if (files[0].video[x].fieldname == 'video') {
          vid.push(files[0].video[x])
          type.push(path.extname(vid[x].filename))
        }
      }
    } 
    else if (files[0].image != null && files[0].video == null) {
      for (var x = 0; x < files[0].image.length; x++) {
        if (files[0].image[x].fieldname == 'image') {
          img.push(files[0].image[x])
          type.push(path.extname(img[x].filename))
        }
      }
    } else if (files[0].image == null && files[0].video != null) {
      for (var x = 0; x < files[0].video.length; x++) {
        if (files[0].video[x].fieldname == 'video') {
          vid.push(files[0].video[x])
          type.push(path.extname(vid[x].filename))
        }
      }
    } else if ((caption1 == "" && image == undefined && video == undefined)) {
      return res.json({
        error: "Vui lòng nhập caption "
      })
    }
    User.collection.findOne(
    { 
      _id: ObjectId(id) 
    },function(err,user){
        if(err){
          return res.json({error:err})
        }
        if(user==null){
          return res.redirect("/login")
        }
        else{
          Post.collection.findOne({
            "_id":ObjectId(_id)
          },function(err,post){
              console.log(post._id)
              Post.collection.updateOne({
                "_id":ObjectId(post._id)
              },{
                  "$set":{
                    "caption": caption1,
                    "image": img,
                    "video": vid,
                    "type": type,
                    "editedAt": editedAt,
                  }
              },function(err,data){
                User.collection.updateOne({
                  $and:[
                      { 
                        "_id":ObjectId(user._id)
                      },{
                        "posts._id":ObjectId(post._id)
                      }
                  ]
                },{
                    "$set":{
                      "posts.$[pos].caption": caption1,
                      "posts.$[pos].image": img,
                      "posts.$[pos].video": vid,
                      "posts.$[pos].type": type,
                      "posts.$[pos].editedAt": editedAt
                    }
                },{ 
                  "arrayFilters": [ 
                    { 
                        "pos._id": ObjectId(post._id)
                    }
                  ]
            })
              })
            res.json({
              "status":"success"
            })
          })
        }
    })
    
  })


}

// get modal post
const get_PostModal = function (req, res) {
  var id = req.session.user._id;
  var id_post_current = req.body._id
  User.collection.findOne({
    "_id":ObjectId(id)
  },function(err,user){
    if(err){
      res.json({"error":err})
    }
    if(user == null){
      res.redirect("/login")
    }else{
      var a = 0; 
      var post_com = [];
      Post.collection.find({
        "_id": ObjectId(id_post_current)
      })
      .toArray(function (error, data) {
        res.json({
          "status": "success",
          "data": data,
          "post_com": post_com,
          "id":id,
          "user":user
        });
      });
    }
    })

}

// get notice 
const get_Notice = function (req, res) {
  var id=req.session.user._id
   
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

// read notice
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

//  like post
const post_ToggleLike = function (req, res) {
  var user= req.session.user;
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
                  "post":post._id,
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

// comment post
const post_Comment = function (req,res){
  var user= req.session.user;
  var uploader = upload.none()
  uploader(req,res,next =>{
    var {_id,commentPost,nameReply,id_comment,id_user_comment,id_user_com,createdAt_comment} = req.body
    var name_comment = ""
    var createdAt = new Date().getTime()
    createdAt = createdAt.toString()
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
          var isNotice = false
          User.collection.find({})
          .toArray(function(err,data){
              for(var i =0;i< data.length;i++){
                if(data[i].notifications){
                  for(var j=0 ;j<data[i].notifications.length;j++){
                    var noti = data[i].notifications[j]
                        if(noti.idCommented== user._id || noti.id_reply_comment == user._id){
                            isNotice =true
                            break;
                        }
                  }
                }else{
                    isNotice =true
                    break;
                }
              }
               if(isNotice){
                    User.collection.updateOne({
                        "_id":post.user._id
                      }, {
                        $push: {
                          "notifications": {
                            "_id": ObjectId(),
                            "type": "post_comment",
                            "content": user.fullname + " has commented your post.",
                            "profileImage": user.profileImage,
                            "post_id":post._id,
                            "isRead":false,
                            "idCommented": user._id,
                            "createdAt": createdAt
                          }
                        }
                      });
                  }
          })

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
                  "id_replied":ObjectId(id_comment),
                  "name_comment":name_comment,
                  "user_comment": user._id,
                  "fullname": user.fullname,
                  "profileImage": user.profileImage,
                  "content_reply":commentPost,
                  "createdAt": createdAt
                }
              }
            }, function (error, data) {
              // create notice user replied
              User.collection.findOneAndUpdate(
                { 
                  "_id":ObjectId(id_user_com)
                }, { 
                    $push: 
                      { 
                        "notifications": {
                          "_id": ObjectId(),
                          "type": "reply_comment",
                          "content": user.fullname + " has commented your comment.",
                          "profileImage": user.profileImage,
                          "post_id": post._id,
                          "isRead":false,
                          "id_reply_comment": user._id,
                          "createdAt": new Date().getTime()
                        }
                      } 
              })
              //  add replies of posts in User
                User.collection.updateOne(
                  { 
                    $and: [{
                        "_id":ObjectId(post.user._id)
                    }, {
                        "posts._id": ObjectId(_id)
                    }] 
                  },
                  { 
                      "$push": 
                      { 
                          "posts.$[pos].comments.$[com].replies": 
                            {
                              "_id": ObjectId(),
                              "name_comment":name_comment,
                              "user_comment": user._id,
                              "fullname": user.fullname,
                              "profileImage": user.profileImage,
                              "content_reply":commentPost,
                              "createdAt": createdAt
                            }
                      } 
                  },
                  { "arrayFilters": [ 
                      { 
                          "pos._id": ObjectId(_id)
                      },
                      { 
                          "com.createdAt": createdAt_comment
                      }
                  ]
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
                  "createdAt": createdAt
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
                          "createdAt": createdAt
                        }
                      } 
              })

              // add id_post had comments of posts into array to query when update
              User.collection.updateOne({
                "_id":ObjectId(user._id)
              },{
                $push:{
                  "post_comment":{
                    "_id":post._id,
                    "id_user_comment":id_user_comment,
                    "createdAt":createdAt
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


  User.collection.find({_id:ObjectId(req.session.user._id)})
  .toArray( function(err,user){
      var lengthPost = 0;
      var like=0
      var post =[]
      var following =[]
      var follower =[]
      for(var i = 0;i<user.length;i++){
          id_current = user[i]._id
          role=user[i].role
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
          role:role,
          image:image,
          id_current: id_current,
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

// send mes
const post_sendMessage = (req,res)=>{
  if(!req.session.user){
      return res.redirect('/login')
  }
  var user_current = req.session.user
  var uploader = upload.fields([{ name: 'image', maxCount: 4}, { name: 'video', maxCount: 1 }])
  uploader(req, res, next => {
    var { _id,id_follow,message } = req.body
    // var like_img={}
    var img = [[],[]]
    var video = [[],[]]
    var createdAt = new Date().getTime();  
    var files = []
    files = files.concat(req.files)
 
    if (files[0].image != null && files[0].video != null) {
      for (var x = 0; x < files[0].image.length; x++) {
        if (files[0].image[x].fieldname == 'image') {
          img[1].push(files[0].image[x])
        }
      }
      for (var x = 0; x < files[0].video.length; x++) {
        if (files[0].video[x].fieldname == 'video') {
          video[1].push(files[0].video[x])
        }
      }

    } else if (files[0].image != null && files[0].video == null) {
      for (var x = 0; x < files[0].image.length; x++) {
        if (files[0].image[x].fieldname == 'image') {
          img[1].push(files[0].image[x])
        }
      }
    } else if (files[0].image == null && files[0].video != null) {
      for (var x = 0; x < files[0].video.length; x++) {
        if (files[0].video[x].fieldname == 'video') {
          video[1].push(files[0].video[x])
        }
      }
    } else if (message == "") {
      return res.json({
        error: "Vui lòng nhập message "
      })
    }
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
                        "to": user._id,
                        "likes":[],
                        "image":img,
                        "video":video,
                        "createdAt":createdAt.toString()
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
                          "to":user._id,
                          "likes":[],
                          "image":img,
                          "video":video,
                          "createdAt":createdAt.toString()
                      }
                  }
                })
                if ( chat[user._id]) {
                  res.io.to(chat[user._id]).emit("messageReceiver",{ 
                        "message":message,
                        "to":user._id,
                        "id":user_current._id,
                        "createdAt":createdAt.toString()
                  })
                }
                if ( chat[user_current._id]) {
                  res.io.to(chat[user_current._id]).emit("messageReceiver",{ 
                    "message":message,
                    "from":user_current._id,
                    "id":id_follow,
                    "createdAt":createdAt.toString()
                })
              }
              
                res.json({
                    "status":"success",
                    "id":id_follow
                })
              })
          }
          else{
            console.log("else")
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
                      "to":user._id,
                      "image":img,
                      "video":video,
                      "createdAt":createdAt.toString()
                  }
              }
            },function(err,data){

              User.collection.updateOne(
                { $and: [{
                  "_id":ObjectId(user._id)
                }, {
                  "notifications._id": ObjectId(user._id)
                }]},
                { 
                    "$set": 
                    { 
                        "notifications.$[com].id_follow_back": user._id,
                        "notifications.$[com].content": user_current.fullname + " sent you a message follow to see it !",
                        "notifications.$[com].type": "received_message"
                    } 
                },
                { "arrayFilters": [ 
                    { 
                        "com._id": ObjectId(user._id)
                    }
                ]
              })
              
            })
            res.io.emit('messageReceived', {
              "message":message,
              "from":user_current._id,
              "image":img[1],
              "video":video[1],
              "createdAt":createdAt.toString()
            });
            res.json({
              "status":"success",
              "id":id_follow
              
          })
          }
      }
    })

  })
  

}

// like message chat
const post_likeChat = (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }
  var userCurrent = req.session.user
  var {format,id_mes,id_follow,id_createdAt,id_created}=req.body
  var createdAt = new Date().getTime();  
  User.collection.findOne({
    "_id":ObjectId(req.session.user._id)
  },function(err,user){
    if(err){
      return res.json({error:err})
    }
    if(user==null){
      return res.redirect("/login")
    }else{
      if(format=="message"){
          var like = false
          for(var i =0;i<user.followings.length;i++){
            if(user.followings[i].idFollowing.toString() == id_follow.toString()){
                for(var j=0;j<user.followings[i].inbox.length;j++){
                  var inbox = user.followings[i].inbox[j]
                  if(inbox._id.toString() == id_mes.toString()){
                    for(var k = 0; k < inbox.likes.length; k++){
                        var liker =  inbox.likes[k]
                        if(liker.from.toString()==userCurrent._id.toString()){
                          like= true
                          break;
                        }
                    }
                  }
                }
            }
          }
          if(like){
            User.collection.updateOne({
              $and:[
                {
                  "_id":ObjectId(user._id)
                },
                {
                  "followings.idFollowing":ObjectId(id_follow)
                }
              ]
            },{
              $pull:{
                "followings.$[follow].inbox.$[inbox].likes": {
                  "createdAt": id_created
                }
              }
            },
            {
              "arrayFilters":[
                {
                  "follow.idFollowing":ObjectId(id_follow)
                },
                {
                  "inbox._id":ObjectId(id_mes)
                }
              ]
            }
            ,function(err,data){
              User.collection.updateOne({
                $and:[
                  {
                    "_id":ObjectId(id_follow)
                  },
                  {
                    "followings.idFollowing":ObjectId(user._id)
                  }
                ]
              },{
                $pull:{
                  "followings.$[follow].inbox.$[inbox].likes": {
                    "createdAt": id_created
                  }
                }
              },
              {
                "arrayFilters":[
                  {
                    "follow.idFollowing":ObjectId(user._id)
                  },
                  {
                    "inbox.createdAt":id_createdAt
                  }
                ]
              })
              if ( chat[id_follow]) {
                res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                      "to":id_follow,
                      "id":user._id
                })
              }
              if ( chat[user._id]) {
                res.io.to(chat[user._id]).emit("messageReceiver",{ 
                  "from":user._id,
                  "id":id_follow
                })
              }
              res.json({
                "status":"success"
              })
            })
          }else{
            User.collection.updateOne({
              $and:[
                {
                  "_id":ObjectId(user._id)
                },
                {
                  "followings.idFollowing":ObjectId(id_follow)
                }
              ]
            },{
              $push:{
                "followings.$[fol].inbox.$[inb].likes": {
                  "from": user._id,
                  "createdAt":createdAt.toString()
                }
              }
            },{ 
              "arrayFilters": [ 
                { 
                  "fol.idFollowing":ObjectId(id_follow)
                },
                {
                  "inb._id": ObjectId(id_mes)
                }
              ]
            }
            ,function(err,data){
              User.collection.updateOne({
                $and:[
                  {
                    "_id":ObjectId(id_follow)
                  },
                  {
                    "followings.idFollowing":ObjectId(user._id)
                  }
                ]
              },{
                $push:{
                    "followings.$[fol].inbox.$[inb].likes":{
                      "from": user._id,
                      "createdAt":createdAt.toString()
                    }
                }
              },{ 
                "arrayFilters": [ 
                  { 
                    "fol.idFollowing":ObjectId(user._id)
                  },
                  {
                    "inb.createdAt": id_createdAt
                  }
                ]
              })
              if ( chat[id_follow]) {
                res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                      "to":id_follow,
                      "id":user._id
                })
              }
              if ( chat[user._id]) {
                res.io.to(chat[user._id]).emit("messageReceiver",{ 
                  "from":user._id,
                  "id":id_follow
                })
              }
              res.json({
                "status":"success"
              })
            })
          }
      }
      else if(format=="image"){
          var like = false
          for(var i =0;i<user.followings.length;i++){
            if(user.followings[i].idFollowing.toString() == id_follow.toString()){
                for(var j=0;j<user.followings[i].inbox.length;j++){
                  var inbox = user.followings[i].inbox[j]
                  if(inbox._id.toString() == id_mes.toString()){
                    for(var k = 0; k < inbox.image[0].length; k++){
                        var liker =  inbox.image[0]
                        if(liker[k].from.toString()==userCurrent._id.toString()){
                          like= true
                          break;
                        }
                    }
                  }
                }
            }
          }
          if(like){
            User.collection.updateOne({
              $and:[
                {
                  "_id":ObjectId(user._id)
                },
                {
                  "followings.idFollowing":ObjectId(id_follow)
                }
              ]
            },{
              $pull:{
                "followings.$[follow].inbox.$[inbox].image.0": {
                  "createdAt": id_created
                }
              }
            },
            {
              "arrayFilters":[
                {
                  "follow.idFollowing":ObjectId(id_follow)
                },
                {
                  "inbox._id":ObjectId(id_mes)
                }
              ]
            }
            ,function(err,data){
              User.collection.updateOne({
                $and:[
                  {
                    "_id":ObjectId(id_follow)
                  },
                  {
                    "followings.idFollowing":ObjectId(user._id)
                  }
                ]
              },{
                $pull:{
                  "followings.$[follow].inbox.$[inbox].image.0": {
                    "createdAt": id_created
                  }
                }
              },
              {
                "arrayFilters":[
                  {
                    "follow.idFollowing":ObjectId(user._id)
                  },
                  {
                    "inbox.createdAt":id_createdAt
                  }
                ]
              })
              if ( chat[id_follow]) {
                res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                      "to":id_follow,
                      "id":user._id
                })
              }
              if ( chat[user._id]) {
                res.io.to(chat[user._id]).emit("messageReceiver",{ 
                  "from":user._id,
                  "id":id_follow
                })
              }
              res.json({
                "status":"success"
              })
            })
          }else{
            User.collection.updateOne({
              $and:[
                {
                  "_id":ObjectId(user._id)
                },
                {
                  "followings.idFollowing":ObjectId(id_follow)
                }
              ]
            },{
              $push:{
                "followings.$[fol].inbox.$[inb].image.0": {
                  "from": user._id,
                  "createdAt":createdAt.toString()
                }
              }
            },{ 
              "arrayFilters": [ 
                { 
                  "fol.idFollowing":ObjectId(id_follow)
                },
                {
                  "inb._id": ObjectId(id_mes)
                }
              ]
            }
            ,function(err,data){
              User.collection.updateOne({
                $and:[
                  {
                    "_id":ObjectId(id_follow)
                  },
                  {
                    "followings.idFollowing":ObjectId(user._id)
                  }
                ]
              },{
                $push:{
                    "followings.$[fol].inbox.$[inb].image.0":{
                      "from": user._id,
                      "createdAt":createdAt.toString()
                    }
                }
              },{ 
                "arrayFilters": [ 
                  { 
                    "fol.idFollowing":ObjectId(user._id)
                  },
                  {
                    "inb.createdAt": id_createdAt
                  }
                ]
              })
              if ( chat[id_follow]) {
                res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                      "to":id_follow,
                      "id":user._id
                })
              }
              if ( chat[user._id]) {
                res.io.to(chat[user._id]).emit("messageReceiver",{ 
                  "from":user._id,
                  "id":id_follow
                })
              }
              res.json({
                "status":"success"
              })
            })
          }
      
      }
      else{
        var like = false
        for(var i =0;i<user.followings.length;i++){
          if(user.followings[i].idFollowing.toString() == id_follow.toString()){
              for(var j=0;j<user.followings[i].inbox.length;j++){
                var inbox = user.followings[i].inbox[j]
                if(inbox._id.toString() == id_mes.toString()){
                  for(var k = 0; k < inbox.video[0].length; k++){
                      var liker =  inbox.video[0]
                      if(liker[k].from.toString()==userCurrent._id.toString()){
                        like= true
                        break;
                      }
                  }
                }
              }
          }
        }
       
        if(like){
         
          User.collection.updateOne({
            $and:[
              {
                "_id":ObjectId(user._id)
              },
              {
                "followings.idFollowing":ObjectId(id_follow)
              }
            ]
          },{
            $pull:{
              "followings.$[follow].inbox.$[inbox].video.0": {
                "createdAt": id_created
              }
            }
          },
          {
            "arrayFilters":[
              {
                "follow.idFollowing":ObjectId(id_follow)
              },
              {
                "inbox._id":ObjectId(id_mes)
              }
            ]
          }
          ,function(err,data){
            User.collection.updateOne({
              $and:[
                {
                  "_id":ObjectId(id_follow)
                },
                {
                  "followings.idFollowing":ObjectId(user._id)
                }
              ]
            },{
              $pull:{
                "followings.$[follow].inbox.$[inbox].video.0": {
                  "createdAt": id_created
                }
              }
            },
            {
              "arrayFilters":[
                {
                  "follow.idFollowing":ObjectId(user._id)
                },
                {
                  "inbox.createdAt":id_createdAt
                }
              ]
            })
            if ( chat[id_follow]) {
              res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                    "to":id_follow,
                    "id":user._id
              })
            }
            if ( chat[user._id]) {
              res.io.to(chat[user._id]).emit("messageReceiver",{ 
                "from":user._id,
                "id":id_follow
              })
            }
            res.json({
              "status":"success"
            })
          })
        }else{
          User.collection.updateOne({
            $and:[
              {
                "_id":ObjectId(user._id)
              },
              {
                "followings.idFollowing":ObjectId(id_follow)
              }
            ]
          },{
            $push:{
              "followings.$[fol].inbox.$[inb].video.0": {
                "from": user._id,
                "createdAt":createdAt.toString()
              }
            }
          },{ 
            "arrayFilters": [ 
              { 
                "fol.idFollowing":ObjectId(id_follow)
              },
              {
                "inb._id": ObjectId(id_mes)
              }
            ]
          }
          ,function(err,data){
            User.collection.updateOne({
              $and:[
                {
                  "_id":ObjectId(id_follow)
                },
                {
                  "followings.idFollowing":ObjectId(user._id)
                }
              ]
            },{
              $push:{
                  "followings.$[fol].inbox.$[inb].video.0":{
                    "from": user._id,
                    "createdAt":createdAt.toString()
                  }
              }
            },{ 
              "arrayFilters": [ 
                { 
                  "fol.idFollowing":ObjectId(user._id)
                },
                {
                  "inb.createdAt": id_createdAt
                }
              ]
            })
            if ( chat[id_follow]) {
              res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                    "to":id_follow,
                    "id":user._id
              })
            }
            if ( chat[user._id]) {
              res.io.to(chat[user._id]).emit("messageReceiver",{ 
                "from":user._id,
                "id":id_follow
              })
            }
            res.json({
              "status":"success"
            })
          })
        }
      }
     
    }
  })
  
    
}

// unsend chat
const post_unsendChat = (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }
  var userCurrent = req.session.user
  var {format,id_mes,id_follow,id_createdAt}=req.body
  User.collection.findOne({
    "_id":ObjectId(userCurrent._id)
  },function(err,user){
    if(err){
      return res.json({error:err})
    }
    if(user==null){
      return res.redirect("/login")
    }else{
      if(format == "message"){
        User.collection.updateOne({
          $and:[
            {
              "_id":ObjectId(user._id)
            },
            {
              "followings.idFollowing":ObjectId(id_follow)
            }
          ]
        },{
            $pull:{
              "followings.$[fol].inbox":{
                "_id":ObjectId(id_mes)
              }
            }
        },{
          "arrayFilters":[
            {
              "fol.idFollowing":ObjectId(id_follow)
            }
          ]
        },function(err,data){
          User.collection.updateOne({
            $and:[
              {
                "_id":ObjectId(id_follow)
              },
              {
                "followings.idFollowing":ObjectId(user._id)
              }
            ]
          },{
              $pull:{
                "followings.$[fol].inbox":{
                  "createdAt":id_createdAt
                }
              }
          },{
            "arrayFilters":[
              {
                "fol.idFollowing":ObjectId(user._id)
              }
            ]
          },function(err,data){
            if ( chat[id_follow]) {
              res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                    "to":id_follow,
                    "id":user._id
              })
            }
            if ( chat[user._id]) {
              res.io.to(chat[user._id]).emit("messageReceiver",{ 
                "from":user._id,
                "id":id_follow
              })
            }
              res.json({
                "status":"success"
              })
          })
        })
      }
      else if(format == "image"){
        User.collection.updateOne({
          $and:[
            {
              "_id":ObjectId(user._id)
            },
            {
              "followings.idFollowing":ObjectId(id_follow)
            }
          ]
        },{
            $pull:{
              "followings.$[fol].inbox":{
                "_id":ObjectId(id_mes)
              }
            }
        },{
          "arrayFilters":[
            {
              "fol.idFollowing":ObjectId(id_follow)
            }
          ]
        },function(err,data){
          User.collection.updateOne({
            $and:[
              {
                "_id":ObjectId(id_follow)
              },
              {
                "followings.idFollowing":ObjectId(user._id)
              }
            ]
          },{
              $pull:{
                "followings.$[fol].inbox":{
                  "createdAt":id_createdAt
                }
              }
          },{
            "arrayFilters":[
              {
                "fol.idFollowing":ObjectId(user._id)
              }
            ]
          },function(err,data){
            if ( chat[id_follow]) {
              res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                    "to":id_follow,
                    "id":user._id
              })
            }
            if ( chat[user._id]) {
              res.io.to(chat[user._id]).emit("messageReceiver",{ 
                "from":user._id,
                "id":id_follow
              })
            }
              res.json({
                "status":"success"
              })
          })
        })
      }
      else{
        User.collection.updateOne({
          $and:[
            {
              "_id":ObjectId(user._id)
            },
            {
              "followings.idFollowing":ObjectId(id_follow)
            }
          ]
        },{
            $pull:{
              "followings.$[fol].inbox":{
                "_id":ObjectId(id_mes)
              }
            }
        },{
          "arrayFilters":[
            {
              "fol.idFollowing":ObjectId(id_follow)
            }
          ]
        },function(err,data){
          User.collection.updateOne({
            $and:[
              {
                "_id":ObjectId(id_follow)
              },
              {
                "followings.idFollowing":ObjectId(user._id)
              }
            ]
          },{
              $pull:{
                "followings.$[fol].inbox":{
                  "createdAt":id_createdAt
                }
              }
          },{
            "arrayFilters":[
              {
                "fol.idFollowing":ObjectId(user._id)
              }
            ]
          },function(err,data){
            if ( chat[id_follow]) {
              res.io.to(chat[id_follow]).emit("messageReceiver",{ 
                    "to":id_follow,
                    "id":user._id
              })
            }
            if ( chat[user._id]) {
              res.io.to(chat[user._id]).emit("messageReceiver",{ 
                "from":user._id,
                "id":id_follow
              })
            }
              res.json({
                "status":"success"
              })
          })
        })
      }
     
    }
  })
}

// delete post
const post_deletePost = (req,res)=>{
    if(!req.session.user){
      return res.redirect('/login')
    }
    var id = req.body._id
    
    Post.collection.deleteOne(
    {
      "_id":ObjectId(id)
    },function(err,data){
      User.collection.updateOne({
        "posts._id":ObjectId(id)
      },{
          $pull: 
          {
            "posts": {
              "_id": ObjectId(id)
            }
          }
      },function(err,data){
        User.collection.find({
        })
        .toArray(function(err,data){
            for(var i= 0; i < data.length;i++){
                if(data[i].notifications){
                    if(data[i].notifications.length>0){
                        for(var j = 0; j < data[i].notifications.length;j++){
                            var noti =  data[i].notifications[j]
                            if(noti.post_id && noti.post_id == id) {
                                    User.collection.updateMany({
                                      $and:[
                                        {
                                            "_id":ObjectId(data[i]._id)
                                        },
                                        {
                                            "notifications.post_id":ObjectId(id)
                                        }
                                      ]

                                    },{
                                        $pull:{
                                            "notifications":{
                                              "post_id":ObjectId(id)
                                            }
                                        }
                                    })
                                  }
                              
                              
                            }
                        }
                }
                if(data[i].savePost){
                    for(var z =0 ;z<data[i].savePost.length;z++){
                      if(data[i].savePost[z]._id == id.toString()){
                            User.collection.updateMany({
                                  $and:[
                                    {
                                        "_id":ObjectId(data[i]._id)
                                    },
                                    {
                                        "savePost._id":id.toString()
                                    }
                                  ]
                              },{
                                  $pull:{
                                      "savePost":{
                                        "_id":id.toString()
                                      }
                                  }
                              })
                        }
                    }
                }
                if(data[i].post_comment){
                    for(var z =0 ;z<data[i].post_comment.length;z++){
                      if(data[i].post_comment[z]._id == id.toString()){
                            User.collection.updateMany({
                                  $and:[
                                    {
                                        "_id":ObjectId(data[i]._id)
                                    },
                                    {
                                        "post_comment._id":ObjectId(id)
                                    }
                                  ]
                              },{
                                  $pull:{
                                      "post_comment":{
                                        "_id":ObjectId(id)
                                      }
                                  }
                              })
                        }
                    }
                }
            }
        })
            
        res.json({
          "status":"success"
        })
      })
    
    
    })
 
}

// saved post
const post_savedPost = (req,res)=>{
    if(!req.session.user){
      return res.redirect('/login')
    }
    var {id_post,id_user}=req.body
    var createdAt = new Date().getTime();  
    User.collection.findOne({
      "_id":ObjectId(req.session.user._id)
    },function(err,user){
        if(err){
          return redirect("/login")
        }
        if(user == null){
          return redirect("/login")
        }else{
          var isSaved = false
          if(user.savePost){
            for(var i =0;i < user.savePost.length;i++){
              var post = user.savePost[i]
              if(post._id==id_post){
                isSaved = true
                break;
              }
            }
          }
         
          if(isSaved){

            User.collection.updateOne({
              $and:[
                {
                  "_id":ObjectId(req.session.user._id)
                },
                {
                  "savePost._id":id_post
                }
              ]
            },{
              $pull:{
                "savePost":{
                  "_id":id_post
                }
              }
            },function(err,data){
              Post.collection.updateOne({
                $and:[
                  {
                    "_id":ObjectId(id_post)
                  },
                  {
                    "saved.id_post":id_post
                  }
                ]
              },{
                $pull:{
                  "saved":{
                    "id_post":id_post
                  }
                }
              })
              res.json({
                "status":"success"
              })
            })
          }
          else{
            User.collection.updateOne({
              "_id":ObjectId(req.session.user._id)
            },{
              $push:{
                "savePost":{
                  "_id":id_post,
                  "id_ofUser_post":id_user,
                  "createdAt":createdAt.toString()
                }
              }
            } ,function(err,data){
              Post.collection.updateOne({
                "_id":ObjectId(id_post)
              },{
                $push:{
                  "saved":{
                    "id_post":id_post,
                    "user_saved":ObjectId(user._id)
                  }
                }
              },function(err,data){
                res.json({
                  "status":"success"
                })
              })
            })
          }
        }
    })

  
}

// pagagination
const post_pagePost = (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }
  var page = req.params.page
  var user = req.session.user
  if(page){
    page=parseInt(page)
    var skip = (page-1) * PAGE_SIZE
      Post.collection.find({"user._id":ObjectId(req.session.user._id)})
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray(function(err,posst){
        res.json({
          data:posst
        })
      
    })
  }
  
}

const get_pagePost = (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }
  Post.collection.find({"user._id":ObjectId(req.session.user._id)})
  .toArray(function(err,data){
      res.json({
        page_size:PAGE_SIZE,
        total:data.length,
        data:data
      })
  })
  
  
}

const get_pagePostSaved = (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }
  var user = req.session.user
  var saved = []
  User.collection.findOne({
    "_id":ObjectId(user._id)
  },function(err,userr){
    Post.collection.find({})
    .toArray(function(err,data){
      if(userr.savePost){
        for(var i=0; i < userr.savePost.length; i++){
          for(var k=0;k< data.length;k++){
              if(data[k]._id.toString()==userr.savePost[i]._id){
                saved.push(data[k]._id)
              }
          }
        }
      }
      Post.collection.find({ 
        "_id":{
          $in:saved
        } 
      })
      .toArray(function(err,data){
          res.json({
            page_size:PAGE_SIZE,
            total:data.length,
            data:data
          })
      })
    })
  })

}

const post_pagePostSaved = (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }
  var page = req.params.page
  var user = req.session.user
  if(page){
    page=parseInt(page)
    var skip = (page-1) * PAGE_SIZE
    var saved = []
   User.collection.findOne({
      "_id":ObjectId(user._id)
   },function(err,userr){
      Post.collection.find({})
      .toArray(function(err,data){
        if(user.savePost){
          for(var i=0; i < userr.savePost.length; i++){
            for(var k=0;k< data.length;k++){
                if(data[k]._id.toString()==userr.savePost[i]._id){
                  saved.push(data[k]._id)
                }
            }
          }
        }
        Post.collection.find({
          "_id":{
            $in:saved
          } 
        })
        .skip(skip)
        .limit(PAGE_SIZE)
        .toArray(function(err,posst){
          res.json({
            data:posst
          })
        
        })
      })
   })
   

       
  
   
  }
}
module.exports = {
  post_Newfeed, 
  get_Newfeed, 
  get_Newfeed_Loadmore,
  post_UpdateNewFeed,
  post_ToggleLike, 
  post_Comment,
  get_Notice, 
  post_Notice,
  get_PostModal,
  get_sendMessage, 
  post_sendMessage,
  get_Message,
  post_likeChat,
  post_unsendChat,
  post_deletePost,
  post_savedPost,
  post_pagePost,
  get_pagePost,
  post_pagePostSaved,
  get_pagePostSaved

};

