// pages/base/base.js
const db = wx.cloud.database(); //初始化数据库
var load = true;
var endpos = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openID: '',
    isConcern: true,
    concernStyle: ["black", "bold", "underline", "red"],
    hotStyle: ["gray", "bold", "none", "none"],
    hotColor: "gray",
    endpos: 0,
    postArr: [],
    postList: [],
    tempPost: {
      post_id: "",
      user_openid: "",
      usericon: "",
      username: "",
      posttime: "",
      text: "",
      image: [],
      likeNum: 0,
      isLike: false,
    },
    ishidden: false
  },
  //图像预览
  imgYu: function(event) {
    var Index = event.currentTarget.dataset.index;
    // data中获取列表   
    var postArr = this.data.postList;
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      current: event.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: postArr[Index].image // 需要预览的图片http链接列表
    })
  },
  //点击关注页面
  changeConcern: function() {
    this.setData({
      isConcern: true,
      concernStyle: ["black", "bold", "underline", "red"],
      hotStyle: ["gray", "bold", "none", "none"],
      postList: [],
      endpos: 0
    });
    this.onLoad()
  },
  //点击热门页面
  changeHot: function() {
    this.setData({
      isConcern: false,
      concernStyle: ["gray", "bold", "none", "none"],
      hotStyle: ["black", "bold", "underline", "red"],
      postList: [],
      endpos: 0
    });
    this.onLoad()
  },
  //扫描二维码
  scan: function() {
    wx.scanCode({
      success: (res) => {
        wx.showToast({
          title: '扫描成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: (res) => {
        wx.showToast({
          title: '扫描失败',
          icon: 'success',
          duration: 2000
        })
      },
      complete: (res) => {}
    })
  },
  //写Post
  writePost: function() {
    wx.navigateTo({
      url: '../../pages/newpost/index'
    })
  },
  //隐藏post
  hidPost: function(e) {
    var Index = e.currentTarget.dataset.index;
    // data中获取列表   
    var postArr = this.data.postList;
    console.log(Index)
    for (let i in postArr) {
      //遍历列表数据      
      if (i == Index) {
        postArr[i].ishidden = true
      }
    }
    this.setData({
      postList: postArr
    })
  },
  //点赞
  tapLike: function(e) {
    console.log(e)
    var index = e.currentTarget.dataset.index;
    // data中获取列表   
    var postArr = this.data.postList;
    console.log(index)
    //遍历列表数据      
      //根据下标找到目标,改变状态  
      if (postArr[index].isLike == false) { //点赞
        postArr[index].isLike = true
        wx.showToast({
          title: 'like',
          icon: 'none',
          duration: 500
        })
        //更新post-like数
        postArr[index].likeNum = postArr[index].likeNum + 1
        //更新post-like表
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        db.collection('PostLike').add({
          data: {
            post_id: postArr[index].post_id,
            user_id: this.data.openID,
            beliked_user: postArr[index].user_openid,
            time: timestamp
          }
        }).then(res2 => {
          //console.log(res2);
        }).catch(err => {
          console.log(err);
        })
      } else { //取消点赞
        postArr[index].isLike = false
        wx.showToast({
          title: 'dislike',
          icon: 'none',
          duration: 500
        })
        //更新post-like数
        postArr[index].likeNum = postArr[index].likeNum - 1
        //更新post-like表
        db.collection('PostLike').where({
          user_id: this.data.openID,
          post_id: postArr[index].post_id,
        }).get().then(res => {
          //console.log(res.data[0]._id);
          db.collection('PostLike').doc(res.data[0]._id)
            .remove().then(res2 => {
              //console.log(res2);
            }).catch(err => {
              console.log(err);
            })
        }).catch(err => {
          console.log(err);
        })
      }
    

    this.setData({
      postList: postArr
    })
  },

  //评论
  comment: function(e) {
    wx.navigateTo({
      url: '../../pages/comment/index'
    })
  },
  // 页面上拉刷新 5条
  onReachBottom: function() {
    this.ShowPost(false)
  },

  // 页面下拉刷新 获取最新的5条
  onPullDownRefresh: function() {
    //this.ShowPost(true)
  },
  //获取动态
  async ShowPost(isPullDown) {
    postArray = this.data.postArr
    var st, ed
    if (this.data.endpos >= postArray.length) {
      return
    }
    if (isPullDown) {
      st = 0;
      ed = 5;
    } else {
      st = this.data.endpos
      ed = Math.min(this.data.endpos + 5, postArray.length)
      this.setData({
        endpos: ed
      })
    }
    if (st >= postArray.length) {
      return
    }
    console.log(st, ed)
    for (var i = st; i < ed; i++) {
      //console.log(i)
      console.log(i)
      const MyUser = await this.getUser(postArray[i])
      const MyPostLike = await this.getPostLike(postArray[i])
      const IsLikePost = await this.getIsLikePost(postArray[i])
      const MyPostImage = await this.getPostImage(postArray[i])
      tempImage = []
      for (let i in MyPostImage.data) {
        tempImage = tempImage.concat(MyPostImage.data[i].file_id)
      }
      //console.log(IsLikePost)
      if (MyPostLike.data.length == 0) {
        this.setData({
          tempPost: {
            post_id: postArray[i]._id,
            user_openid: postArray[i]._openid,
            usericon: MyUser.data[0].user_info.avatarUrl,
            username: MyUser.data[0].user_info.nickName,
            posttime: postArray[i].post_time,
            text: postArray[i].post_text,
            image: tempImage,
            likeNum: 0,
            isLike: false,
            ishidden: false
          }
        })
        this.setData({
          postList: this.data.postList.concat(this.data.tempPost)
        })
      } else {
        LikeLink = ""
        IsLike = true
        if (IsLikePost.data.length == 0) {
          IsLike = false
        } else {
          IsLike = true
        }
        this.setData({
          tempPost: {
            post_id: postArray[i]._id,
            user_openid: postArray[i]._openid,
            usericon: MyUser.data[0].user_info.avatarUrl,
            username: MyUser.data[0].user_info.nickName,
            posttime: postArray[i].post_time,
            text: postArray[i].post_text,
            image: tempImage,
            likeNum: MyPostLike.data.length,
            isLike: IsLike,
          }
        })
        this.setData({
          postList: this.data.postList.concat(this.data.tempPost)
        })
      }
    }
  },
  //获取关注动态
  async GetConcernPost(st, ed) {
    const MyOpenID = await this.getOpenID()
    const MyFollow = await this.getFollow(MyOpenID.result.openid)
    MyPost = ""
    post_id = []
    postArray = []
    post_id = post_id.concat(MyOpenID.result.openid)
    for (let i in MyFollow.data) {
      post_id = post_id.concat(MyFollow.data[i].recommend_openid)
    }
    console.log("post_id", post_id)
    MyPost = await this.getPost(post_id)
    postArray = postArray.concat(MyPost.data)
    this.setData({
      postArr: postArray
    })
    this.ShowPost(st, ed)
  },

  //获取热门动态
  async GetHotPost(st, ed) {
    const MyOpenID = await this.getOpenID()
    const MyPost = await this.getAllPost()
    this.setData({
      postArr: MyPost.data
    })
    this.ShowPost(st, ed)
  },
  //获取OpenID
  getOpenID() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({ //获取openID
        name: 'login'
      }).then(res => {
        this.setData({
          openID: res.result.openid
        });
        resolve(res);
      })
    })
  },
  //根据OpenID获取动态
  getPost(openid) {
    console.log(openid)
    return new Promise((resolve, reject) => {
      db.collection('Post').where({
        _openid: db.command.in(openid)
      }).orderBy('time', 'desc').get().then(res => {
        resolve(res);
      })
    })
  },
  //获取全部动态
  getAllPost() {
    return new Promise((resolve, reject) => {
      db.collection('Post').orderBy('time', 'desc').get().
      then(res => {
        resolve(res);
      })
    })
  },
  //获取openID对应关注人
  getFollow(myOpenId) {
    console.log("myOpenId", myOpenId)
    return new Promise((resolve, reject) => {
      db.collection('Follow').where({
        current_user_openid: myOpenId
      }).get().then(res => {
        console.log("getFollow", res)
        resolve(res)
      })
    })
  },
  //根据Post获取用户信息
  getUser(myPost) {
    //console.log(myPost)
    return new Promise((resolve, reject) => {
      db.collection('User').where({
        _openid: myPost._openid
      }).get().then(res => {
        resolve(res)
      })
    })
  },
  //根据Post获取用户点赞
  getPostLike(myPost) {
    //console.log("postlike ok")
    return new Promise((resolve, reject) => {
      db.collection('PostLike').where({
        post_id: myPost._id
      }).get().then(res => {
        resolve(res)
      })
    })
  },
  //根据Post获取我是否点赞
  getIsLikePost(myPost) {
    //console.log("islike ok")
    return new Promise((resolve, reject) => {
      db.collection('PostLike').where({
        post_id: myPost._id,
        user_id: this.data.openID
      }).get().then(res => {
        resolve(res)
      })
    })
  },
  //根据Post获取图片信息
  getPostImage(myPost) {
    //console.log("postimage ok")
    return new Promise((resolve, reject) => {
      db.collection('PostImage').where({
        post_id: myPost._id
      }).get().then(res => {
        resolve(res)
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    a = Number(this.data.endpos) + Number(0)
    b = Number(this.data.endpos) + Number(5)
    //console.log(b)
    if (this.data.isConcern) {
      this.GetConcernPost(a, b)
    } else {
      this.GetHotPost(a, b)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },



})