// pages/testBluetooth/testBluetooth.js
Page({
  data: {
    UUID:"000020200913",
    devices: [],
    deviceID:"",
    mac: "",
    writeValue:"",
  },
  onUnload:function(){
    this.stopBluetoothDevicesDiscovery();
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log("关闭蓝牙模块")
      },
    })
    // wx.closeBLEConnection({
    //   deviceId: this.data.deviceID,
    //   success(e){
    //     console.log(e.errCode+"断开连接")
    //   },
    //   fail(e){
    //     console.log(e.errMsg+"断连失败")
    //   }
    // })
    this.setData({
      devices:[]
    })
  },
  onHide:function(){
    this.stopBluetoothDevicesDiscovery();
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log("关闭蓝牙模块")
      },
    })
    // wx.closeBLEConnection({
    //   deviceId: this.data.deviceID,
    //   success(e){
    //     console.log(e.errCode+"断开连接")
    //   },
    //   fail(e){
    //     console.log(e.errMsg+"断连失败")
    //   }
    // })
    this.setData({
      devices:[]
    })
  },

  openBluetoothAdapter() {
    var that = this;
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.showToast({
            title: "正在获取蓝牙列表",
            icon: "loading",
          });
          that.getBluetoothAdapterState();
        },
        fail: function (err) {
          wx.showModal({
            title: "提示",
            content: "请先打开蓝牙",
            showCancel: false,
          });
          that.stopBluetoothDevicesDiscovery();
        },
      });
    } else {}
  },
  getBluetoothAdapterState() {
    var that = this;
    that.toastTitle = "检查蓝牙状态";

    wx.getBluetoothAdapterState({
      success: function (res) {
        that.startBluetoothDevicesDiscovery();
      },
      fail(err) {
        console.log(err);
      },
    });
  },
  startBluetoothDevicesDiscovery() {
    console.log("获取蓝牙设备列表");
    var that = this;
    that.data.devices = [];
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey:false,
      success: function (res) {
        that.getBluetoothDevices();
      },
      fail(err) {
        console.log(err);
      },
    });
  },
  getBluetoothDevices() {
    var _this = this;
    wx.getBluetoothDevices({
      services: [],
      allowDuplicatesKey: false,
      interval: 0,
      success: function (res) {
        wx.hideToast();
        if (res.devices.length > 0) {
          console.log(res.devices)
          var devices=[];
          for(var i = 0; i<res.devices.length; i++ ){
            if(res.devices[i].advertisServiceUUIDs.length>0){
              console.log(res.devices[i].advertisServiceUUIDs[0]);
              if(res.devices[i].advertisServiceUUIDs[0].includes(_this.data.UUID)){
                devices.push(res.devices[i])
              }
            }
          }
          console.log(devices);
          _this.setData({
            devices: devices
          });
        } else {}
      },
      fail(res) {
        console.log(res, "获取蓝牙设备列表失败=====");
      },
    });
  },
  stopBluetoothDevicesDiscovery() {
    console.log("停止扫描");
    wx.stopBluetoothDevicesDiscovery();
    this.setData({
      devices:[]
    })
  },

  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter();
    this._discoveryStarted = false;
  },
  // getDeviceId(e) {
  //   wx.setClipboardData({
  //     data: e.currentTarget.dataset.deviceid.deviceId,
  //     success(res) {
  //       wx.getClipboardData({
  //         success(res) {
  //           console.log(res.data); // data
  //         },
  //       });
  //     },
  //   });
  // },
  createBLEConnection: function (ele) {
    var deviceID = ele.currentTarget.dataset.deviceid
    var that = this;
    if(that.data.writeValue.length<12){
      wx.showToast({
        title: '请输入十二位学号',
        icon:'none'
      })
      return
    }
    that.setData({
      deviceID:ele.currentTarget.dataset.deviceid
    })
    console.log(deviceID)
    wx.showLoading({
      title: '正在发送数据',
    })
    wx.createBLEConnection({
      deviceId: deviceID,
      success: function (e) {
        console.log(e.errMsg)
        that.GetCharacteristics(deviceID);
      },
      fail: function (e) {
        console.log(e.errMsg+" "+e.errCode)
        if(e.errCode==-1){
          that.GetCharacteristics(deviceID);
        }else{
          wx.hideLoading({
            success: (res) => {
              wx.showToast({
                title: '发送失败',
                icon: 'none'
              })
            },
          })
        }
      }
    })
  },
  GetCharacteristics: function (deviceID) {
    var that = this;
    wx.getBLEDeviceServices({
      deviceId: deviceID,
      success(e) {
        console.log(e.services);
        var serviceID = e.services[0].uuid;

        wx.getBLEDeviceCharacteristics({
          deviceId: deviceID,
          serviceId: serviceID,
          success(e) {
            var characteristicId = e.characteristics[0].uuid
            console.log(e.characteristics)
            // wx.notifyBLECharacteristicValueChange({
            //   characteristicId: characteristicId,
            //   deviceId: deviceID,
            //   serviceId: serviceID,
            //   state: true,
              // success(e) {
              //   console.log(e.errMsg)
                wx.onBLECharacteristicValueChange((result) => {
                  console.log(result)
                  console.log(that.buf2string(result.value))
                })
                wx.writeBLECharacteristicValue({
                  characteristicId: characteristicId,
                  deviceId: deviceID,
                  serviceId: serviceID,
                  value: that.string2buffer(that.data.writeValue),
                  success(e) {
                    console.log(e.errMsg)
                    wx.hideLoading({
                      success: (res) => {
                        wx.showToast({
                          title: '签到成功',
                          icon:'none'
                        })
                      },
                    })
                    
                    wx.closeBLEConnection({
                      deviceId: deviceID,
                      success(e){
                        console.log(e.errMsg+"断开连接")
                      },
                      fail(e){
                        console.log(e.errMsg+"断连失败")
                      }
                    })
                  },
                  fail(e) {
                    wx.hideLoading({
                      success: (res) => {
                        wx.showToast({
                          title: '发送失败',
                          icon: 'none'
                        })
                      },
                    })
                    
                    console.log(e.errMsg)
                  }
                })
              // },
            //   fail(e) {
            //     console.log(e.errMsg)
            //   }
            // })
          },
          fail(e) {
            console.log(e.errMsg)
          }
        })
      },
      fail(e) {
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '发送失败',
              icon: 'none'
            })
          },
        })
        
        console.log(e.errMsg)
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
  }
});