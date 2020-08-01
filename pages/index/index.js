// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
    wx.getBeacons({
      success: (result) => {
        console.log(result.beacons)
        console.log(result.errMsg);
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
    var that = this;
    //监测蓝牙状态的改变
    wx.onBluetoothAdapterStateChange(function (res) {
      if (res.available) { //如果用户打开蓝牙，开始搜索IBeacon
      }
    })

    //搜索beacons
    searchBeacon();
    //搜索函数
    function searchBeacon() {
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
                if(beacons.length>0){
                  console.log(beacons[0].uuid)
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

    //关闭成功后开启搜索

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