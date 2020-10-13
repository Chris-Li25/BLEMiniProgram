// pages/testBluetooth/testBluetooth.js
Page({
  data: {
    serviceUUID: "0000aaa0-0000-1000-8000-00805f9b34fb",
    characteristicsUUID: "0000aaa1-0000-1000-8000-00805f9b34fb",
    searchText: "开始扫描",
    disabled: false,
    UUID: "000020200913",
    devices: [],
    deviceID: "",
    mac: "",
    writeValue: "",
  },

  onUnload: function () {
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
      disabled: false,
      searchText: '开始扫描',
      devices: []
    })
  },

  onHide: function () {
    this.stopBluetoothDevicesDiscovery();
    // wx.closeBluetoothAdapter({
    //   success: (res) => {
    //     console.log("关闭蓝牙模块")
    //   },
    // })
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
      disabled: false,
      searchText: '开始扫描'
    })
  },

  openBluetoothAdapter() {
    var that = this;
    try {
      const res = wx.getSystemInfoSync()
      console.log(res.locationEnabled)
      that.data.location = res.locationEnabled
    } catch (e) {
      // Do something when catch error
    }
    if (!that.data.location) {
      wx.showToast({
        title: '需开启定位服务才能搜索到设备',
        icon: 'none'
      })
      return
    }
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.showToast({
            title: "正在开启扫描",
            icon: "loading",
          });
          that.startBluetoothDevicesDiscovery();
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
  // getBluetoothAdapterState() {
  //   var that = this;
  //   that.toastTitle = "检查蓝牙状态";

  //   wx.getBluetoothAdapterState({
  //     success: function (res) {
  //       that.startBluetoothDevicesDiscovery();
  //     },
  //     fail(err) {
  //       console.log(err);
  //     },
  //   });
  // },
  startBluetoothDevicesDiscovery() {
    console.log("获取蓝牙设备列表");
    var that = this;
    that.data.devices = [];
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: function (res) {
        that.setData({
          disabled: true,
          searchText: "扫描中"
        })
        that.onBluetoothDeviceFound();
      },
      fail(err) {
        console.log(err);
      },
    });
  },
  onBluetoothDeviceFound() {
    var _this = this;
    var devices = [];
    wx.onBluetoothDeviceFound((result) => {
      if (result.devices) {
        if (result.devices.length > 0) {
          console.log("扫描到的全部设备")
          console.log(result.devices)
          for (var i = 0; i < result.devices.length; i++) {
            if (result.devices[i].advertisServiceUUIDs) {
              if (result.devices[i].advertisServiceUUIDs.length > 0) {
                if (result.devices[i].advertisServiceUUIDs[0].includes(_this.data.UUID)) {
                  devices.push(result.devices[i])
                }
              }
            }
          }
          console.log("要显示的设备");
          console.log(devices);
          _this.setData({
            devices: devices
          });
        } else {}
      }
    })

  },
  // getBluetoothDevices() {
  //   var _this = this;
  //   wx.getBluetoothDevices({
  //     services: [],
  //     allowDuplicatesKey: false,
  //     interval: 0,
  //     success: function (res) {
  //       if(res.devices){
  //         if (res.devices.length > 0) {
  //           console.log(res.devices)
  //           var devices=[];
  //           for(var i = 0; i<res.devices.length; i++ ){
  //             if(res.devices[i].advertisServiceUUIDs){
  //               if(res.devices[i].advertisServiceUUIDs.length>0){
  //                 console.log(res.devices[i].advertisServiceUUIDs[0]);
  //                 if(res.devices[i].advertisServiceUUIDs[0].includes(_this.data.UUID)){
  //                   devices.push(res.devices[i])
  //                 }
  //               }
  //             }
  //           }
  //           console.log(devices);
  //           _this.setData({
  //             devices: devices
  //           });
  //         } else {}
  //       }

  //     },
  //     fail(res) {
  //       console.log(res, "获取蓝牙设备列表失败=====");
  //     },
  //   });
  // },
  stopBluetoothDevicesDiscovery() {
    console.log("停止扫描");
    wx.stopBluetoothDevicesDiscovery();
    wx.closeBluetoothAdapter({
      success: (res) => {},
    })
    this.setData({
      devices: [],
      disabled: false,
      searchText: "开始扫描"
    })
  },

  // closeBluetoothAdapter() {
  //   wx.closeBluetoothAdapter();
  //   this._discoveryStarted = false;
  // },
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
    if (that.data.writeValue.length < 12) {
      wx.showToast({
        title: '请输入十二位学号',
        icon: 'none'
      })
      return
    }
    that.setData({
      deviceID: ele.currentTarget.dataset.deviceid
    })
    console.log(deviceID)
    wx.showLoading({
      title: '正在发送数据',
      mask: true,
    })
    wx.createBLEConnection({
      deviceId: deviceID,
      success: function (e) {
        console.log(e.errMsg)
        that.WriteCharacteristics(deviceID);
      },
      fail: function (e) {
        console.log(e.errMsg + " " + e.errCode)
        if (e.errCode == -1) {
          that.WriteCharacteristics(deviceID);
        } else {
          wx.hideLoading({
            success: (res) => {
              wx.showToast({
                title: '连接失败,设备离线或其他错误,请重新扫描设备',
                icon: 'none'
              })
            },
          })
        }
      }
    })
  },
  WriteCharacteristics: function (deviceID) {
    var that = this;

    // var deviceID = ele.currentTarget.dataset.deviceid
    // if(that.data.writeValue.length<12){
    //   wx.showToast({
    //     title: '请输入十二位学号',
    //     icon:'none'
    //   })
    //   return
    // }
    // console.log(deviceID)
    // wx.showLoading({
    //   title: '正在发送数据',
    //   mask:true,
    // })
    // wx.createBLEConnection({
    //   deviceId: deviceID,
    //   success: function (e) {
    //     console.log(e.errMsg)
    //     wx.writeBLECharacteristicValue({
    //       deviceId: deviceID,
    //       serviceId: that.data.serviceUUID,
    //       characteristicId: that.data.characteristicsUUID,
    //       value: that.string2buffer(that.data.writeValue),
    //       success(e) {
    //         console.log(e.errMsg)
    //         wx.hideLoading({
    //           success: (res) => {
    //             wx.showToast({
    //               title: '签到成功',
    //               icon:'none'
    //             })
    //           },
    //         })

    //         wx.closeBLEConnection({
    //           deviceId: deviceID,
    //           success(e){
    //             console.log(e.errMsg+"断开连接")
    //           },
    //           fail(e){
    //             console.log(e.errMsg+"断连失败")
    //           }
    //         })
    //       },
    //       fail(e) {
    //         wx.hideLoading({
    //           success: (res) => {
    //             wx.showToast({
    //               title: '写入数据失败，请重试',
    //               icon: 'none'
    //             })
    //           },
    //         })

    //         console.log(e.errMsg)
    //       }
    //     })
    //   },
    //   fail: function (e) {
    //     console.log(e.errMsg+" "+e.errCode)
    //     if(e.errCode==-1){
    //       wx.writeBLECharacteristicValue({
    //         deviceId: deviceID,
    //         serviceId: that.data.serviceUUID,
    //         characteristicId: that.data.characteristicsUUID,
    //         value: that.string2buffer(that.data.writeValue),
    //         success(e) {
    //           console.log(e.errMsg)
    //           wx.hideLoading({
    //             success: (res) => {
    //               wx.showToast({
    //                 title: '签到成功',
    //                 icon:'none'
    //               })
    //             },
    //           })

    //           wx.closeBLEConnection({
    //             deviceId: deviceID,
    //             success(e){
    //               console.log(e.errMsg+"断开连接")
    //             },
    //             fail(e){
    //               console.log(e.errMsg+"断连失败")
    //             }
    //           })
    //         },
    //         fail(e) {
    //           wx.hideLoading({
    //             success: (res) => {
    //               wx.showToast({
    //                 title: '写入数据失败，请重试',
    //                 icon: 'none'
    //               })
    //             },
    //           })

    //           console.log(e.errMsg)
    //         }
    //       })
    //     }else{
    //       wx.hideLoading({
    //         success: (res) => {
    //           wx.showToast({
    //             title: '连接失败,设备离线或其他错误,请重新扫描设备',
    //             icon: 'none'
    //           })
    //         },
    //       })
    //     }
    //   }
    // })

    // wx.writeBLECharacteristicValue({
    //   deviceId: deviceID,
    //   serviceId: that.data.serviceUUID,
    //   characteristicId: that.data.characteristicsUUID,
    //   value: that.string2buffer(that.data.writeValue),
    //   success(e) {
    //     console.log(e.errMsg)
    //     wx.hideLoading({
    //       success: (res) => {
    //         wx.showToast({
    //           title: '签到成功',
    //           icon:'none'
    //         })
    //       },
    //     })

    //     wx.closeBLEConnection({
    //       deviceId: deviceID,
    //       success(e){
    //         console.log(e.errMsg+"断开连接")
    //       },
    //       fail(e){
    //         console.log(e.errMsg+"断连失败")
    //       }
    //     })
    //   },
    //   fail(e) {
    //     wx.hideLoading({
    //       success: (res) => {
    //         wx.showToast({
    //           title: '写入数据失败，请重试',
    //           icon: 'none'
    //         })
    //       },
    //     })

    //     console.log(e.errMsg)
    //   }
    // })

    wx.getBLEDeviceServices({
      deviceId: deviceID,
      success(e) {
        console.log("获取到的设备的services")
        console.log(e.services);
        var serviceID;
        if (e.services) {
          for (var i = 0; i < e.services.length; i++) {
            if (e.services[i].uuid == that.data.serviceUUID.toUpperCase())
              serviceID = e.services[i].uuid
            console.log('发送的service')
            console.log(e.services[i].uuid)
          }
        }
        wx.getBLEDeviceCharacteristics({
          deviceId: deviceID,
          serviceId: serviceID,
          success(e) {
            var characteristicId
            console.log('获取到的特征值')
            console.log(e.characteristics)
            if (e.characteristics) {
              for (var j = 0; j < e.characteristics.length; j++) {
                if (e.characteristics[j].uuid == that.data.characteristicsUUID.toUpperCase())
                  characteristicId = e.characteristics[j].uuid
                console.log('发送的设备特征值')
                console.log(e.characteristics[j].uuid)
              }
            }
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
              deviceId: deviceID,
              serviceId: serviceID,
              characteristicId: characteristicId,
              value: that.string2buffer(that.data.writeValue),
              success(e) {
                console.log(e.errMsg)
                wx.hideLoading({
                  success: (res) => {
                    wx.showToast({
                      title: '签到成功',
                      icon: 'none'
                    })
                  },
                })

                wx.closeBLEConnection({
                  deviceId: deviceID,
                  success(e) {
                    console.log(e.errMsg + "断开连接")
                  },
                  fail(e) {
                    console.log(e.errMsg + "断连失败")
                  }
                })
              },
              fail(e) {
                wx.hideLoading({
                  success: (res) => {
                    wx.showToast({
                      title: '写入数据失败，请重试',
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
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '获取特征值失败，请重试',
                  icon: 'none'
                })
              },
            })
            console.log(e.errMsg)
          }
        })
      },
      fail(e) {
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '获取Services失败，请重试',
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