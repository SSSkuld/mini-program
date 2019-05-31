//获取数据库
const db=wx.cloud.database()
//查询Follow表
const concern=db.collection("Follow")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current_user_openid:"",
    tmp_list:[],
    concern_list:[],
    tmp_concern:{
      location:"",
      usericon:"",
      username:"",
      isFollow:true,
      //主页面推荐给当前用户关注的人的openid
      concern_openid:""
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({ title: '加载中', })
    wx.cloud.callFunction({
      name:'login'
    }).then(res0 => {
      //获取openID
      this.setData({
        current_user_openid: res0.result.openid
      });
      console.log(res0.result.openid)
      this.setData({
        concern_list: [],
      })
      //拉取User表
      concern.get().then(res=>{
          //console.log(res);
          console.log(res.data);
          //当前res是Follow表
          for (let i in res.data) {
            db.collection('User').where({
              _openid:res.data[i].recommend_openid,
            }).get().then(res1 =>{
              //console.log(res1.data[0])
                this.setData({
                  tmp_concern: {
                    usericon: res1.data[0].user_info.avatarUrl,
                    username: res1.data[0].user_info.nickName,
                    location: res1.data[0].user_info.country + " " + res1.data[0].user_info.province + " "+ res1.data[0].user_info.city,
                    concern_openid: res1.data[0]._openid,
                    isFollow:true
                  }
                })
                
                //tmp_ifo加入list中
                this.setData({
                  concern_list: this.data.concern_list.concat(this.data.tmp_concern),
                })
              
            })
          }
      })
      
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
  unfollow: function (e) {
    //只有关注后才能取消关注
    var index = parseInt(e.currentTarget.dataset.index);
    console.log("index  " + index);
    var concern_list = this.data.concern_list;
    for (let i in concern_list) {
      //找到对应下标
      if (i == index) {
        //该用户还未关注
        if (concern_list[i].isFollow == false) {
          wx.showToast({
            title: '亲,您还未关注该用户',
            icon: 'none',
            duration: 1000
          })
        }
        //当前用户已经关注
        if (concern_list[i].isFollow == true) {
          wx.showModal({
            title: '提示',
            content: '确定取消关注该用户？',
            success: (res) => {
              if (res.confirm) {
                console.log('用户点击确定');
                //清空
                this.setData({
                  tmp_list:[],
                })
                //遍历 i!=j 插入元素
                for(let j in concern_list)
                {
                  if(j!=i)
                  {
                    this.setData({
                      tmp_list: this.data.tmp_list.concat(concern_list[j]),
                    })
                  }
                }

                this.setData({
                  concern_list: this.data.tmp_list
                })
                //从Follow表删除该条数据,先查找,后删除
                db.collection('Follow').where({
                  current_user_openid: this.data.current_user_openid,
                  recommend_openid: concern_list[i].recommend_openid,
                }).get().then(res1 => {
                  console.log(res1.data[0]._id)
                  //删除对应那条的id 只有一条        
                  db.collection('Follow').doc(res1.data[0]._id).remove();

                }).catch(err => {
                  console.log(err);
                })

              } 
              else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    }
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    setTimeout(function () {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }, 1000);
  },
  jump1: function (e) {
    var widthOfScreen = wx.getSystemInfoSync().windowWidth
    var flag = widthOfScreen / 2
    //从1跳2
    if (e.detail.x > flag) {
      wx.navigateTo({
        url: "../you/you"
      });
    }
  }
})
