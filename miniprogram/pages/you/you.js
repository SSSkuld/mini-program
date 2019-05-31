// 1. 获取数据库引用
const db = wx.cloud.database()
//推荐给你关注的人 实际为数据库的全部用户
const recommender=db.collection("User")
Page({

  data: {
    //用来存you界面推荐给你人的信息 一个人 一条list
    ifo_list:[],
    current_user_openid:"",
    tmp_ifo:{
      usericon:"",
      username:"",
      isFollow:false,
      number_Follower:0,
      location:"",
      url:"",
      //主页面推荐给当前用户关注的人的openid
      recommend_openid:""
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'login'
    }).then(res0 => {
      //获取openID
      this.setData({
        current_user_openid: res0.result.openid
      });
      console.log("you_onload")

      this.setData({
        ifo_list: [],
      })
      //拉取User表
      recommender.get().then(res=>{
          //console.log(res);
          //console.log(res.data);
          //把拉取的数组赋值给 ifo_list
          for (let i in res.data) {
            db.collection('Follow').where({
              current_user_openid:this.data.current_user_openid,
              recommend_openid:res.data[i]._openid
            }).get().then(res1 =>{
              //查询长度为0 没有搜到关注记录
              //console.log(res1)
              if(res1.data.length==0){
                this.setData({
                  tmp_ifo: {
                    usericon: res.data[i].user_info.avatarUrl,
                    username: res.data[i].user_info.nickName,
                    recommend_openid: res.data[i]._openid,
                    location: res.data[i].user_info.country + " " + res.data[i].user_info.province + " " + res.data[i].user_info.city,
                    url: "../../images/check-circle1.png",
                    isFollow:false,
                    //number_Follower:numberOfFollower,
                  }
                })
                //tmp_ifo加入list中
                this.setData({
                  ifo_list: this.data.ifo_list.concat(this.data.tmp_ifo),
                })
              }
              //搜到了关注记录
              else{
                this.setData({
                  tmp_ifo: {
                    usericon: res.data[i].user_info.avatarUrl,
                    username: res.data[i].user_info.nickName,
                    recommend_openid: res.data[i]._openid,
                    location: res.data[i].user_info.country + " " + res.data[i].user_info.province + " " + res.data[i].user_info.city,
                    url: "../../images/check-circle2.png",
                    isFollow:true,
                    //number_Follower: numberOfFollower,
                  }
                })
                //tmp_ifo加入list中
                this.setData({
                  ifo_list: this.data.ifo_list.concat(this.data.tmp_ifo),
                })
              }

            })
          }
        
      })
        //console.log("END---------------------------------END");
    }).catch(err =>{
      console.log(err);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading()
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
  //获取用户的follower 关注当前用户的人
  getUserFollower(openId) {
    return new Promise((resolve, reject) => {
      follow.where({
        recommend_openid: openId
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },
  follow:function(e){

    var index = parseInt(e.currentTarget.dataset.index);
    console.log("index  "+index);
    var ifo_list=this.data.ifo_list;

    for(let i in ifo_list){
      //找到对应下标
      if(i==index){
        //当前用户没有关注
        //console.log(ifo_list[i]);
        if(ifo_list[i].isFollow==false){
          ifo_list[i].isFollow = true,
          ifo_list[i].url = "../../images/check-circle2.png",
          wx.showToast({
            title: '关注成功',
            icon: 'success',
            duration: 1000
          })
          //更新Follow表 添加这一条关注数据
          db.collection('Follow').add({
            data:{
              current_user_openid:this.data.current_user_openid,
              recommend_openid:ifo_list[i].recommend_openid,
            }
          })
        }
        //当前用户已经关注了
        else{
          wx.showToast({
            title: '亲,您已经关注了哦',
            duration: 1000
          })
        }
      }
    }
    console.log(this.data.ifo_list)
    this.setData({
      ifo_list:ifo_list
    })
  },

  unfollow:function(e){
    //只有关注后才能取消关注
    var index = parseInt(e.currentTarget.dataset.index);
    console.log("index  " + index);
    var ifo_list = this.data.ifo_list;

    for (let i in ifo_list) {
      //找到对应下标
      if (i == index) {
        //该用户还未关注
        if(ifo_list[i].isFollow==false){
          wx.showToast({
            title: '亲,您还未关注该用户',
            icon:'none',
            duration: 1000
          })
        }
        //当前用户已经关注
        if (ifo_list[i].isFollow == true) {
          wx.showModal({
            title: '提示',
            content: '确定取消关注该用户？',
            success: (res) => {
              if (res.confirm) {
                console.log('用户点击确定');
                ifo_list[i].isFollow = false
                ifo_list[i].url= "../../images/check-circle1.png"
                this.setData({
                  ifo_list: ifo_list
                })
                //从Follow表删除该条数据,先查找,后删除
                db.collection('Follow').where({ 
                  current_user_openid:this.data.current_user_openid,
                  recommend_openid:ifo_list[i].recommend_openid,
                }).get().then(res1 =>{
                   console.log(res1.data[0]._id)
                   //删除对应那条的id 只有一条        
                  db.collection('Follow').doc(res1.data[0]._id).remove();

                  }).catch(err => {
                    console.log(err);
                  })

              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    }
  },

  findEvent:function(){
    wx.showLoading({
      title:'正在开发哦',
    })
    setTimeout(function(){
      wx.hideLoading()
    },1000)
  },

  onPullDownRefresh:function(){
    wx.showNavigationBarLoading()
    setTimeout(function(){
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    },1000);
  },
  jump1:function(e){
    var widthOfScreen=  wx.getSystemInfoSync().windowWidth
    var flag=widthOfScreen/2
    //从1跳2
    if(e.detail.x<flag)
    {
      wx.navigateTo({
        url: "/pages/follow/follow"
      });
    }
  }
})
