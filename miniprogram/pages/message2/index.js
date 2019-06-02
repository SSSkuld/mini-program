// miniprogram/pages/message2/index.js
const db = wx.cloud.database()
const user = db.collection("User")
const postLike = db.collection("PostLike")
const post = db.collection("post")
const postImage = db.collection("PostImage")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden_like: false,
    hidden_belike: true,
    like_color: "#6094e2",
    belike_color: "grey"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getPageData()
  },

  async getPageData() {
    var userLike
    var userBeLike
    const openId = await this.getUserOpenid()
    const userInfo = await this.getUserInfo(openId)
    this.setData({
      userNickname: userInfo.nickName,
      userAvatar: userInfo.avatarUrl
    })
    const numberOfUserLike = await this.getNumberOfUserLike(openId)
    const numberOfUserBeLike = await this.getNumberOfUserBeLike(openId)
    if (numberOfUserLike) {
      userLike = await this.getUserLike(openId)
    }
    if (numberOfUserBeLike) {
      userBeLike = await this.getUserBeLike(openId)
    }
    // 获取userLike 其余信息 
    for (var i = 0; i < numberOfUserLike; i++) {
      const likeImage = await this.getLikeImage(userLike[i].post_id)
      userLike[i]["image"] = likeImage
      var n = userLike[i].time * 1000;
      var date = new Date(n);
      //年  
      var Y = date.getFullYear();
      //月  
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      //日  
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      //时  
      var h = date.getHours();
      //分  
      var m = date.getMinutes();
      //秒  
      var s = date.getSeconds();
      userLike[i]["postTime"] = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s,
      this.setData({
        user_like: userLike
      })
    }
    // 获取userBeLike 其余信息， image 用户信息等
    for (var i = 0; i < numberOfUserBeLike; i++) {
      const likeImage = await this.getLikeImage(userBeLike[i].post_id)
      const userInfo = await this.getUserInfo(userBeLike[i]._openid)
      var n = userBeLike[i].time * 1000;
      var date = new Date(n);
      //年  
      var Y = date.getFullYear();
      //月  
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      //日  
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      //时  
      var h = date.getHours();
      //分  
      var m = date.getMinutes();
      //秒  
      var s = date.getSeconds();
      userBeLike[i]["image"] = likeImage
      userBeLike[i]["userAvatar"] = userInfo.avatarUrl
      userBeLike[i]["userNickname"] = userInfo.nickName
      userBeLike[i]["postTime"] = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s,
      this.setData({
        user_belike: userBeLike
      })
    }
  },

  // 获取操作用户的openid
  getUserOpenid() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "login"
      }).then(res => {
        resolve(res.result.openid)
        console.log("userOpenId", res.result.openid)
      })
    })
  },

  // 获取操作用户的信息
  getUserInfo(_openId) {
    return new Promise((resolve, reject) => {
      user.where({
        _openid: _openId
      }).get().then(res => {
        resolve(res.data[0].user_info)
      })
    })
  },

  // 获取操作用户被点赞的数量
  getNumberOfUserBeLike(_openId) {
    return new Promise((resolve, reject) => {
      postLike.where({
        beliked_user: _openId
      }).count().then(res => {
        console.log("NumberOfUserBeLike", res.total)
        resolve(res.total)
      })
    })
  },

  // 获取操作用户点其他用户的赞的数量
  getNumberOfUserLike(_openId) {
    return new Promise((resolve, reject) => {
      postLike.where({
        _openid: _openId
      }).count().then(res => {
        console.log("NumberOfUserLike", res.total)
        resolve(res.total)
      })
    })
  },

  // 获取操作用户点赞其他用户的关系
  getUserLike(_openId) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "getUserLike",
        data: {
          openId: _openId
        }
      }).then(res => {
        console.log("getUserLike", res.result.data)
        resolve(res.result.data)
      })
    })
  },

  // 获取操作用户被其他用户点赞的关系
  getUserBeLike(_openId) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "getUserBeLike",
        data: {
          openId: _openId
        }
      }).then(res => {
        console.log("getUserBeLike", res.result.data)
        resolve(res.result.data)
      })
    })
  },

  // 获取被用户点赞的图片
  getLikeImage(_postId) {
    return new Promise((resolve, reject) => {
      postImage.where({
        post_id: _postId
      }).get().then(res => {
        resolve(res.data[0].file_id)
      })
    })
  },

  // 改变显示，从操作用户点赞和操作用户被点赞切换
  changeLike:function(e) {
    this.setData({
      hidden_like: false,
      hidden_belike: true,
      like_color: "#6094e2",
      belike_color: "grey"
    })
  },
  
  changeBelike:function(e) {
    this.setData({
      hidden_like: true,
      hidden_belike: false,
      like_color: "grey",
      belike_color: "#6094e2"
    })
  }
})