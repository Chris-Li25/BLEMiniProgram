// pages/IosTest.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    server:null,
  },

  openBluetoothAdapter:function(e){
    var that = this;
      wx.openBluetoothAdapter({
        mode: 'peripheral',
        success(e){
          console.log(e)
          that.createServer();
          
        },
        fail: function (err) {
          console.log(err.errCode + err.errMsg)
          wx.showModal({
            title: "提示",
            content: "请先打开蓝牙",
            showCancel: false,
          });
        }
      })
  },
  createServer(){
    var that = this;
    wx.createBLEPeripheralServer({
      success: (result) => {
        that.setData({
          server:result.server
        })
        console.log(result.errMsg);
        console.log("创建服务成功");
        setTimeout(that.addService.bind(that),3000)
      },
      fail(e) {
        wx.showToast({
          title: '设备不支持或发生未知错误，请重试',
          icon:'none'
        })
        console.log(e.errMsg)
      }
    })
  },

  addService: function(){
    var that = this;
    that.data.server.addService({
      service: {
        uuid: "0000aaa0-0000-1000-8000-00805f9b34fb",
        characteristics: [{
          uuid: "0000aaa1-0000-1000-8000-00805f9b34fb",
          properties: {
            write: true,
            read: true,
          },
          permission: {
            readable: true,
            writeable: true
          },
          value: that.string2buffer("123"),
          // descriptors: [{
          //   uuid: "00002902-0000-1000-8000-00805f9b34fb",
          //   permission: {
          //     write: true,
          //     read: true
          //   }
          // }]
        }]
      },
      success(e) {
        console.log(e.errMsg)
        console.log("添加Service成功")
        var promise = that.data.server.startAdvertising({
          advertiseRequest: {
            deviceName: "IOS",
            serviceUuids: ["0000" + "1234" + "-2017-1162-1313-4a4b31313733"]
          }
        });
        promise.then(
          (data) => {
            console.log("resolved", data),
              wx.showToast({
                title: '开启广播成功',
                icon: 'none'
              })
          },
          (errMsg) => {
            that.data.server.close({
              success(e) {
                console.log("关闭服务")
              }
            })
            that.setData({
              server: null
            })
            console.log("rejected")
            console.log(errMsg)
            if (errMsg.errCode == 10000) {
              wx.showToast({
                title: '用户设备连接了其他BLE设备，请重启蓝牙后重试',
                icon: 'none'
              })
            }
          }
        )
        console.log(promise)
      },
      fail(e) {
        console.log(e.errCode)
        console.log(e.errMsg)
        console.log("添加Service失败")
        if(that.data.server){
          that.data.server.close({
            success(e){
              console.log("添加Service失败关闭服务成功")
            },
            fail(e){
              console.log("添加Service失败关闭服务失败")
            }
          })
          that.setData({
            server:null
          })
        }
        wx.showToast({
          title: '开启失败',
          icon: "none"
        })
      }
    })
  },
  buf2string: function (buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    var str = ''
    for (var i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i])
    }
    return str
  },
  string2buffer: function (str) {
    // 首先将字符串转为16进制
    let val = ""
    for (let i = 0; i < str.length; i++) {
      if (val === '') {
        val = str.charCodeAt(i).toString(16)
      } else {
        val += ',' + str.charCodeAt(i).toString(16)
      }
    }
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    })).buffer
  },
  getBluetoothAdapterState() {
    var that = this;
    that.toastTitle = "检查蓝牙状态";

    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log(res.errMsg)
        // that.CreateServer();
      },
      fail(err) {
        console.log(err);
      },
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log("关闭蓝牙适配器")
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

  }
})