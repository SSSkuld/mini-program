// pages/message/message.js
const db = wx.cloud.database();  //初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMyLike:true,
    MyLike: ["black", "bold", "underline", "red"],
    LikeMe: ["gray", "bold", "none", "none"],
    messageList: [],
    endpos: 0,
    tempMessage: {
      post_id: "",
      user_openid: "",
      usericon: "",
      username: "",
      posttime: "",
      text: "",
      image: ""
    }

  },
  //点击我喜欢的
  myLike: function () {
    this.setData({
      isMyLike: true,
      MyLike: ["black", "bold", "underline", "red"],
      LikeMe: ["gray", "bold", "none", "none"],
      messageList: [],
      endpos: 0
    });
    a = Number(this.data.endpos) + Number(0)
    b = Number(this.data.endpos) + Number(6)
    this.GetMyLike(a,b)
  },
  //点击喜欢我的
  likeMe: function () {
    this.setData({
      isMyLike: false,
      MyLike: ["gray", "bold", "none", "none"],
      LikeMe: ["black", "bold", "underline", "red"],
      messageList: [],
      endpos: 0
    });
    a = Number(this.data.endpos) + Number(0)
    b = Number(this.data.endpos) + Number(6)
    this.GetLikeMe(a, b)
  }, 
  loadMore: function () {
    a = Number(this.data.endpos) + Number(1)
    b = Number(this.data.endpos) + Number(7)
    //console.log(b)
    if(this.data.isMyLike)
    {
      this.GetMyLike(a, b)
    }
    else
    {
      this.GetLikeMe(a, b)
    }
  },
  async GetMyLike(st,ed) {
    const MyOpenID = await this.getOpenID()
    const MyPostLike = await this.getMyLikePost(MyOpenID.result.openid)
    //console.log(MyOpenID.result.openid)
    //console.log(MyPostLike)
    for (let i in MyPostLike.data) {
      if (i < st) {
        continue
      }
      if (i == ed) {
        break
      }
      this.setData({
        endpos: i
      })
      const MyPost = await this.getPost(MyPostLike.data[i].post_id)
      const MyUser = await this.getUser(MyOpenID.result.openid)
      const MyPostImage = await this.getPostImage(MyPost.data[0]._id)
      tempImage=""
      if (MyPostImage.data.length!=0)
      {
        tempImage = MyPostImage.data[0].file_id
      } 
      var timestamp = MyPostLike.data[i].time
      var n = timestamp * 1000;
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
      this.setData({
        tempMessage: {
          post_id: MyPost.data[0]._id,
          user_openid: MyPost.data[0]._openid,
          usericon: MyUser.data[0].user_info.avatarUrl,
          username: MyUser.data[0].user_info.nickName,
          posttime: Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s,
          text: MyPost.data[0].post_text,
          image: tempImage
        }
      })
      this.setData({
        messageList: this.data.messageList.concat(this.data.tempMessage)
      })
    }
  },
  async GetLikeMe(st, ed) {
    const MyOpenID = await this.getOpenID()
    const PostLikeMe = await this.getPostLikeMe(MyOpenID.result.openid)
    //console.log(MyOpenID.result.openid)
    //console.log(MyPostLike)
    for (let i in PostLikeMe.data) {
      if (i < st) {
        continue
      }
      if (PostLikeMe.data[i].user_id == PostLikeMe.data[i].beliked_user)
      {
        continue
      }
      if (i == ed) {
        break
      }
      this.setData({
        endpos: i
      })
      const MyPost = await this.getPost(PostLikeMe.data[i].post_id)
      const MyUser = await this.getUser(PostLikeMe.data[i].user_id)
      const MyPostImage = await this.getPostImage(MyPost.data[0]._id)
      tempImage = ""
      if (MyPostImage.data.length != 0) {
        tempImage = MyPostImage.data[0].file_id
      }
      var timestamp = PostLikeMe.data[i].time
      var n = timestamp * 1000;
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
      this.setData({
        tempMessage: {
          post_id: MyPost.data[0]._id,
          user_openid: MyPost.data[0]._openid,
          usericon: MyUser.data[0].user_info.avatarUrl,
          username: MyUser.data[0].user_info.nickName,
          posttime: Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s,
          text: MyPost.data[0].post_text,
          image: tempImage
        }
      })
      this.setData({
        messageList: this.data.messageList.concat(this.data.tempMessage)
      })
    }
  },

  getOpenID() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({  //获取openID
        name: 'login'
      }).then(res => {
        this.setData({
          openID: res.result.openid
        });
        resolve(res);
      })
    })
  },
  getMyLikePost(myOpenID) {
    return new Promise((resolve, reject) => {
      db.collection('PostLike').orderBy('time', 'desc').where({
        user_id: myOpenID
      }).get().then(res => {
        resolve(res);
      })
    })
  },
  getPostLikeMe(myOpenID) {
    return new Promise((resolve, reject) => {
      db.collection('PostLike').orderBy('time', 'desc').where({
        beliked_user: myOpenID
      }).get().then(res => {
        resolve(res);
      })
    })
  },
  getPost(post_id) {
    return new Promise((resolve, reject) => {
      db.collection('Post').where({
        _id:post_id
      }).get().then(res => {
        //console.log(res);
        resolve(res);
      })
    })
  },
  getUser(open_id) {
    return new Promise((resolve, reject) => {
      db.collection('User').where({
        _openid: open_id
      }).get().then(res => {
        //console.log(res);
        resolve(res);
      })
    })
  },
  getPostImage(post_id) {
    return new Promise((resolve, reject) => {
      db.collection('PostImage').where({
        post_id: post_id
      }).get().then(res => {
        //console.log(res);
        resolve(res);
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    a = Number(this.data.endpos) + Number(0)
    b = Number(this.data.endpos) + Number(6)
    this.GetMyLike(a,b);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})