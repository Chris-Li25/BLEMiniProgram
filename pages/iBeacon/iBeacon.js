// pages/iBeacon/iBeacon.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    major: '1',
    minor: '1',
    uuid: '1',
    rssi: '1',
    accuracy: '1'
  },

  // IBeaconDiscovery: function (e) {
  //   //   wx.startBeaconDiscovery({
  //   //     uuids: ['12345678-1234-1234-1234-1234567890AB'],
  //   //     success(res){
  //   //       console.log(res.errCode+"成功")
  //   //     },
  //   //     fail:function(e){
  //   //       console.log(e.errCode+"失败")
  //   //     }
  //   //   })

  //   wx.startBeaconDiscovery({
  //     uuids: ['12345678-1234-1234-1234-1234567890AB','12341234-1234-1234-1234-123412341234'],
  //     success: function (e) {
  //       console.log("开始扫描设备...");
  //       console.log(e.errMsg);
  //       // 监听iBeacon信号
  //       wx.onBeaconUpdate(function (res) {
  //         // 请注意，官方文档此处又有BUG，是res.beacons，不是beacons。
  //         if (res && res.beacons && res.beacons.length > 0) {
  //           devices = res.beacons;
  //           // 此处最好检测rssi是否等于0，等于0的话信号强度等信息不准确。我是5秒内重复扫描排重。
  //         }
  //       });
  //     },
  //     fail :function(e){
  //       console.log(e.errMsg);
  //     }
  //   })
  // },
  GetBeacon: function (e) {
    var that = this;
    wx.getBeacons({
      success: (result) => {
        console.log(result.errMsg)
        console.log(result.beacons.length)
        console.log(result.beacons[0].uuid)
        console.log(result.beacons[0].major)
        console.log(result.beacons[0].minor)
        console.log(result.beacons[0].rssi)
        console.log(result.beacons[0].accuracy)
          // that.setData({
          //   uuid: result[0].uuid,
          //   major: result[0].major,
          //   minor: result[0].minor,
          //   rssi: result[0].rssi,
          //   accuracy: result[0].accuracy
          // })
      },
      fail: function (e) {
        console.log(e.errCode)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var that = this;
    // if (wx.startBeaconDiscovery) {
    //   console.log("支持")
    // } else {
    //   // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    //   wx.showModal({
    //     title: '提示',
    //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    //   })
    // }
    // //监测蓝牙状态的改变
    // wx.onBluetoothAdapterStateChange(function (res) {
    //   if (res.available) { //如果用户打开蓝牙，开始搜索IBeacon
    //   }
    // })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // wx.stopBeaconDiscovery({success:function(res){
    //   console.log(res.errMsg)
    // }})
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.stopBeaconDiscovery({
      success: (res) => {
        console.log(res.errMsg)
      },
    })
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
  searchIBeacon: function () {
    var that = this;
    //检测蓝牙状态
    wx.openBluetoothAdapter({
      success: function (res) { //蓝牙状态：打开
        console.log("蓝牙开启"),
          wx.startBeaconDiscovery({ //开始搜索附近的iBeacon设备
            uuids: ['12345678-1234-1234-1234-1234567890AB'], //参数uuid
            success: function (res) {
              console.log(res.errMsg);
              wx.onBeaconUpdate(function (res) { //监听 iBeacon 设备的更新事件  
                //封装请求数据 
                var beacons = res.beacons;
                if (beacons.length > 0) {
                  that.setData({
                    uuid: beacons[0].uuid,
                    major: beacons[0].major,
                    minor: beacons[0].minor,
                    rssi: beacons[0].rssi,
                    accuracy: beacons[0].accuracy
                  })
                }
              })
            },
            fail: function (res) {
              //先关闭搜索再重新开启搜索,这一步操作是防止重复wx.startBeaconDiscovery导致失败
              console.log(res.errMsg)
            }
          })
      },
      fail: function (res) { //蓝牙状态：关闭
        wx.showToast({
          title: "请打开蓝牙",
          icon: "none",
          duration: 2000
        })
      }
    })
  }
})