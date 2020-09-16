// pages/Server/Server.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    devicesInfo: [],
    UUID: "1111",
    deviceName: "",
    server: null,

  },
  startCreateServer: function (e) {
    var that = this;
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter({
        mode: 'peripheral',
        success: function (res) {
          console.log("初始化蓝牙模块")
          if (that.data.server) {
            wx.showToast({
              title: '已创建服务并广播，请勿重复操作',
              icon: 'none'
            })
            return
          } else if (that.isHex(that.data.UUID) || that.data.UUID.length < 4) {
            wx.showToast({
              title: 'UUID必须为四位十六进制数',
              icon: 'none'
            })
            return
          }
          wx.createBLEPeripheralServer({
            success: (result) => {
              that.data.server = result.server
              console.log(result.errMsg);
              console.log("创建服务成功");
              result.server.addService({
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
                    descriptors: [{
                      uuid: "00002902-0000-1000-8000-00805f9b34fb",
                      permission: {
                        write: true,
                        read: true
                      }
                    }]
                  }]
                },
                success(e) {
                  console.log(e.errMsg)
                  console.log("添加Service成功")

                },
                fail(e) {
                  console.log(e.errCode)
                  console.log(e.errMsg)
                  console.log("添加Service失败")
                  result.server.close({
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
                  return
                }
              })
              result.server.onCharacteristicWriteRequest(function callback(res) {
                that.data.devicesInfo.push(that.buf2string(res.value)),
                  that.setData({
                    devicesInfo: that.data.devicesInfo
                  })
                result.server.writeCharacteristicValue({
                  serviceId: res.serviceId,
                  characteristicId: res.characteristicId,
                  value: res.value,
                  needNotify: true,
                  callbackId: res.callbackId
                })
              })
              result.server.onCharacteristicReadRequest(function callback(res) {
                result.server.writeCharacteristicValue({
                  serviceId: res.serviceId,
                  characteristicId: res.characteristicId,
                  value: that.string2buffer("123123"),
                  needNotify: true,
                  callbackId: res.callbackId
                })
              })
              var promise = result.server.startAdvertising({
                advertiseRequest: {
                  deviceName: that.data.deviceName,
                  serviceUuids: ["0000" + that.data.UUID + "-0000-1000-8000-4a4b31313733"]
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
                  result.server.close({
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
              console.log(e.errMsg)
            }
          })
        },
        fail: function (err) {
          console.log(err.errCode + err.errMsg)
          wx.showModal({
            title: "提示",
            content: "请先打开蓝牙",
            showCancel: false,
          });
        },
      });
    } else {}
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
    this.data.server.close({
      success(e) {
        console.log("关闭服务")
      }
    });
    this.setData({
      server: null,
    })
    this.data.server.stopAdvertising({
      success(e) {
        console.log(关闭成功)
      }
    });
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