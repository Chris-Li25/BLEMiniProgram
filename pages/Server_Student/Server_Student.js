// pages/Server/Server.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip:"广播未开启",
    UUID: "",
    deviceName: "BLE",
    server: null,
    feebackMsg:"",

  },
  openBluetoothAdapter: function (e) {
    var that = this;
    wx.openBluetoothAdapter({
      mode: "peripheral",
      success: function (res) {
        console.log("初始化蓝牙模块")

        if (that.data.server) {
          wx.showToast({
            title: '已创建服务并广播，请勿重复操作',
            icon: 'none'
          })
          return
        } else if (that.data.UUID.length < 12) {
          wx.showToast({
            title: '请输入12位学号',
            icon: 'none'
          })
          return
        } 
        // else if (that.data.deviceName.length == 0){
        //   wx.showToast({
        //     title: '姓名不能为空',
        //     icon:'none'
        //   })
        //   return
        // }
        wx.showLoading({
          title: '正在开启广播',
          mask:true
        })
          that.CreateServer();
      },
      fail: function (err) {
        console.log(err.state)
        console.log(err.errCode + err.errMsg)
        wx.showModal({
          title: "提示",
          content: "请先打开蓝牙",
          showCancel: false,
        });
      },
    });
  },
  // getBluetoothAdapterState() {
  //   var that = this;
  //   that.toastTitle = "检查蓝牙状态";

  //   wx.getBluetoothAdapterState({
  //     success: function (res) {
  //       console.log(res.state)
  //       console.log(res.errMsg)
  //       that.CreateServer();
  //     },
  //     fail(err) {
  //       console.log(err.state)
  //       console.log(err);
  //     },
  //   });
  // },

  CreateServer() {
    var that = this;
    if(wx.createBLEPeripheralServer){
      wx.createBLEPeripheralServer({
        success: (result) => {
          that.data.server = result.server
          console.log(result.errMsg);
          console.log("创建服务成功");
          setTimeout(that.addService.bind(that),2000);
          // that.startAdvertising();
        },
        fail(e) {
          console.log(e.errMsg)
          wx.hideLoading({
            success: (res) => {
              wx.showToast({
                title: '开启失败，设备不支持或未知错误 '+e.errMsg,
                icon: 'none'
              })
            },
          })
        }
      })
    }else{
      wx.hideLoading({
        success: (res) => {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        },
      })
    }   
  },

addService:function(){
  var that = this;
  that.data.server.addService({
    service: {
      uuid: "0000aaa0-0000-1000-8000-00805f9b34fb",
      characteristics: [{
        uuid: "0000aaa1-0000-1000-8000-00805f9b34fb",
        properties: {
          write: true,
          read: true,
          notify: true
        },
        permission: {
          readable: true,
          writeable: true
        },
        value: that.string2buffer("201711621313"),
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
      that.data.server.onCharacteristicWriteRequest(function callback(res) {
        that.setData({
          feebackMsg: that.buf2string(res.value),
        })
        that.data.server.writeCharacteristicValue({
          serviceId: res.serviceId,
          characteristicId: res.characteristicId,
          value: res.value,
          needNotify: true,
          callbackId: res.callbackId
        })
      })
      that.data.server.onCharacteristicReadRequest(function callback(res) {
        that.data.server.writeCharacteristicValue({
          serviceId: res.serviceId,
          characteristicId: res.characteristicId,
          value: that.string2buffer("201711621313"),
          needNotify: true,
          callbackId: res.callbackId
        })
      })
      that.startAdvertising();
    },
    fail(e) {
      wx.hideLoading({
        success: (res) => {
          wx.showToast({
            title: '开启广播失败，添加服务失败，请重试',
            icon: 'none'
          })
        },
      })
      console.log(e.errCode)
      console.log(e.errMsg)
      console.log("添加Service失败")
      that.data.server.close({
        success(e) {
          console.log("添加Service失败 关闭服务成功")
        },
        fail(e) {
          console.log("添加Service失败 关闭服务失败")
        }
      })
      that.setData({
        server: null
      })
      return
    }
  })
},

startAdvertising(){
  var that = this;
  var promise = that.data.server.startAdvertising({
    advertiseRequest: {
      deviceName: that.data.deviceName,
      serviceUuids: ["0000aaaa-2017-1162-1313-" + that.data.UUID]
    }
  });
  promise.then(
    (data) => {
      console.log("resolved", data),
      wx.hideLoading({
        success: (res) => {
          that.setData({
            tip: "广播已开启"
          })
          wx.showToast({
            title: '开启广播成功',
            icon: 'none'
          })
        },
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
          title: '用户设备连接了其他BLE设备,请重启蓝牙后重试',
          icon: 'none'
        })
      }else{
        wx.hideLoading({
          success: (res) => {
            wx.showModal({
              content:errMsg.errMsg+'请重试',
              title: '开启广播失败',
              showCancel:false,
            })
          },
        })
        
      }
    }
  )
  console.log(promise)
},


  stopAdvertising() {
    var that = this;
    if (that.data.server) {
      that.data.server.stopAdvertising({
        success(e) {
          console.log('关闭广播成功')
        },
        fail(e) {
          console.log('关闭广播失败')
        }
      })
      that.data.server.close({
          success(e) {
            console.log("关闭服务成功")
          },
          fail(e) {
            console.log("关闭服务失败")
          }
        }),
        wx.showToast({
          title: '广播关闭成功',
          icon:'none'
        })
        that.setData({
          server: null,
          tip:"广播未开启",
          feebackMsg:''
        })
    }else{
      wx.showToast({
        title: '广播未开启',
        icon: 'none'
      })
    }
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

  isHex: function (str) {
    var reg = /[^0-9a-fA-F]+/;
    return reg.test(str)
  },
  isNumber_Alphabet: function (str) {
    var reg = /[^0-9a-zA-Z]+/;
    return reg.test(str)
  },






  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log('关闭蓝牙适配器')
      },
    })
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
    if(this.data.server){
      this.data.server.stopAdvertising({
        success(e) {
          console.log("关闭成功")
        }
      });
      this.data.server.close({
        success(e) {
          console.log("关闭服务")
        }
      });
      this.setData({
        server: null,
      })
    }
    this.setData({
      tip:"广播未开启"
    })
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log('关闭蓝牙适配器成功')
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