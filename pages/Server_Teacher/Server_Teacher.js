// pages/Server/Server.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip:"广播未开启",
    devicesNumber: 0,
    devicesInfo: [],
    UUID: "000020200913",
    deviceName: "",
    server: null,

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
        } 
        // else if (that.data.UUID.length < 12) {
        //   wx.showToast({
        //     title: '请输入12位学号',
        //     icon: 'none'
        //   })
        //   return
        // } 
        else if (that.data.deviceName.length == 0||that.isNumber_Alphabet(that.data.deviceName)){
          wx.showToast({
            title: '设备名需为数字或字母',
            icon:'none'
          })
          return
        }
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
        },
        fail(e) {
          console.log(e.errMsg+e.errCode)
          wx.hideLoading({
            success: (res) => {
              wx.showToast({
                title: '开启失败,设备不支持或未知错误',
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

  addService(){
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
          if (!that.data.devicesInfo.includes(that.buf2string(res.value))) {
            that.data.devicesNumber++;
            that.data.devicesInfo.push(that.buf2string(res.value));
            that.data.devicesInfo = that.quickSort(that.data.devicesInfo);
            that.setData({
              devicesNumber: that.data.devicesNumber,
              devicesInfo: that.data.devicesInfo
            })
          }

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
            value: that.string2buffer("2020"),
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
              title: '开启广播失败，请重试',
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
          wx.showToast({
            title: '开启广播成功',
            icon: 'none'
          }),
          that.setData({
            tip:"广播已开启"
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
        that.setData({
          server: null,
          tip:"广播未开启"
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
  quickSort(arr){
    var that = this
    //如果数组长度小于1，没必要排序，直接返回
    if(arr.length<=1) return arr;
    //pivot 基准索引，长度的一半
    let pivotIndex = Math.floor(arr.length/2);//奇数项向下取整
    //找到基准，把基准项从原数组删除
    let pivot = arr.splice(pivotIndex,1)[0];
    //定义左右数组
    let left = [];
    let right = [];
    //把比基准小的放left,大的放right
    arr.forEach(element => {
        if(element<pivot){
            left.push(element)
        }else{
            right.push(element)
        }
    });
    return that.quickSort(left).concat([pivot],that.quickSort(right))
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