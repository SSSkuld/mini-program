// miniprogram/pages/search/search.js
const db = wx.cloud.database();  //初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openID: '',
    inputValue: "",
    searchAreaHeight: 90,
    isTag: true,
    searchButtonPushed: false,
    searchTagStyle: ["balck", "", "none"],
    searchUserStyle: ["balck", "", "none"],
    postList: [],
    endpos:0,
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
      likeLink: "cloud://train25years-b437f2.7472-train25years-b437f2/点赞.png"
    },
    //用户部分
    infoList: [],
    endinfo:0,
    tmpInfo: {
      usericon: "",
      username: "",
      isFollow: false,
      url: "",
      //主页面推荐给当前用户关注的人的openid
      recommend_openid: ""
    }
    //用户部分
  },

  //动态读取搜索框值
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value,
    })
  },
  // 清除搜索框值
  clearInput: function (e) {
    this.setData({
      inputValue: "",
      inputShowed: false,
      searchAreaHeight: 90,
      searchButtonPushed: false,
    });
  },
  //点击tag
  changeSearchTag: function () {
    this.setData({
      isTag: true,
      searchTagStyle: ["red", "bold", "red"],
      searchUserStyle: ["balck", "", "none"],
    });
  },
  //点击用户
  changeSearchUser: function () {
    this.setData({
      isTag: false,
      searchUserStyle: ["red", "bold", "red"],
      searchTagStyle: ["balck", "", "none"],
    });
  },
  //开始搜索
  clickSearchButton: function () {
    this.setData({
      searchButtonPushed: true,
      searchAreaHeight: 170,
      isTag: true,
      searchTagStyle: ["red", "bold", "red"],
      searchUserStyle: ["balck", "", "none"],
    });
    this.OnLoad();
  },
  //图像预览
  imgYu: function (event) {
    var Index = event.currentTarget.dataset.index;
    // data中获取列表   
    var postArr = this.data.postList;
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      current: event.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: postArr[Index].image // 需要预览的图片http链接列表
    })
  },//点赞
  
  
  async GetPost(st, ed) {
    const MyOpenID = await this.getOpenID()
    const MyPost = await this.getPost()
    console.log("post")
    console.log(MyOpenID)
    console.log(MyPost)
    for (let i in MyPost.data) {
      if (i < st) {
        continue
      }
      if (i == ed) {
        break
      }
      //console.log(i)
      this.setData({
        endpos: i
      })
      const MyUser = await this.getUser(MyPost.data[i])
      const MyPostLike = await this.getPostLike(MyPost.data[i])
      const IsLikePost = await this.getIsLikePost(MyPost.data[i])
      const MyPostImage = await this.getPostImage(MyPost.data[i])
      tempImage = []
      for (let i in MyPostImage.data) {
        tempImage = tempImage.concat(MyPostImage.data[i].file_id)
      }
      //console.log(IsLikePost)
      if (MyPostLike.data.length == 0) {
        this.setData({
          tempPost: {
            post_id: MyPost.data[i]._id,
            user_openid: MyPost.data[i]._openid,
            usericon: MyUser.data[0].user_info.avatarUrl,
            username: MyUser.data[0].user_info.nickName,
            posttime: MyPost.data[i].post_time,
            text: MyPost.data[i].post_text,
            image: tempImage,
            likeNum: 0,
            isLike: false,
            likeLink: "cloud://train25years-b437f2.7472-train25years-b437f2/点赞.png"
          }
        })
        this.setData({
          postList: this.data.postList.concat(this.data.tempPost)
        })
      }
      else {
        LikeLink = ""
        IsLike = true
        if (IsLikePost.data.length == 0) {
          LikeLink = "cloud://train25years-b437f2.7472-train25years-b437f2/点赞.png"
          IsLike = false
        }
        else {
          LikeLink = "cloud://train25years-b437f2.7472-train25years-b437f2/点赞2.png"
          IsLike = true
        }
        this.setData({
          tempPost: {
            post_id: MyPost.data[i]._id,
            user_openid: MyPost.data[i]._openid,
            usericon: MyUser.data[0].user_info.avatarUrl,
            username: MyUser.data[0].user_info.nickName,
            posttime: MyPost.data[i].post_time,
            text: MyPost.data[i].post_text,
            image: tempImage,
            likeNum: MyPostLike.data.length,
            isLike: IsLike,
            likeLink: LikeLink
          }
        })
        this.setData({
          postList: this.data.postList.concat(this.data.tempPost)
        })
      }
    }
  },
  async GetInfo(st, ed) {
    const MyOpenID = await this.getOpenID()
    const OthersInfo = await this.getInfo()
    console.log("userinfo")
    console.log(OthersInfo)
    for (let i in OthersInfo.data) {
      if (i < st) {
        continue
      }
      if (i == ed) {
        break
      }
      //console.log(i)
      this.setData({
        endinfo: i
      })
      this.setData({
        tmpInfo: {
          usericon: OthersInfo.data[i].user_info.avatarUrl,
          username: OthersInfo.data[i].user_info.nickName,
          recommend_openid: this.data.openID,
          url: "../../images/check-circle1.png",
          isFollow: false
        }
      })
      this.setData({
        infoList: this.data.infoList.concat(this.data.tmpInfo)
      })
      console.log(this.data.infoList)
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
  getPost() {
    //console.log("post ok")
    return new Promise((resolve, reject) => {
      db.collection('Post').where({
        //"post_text": this.data.inputValue
        post_text: {
          $regex: '.*' + this.data.inputValue,
          $options: 'i'
        }
      }).orderBy('time', 'desc').get().then(res => {
        resolve(res);
      })
    })
  },
  getInfo() {
    return new Promise((resolve, reject) => {
      db.collection('User').where({
        //"user_info.nickName": this.data.inputValue
        user_info: {
          nickName: {
            $regex: '.*' + this.data.inputValue,
            $options: 'i'
          }
        }
      }).get().then(res => {
        resolve(res)
      })
    })
  },
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

  OnLoad: function () {
    this.setData({
      postList: [],
      endpos: 0,
      infoList: [],
      endinfo: 0
    })
    this.onLoad()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    a = Number(this.data.isTag ? this.data.endpos : this.data.endinfo) + Number(0)
    b = Number(this.data.isTag ? this.data.endpos : this.data.endinfo) + Number(5)
    //console.log(b)
    if(this.data.searchButtonPushed){
      this.GetPost(a,b),
      this.GetInfo(a,b)
    }
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

  },


})