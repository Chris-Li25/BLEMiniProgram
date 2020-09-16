// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
  },

  goToTest_1(){
    wx.navigateTo({
      url: '../Test_1/Test_1',
      fail(e){
        console.log(e.errMsg)
      }
    })
  },
  goToTest_2(){
    wx.navigateTo({
      url: '../Test_2/Test_2',
      fail(e){
        console.log(e.errMsg)
      }
    })
  },

  // goToServer:function(e){
  //   wx.navigateTo({
  //     url: '../Server/Server',
  //     fail(e){
  //       console.log(e.errMsg)
  //     }
  //   })
  // },
  // goToClient:function(e){
  //   wx.navigateTo({
  //     url: '../testBluetooth/testBluetooth',
  //     fail(e){
  //       console.log(e.errMsg)
  //     }
  //   })
  // },
  // goToiBeacon:function(e){
  //   wx.navigateTo({
  //     url: '../iBeacon/iBeacon',
  //     fail(e){
  //       console.log(e.errMsg)
  //     }
  //   })
  // },
  // goToIosTest:function(e){
  //   wx.navigateTo({
  //     url: '../IosTest/IosTest',
  //   })
  // }

  
})
