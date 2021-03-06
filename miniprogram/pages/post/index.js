// miniprogram/pages/post/index.js
/*
* 动态的详细页面，包括评论
*/

const db = wx.cloud.database()
const post = db.collection("Post")
const postImage = db.collection("PostImage")
const postLike = db.collection("PostLike")
const user = db.collection("User")
var userOpenId
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    postId = options._postid
    this.getPageData(postId)
  },

  async getPageData(postId) {
    var post 

    // 获取操作用户的openid
    userOpenId = await  this.getUserOpenId()
    // 获取该post的基本信息
    post = await this.getBasicPost(postId)
    // 获取该post的用户信息
    const postUserInfo = await this.getPostUserInfo(post._openid)
    // 获取该post的图片
    const image= await this.getPostImages(postId)
    // 获取点赞数
    const likes = await this.getNumberOfLikes(postId)
    // 获取操作用户是否对该评论点赞
    const isLike = await this.getIsLike(postId)
    post["image"] = image
    post["likes"] = likes
    post["isLike"] = isLike
    post["avatarUrl"] = postUserInfo.user_info.avatarUrl
    post["nickName"] = postUserInfo.user_info.nickName
    this.setData({
      post: post
    })

  },

  //  获取操作用户的openid
  getUserOpenId() { 
    return new Promise((resolve, reject)=> {
      wx.cloud.callFunction({
        name: "login"
      }).then(res => {
        console.log("userOpenId", res.result.openid)
        resolve(res.result.openid)
      })
    })
  },

  // 获取post基本信息
  getBasicPost(postId) {
    return new Promise((resolve, reject) => {
      post.where({
        _id: postId
      }).get().then(res => {
        console.log("basicPost", res.data[0])
        resolve(res.data[0])
      })
    })
  },

  // 获取post的所有图片
  getPostImages(postId) {
    return new Promise((resolve, reject) => [
      postImage.where({
        post_id: postId
      }).get().then(res => {
        resolve(res.data)
      })
    ])
  },

  // 获取点赞数
  getNumberOfLikes(postId) {
    return new Promise((resolve, reject) => {
      postLike.where({
        post_id: postId
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },

  // 获取该用户是否对post点赞
  getIsLike(postId) {
    return new Promise((resolve, reject) => {
      postLike.where({
        post_id: postId,
        _openid: userOpenId
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },
  
  // 获取post的用户信息
  getPostUserInfo(openId) {
    return new Promise((resolve, reject) => {
      user.where({
        _openid: openId
      }).get().then(res => {
        console.log("PostUserInfo",res.data[0])
        resolve(res.data[0])
      })
    })
  },
  // 给用户post点赞
  tapLike: function (e) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var postArray = this.data.post_array
    console.log(e.target.dataset.id)
    const index = e.target.dataset.id
    const postId = e.target.dataset.postid

    if (!postArray[index].isLike) {
      // 如果没有点赞、点赞
      postLike.add({
        data: {
          post_id: postId,
          user_id: index_open_id,
          time: timestamp,
          beliked_user: userOpenId
        }
      }).then(res => {
        console.log("Like post")
        postArray[index]["isLike"] = true
        postArray[index]["likes"] += 1
        this.setData({
          post_array: postArray
        })
      })
    }
    else {
      // 如果点赞了取消点赞，并且删除数据库记录
      postLike.where({
        post_id: postId,
        user_id: index_open_id
      }).get().then(res => {
        // 搜出后删除记录
        postLike.doc(res.data[0]._id).remove().then(res => {
          console.log("Delete post like record")
          // 向前段传送数据
          postArray[index]["isLike"] = false
          postArray[index]["likes"] -= 1
          this.setData({
            post_array: postArray
          })
        })
      })
    }
  },

})