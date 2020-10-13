// pages/testBluetooth/testBluetooth.js
import {wxp} from '../../utils/wxp'
Page({
  data: {
    unsendDevicesIDArr: [],
    serviceUUID: '0000aaa0-0000-1000-8000-00805f9b34fb',
    characteristicsUUID: '0000aaa1-0000-1000-8000-00805f9b34fb',
    searchText: '开始扫描',
    disabled: false,
    sendMsg: false,
    studentIdAarry: [],
    // devices: [],
    deviceID: "",
    mac: "",
    writeValue: "",
  },
  watch: {
    unsendDevicesIDArr: async function () {

      var that = this

      while(that.data.unsendDevicesIDArr.length>0&&that.data.sendMsg==true){
        let result = await that.WriteCharacteristics(that.data.unsendDevicesIDArr[that.data.unsendDevicesIDArr.length - 1])
        console.log(result)
        if(result){
          that.data.unsendDevicesIDArr.pop();
          console.log('出栈')
        }
        console.log
      }

      // for (var i = 0; i < that.data.unsendDevicesIDArr.length; i++) {
      //   let result = await that.WriteCharacteristics(that.data.unsendDevicesIDArr[that.data.unsendDevicesIDArr.length - 1])
      //   console.log('启用发送后的信息')
      //   console.log(result)
      // }

      // console.log('开启教师端发送数据功能')
      // console.log(that.data.unsendDevicesIDArr.length)
      // console.log(that.data.unsendDevicesIDArr)
      // while (that.data.unsendDevicesIDArr.length > 0 && that.data.sendMsg) {
      //   console.log('循环内')

      //    var result = that.createBLEConnection(that.data.unsendDevicesIDArr[that.data.unsendDevicesIDArr.length - 1])
      //   if(result){
      //     that.data.unsendDevicesIDArr.pop();
      //   }else{
      //     console.log('发送数据失败')
      //   }

      //   // var promise = new Promise(function (resolve, reject) {
      //   //   // ... some code
      //   //   if (this.createBLEConnection(this.data.unsendDevicesIDArr[this.data.unsendDevicesIDArr.length - 1])) {
      //   //     resolve('发送数据成功');
      //   //   } else {
      //   //     reject('发送数据失败');
      //   //   }
      //   // });
      //   // promise.then(
      //   //   (resolve) => {
      //   //     console.log(resolve)
      //   //     this.data.unsendDevicesIDArr.pop();
      //   //   },
      //   //   (reject) => {
      //   //     console.log(reject)
      //   //   }
      //   // )

      //   // console.log('发送成功后的数组')
      //   // console.log(this.data.unsendDevicesIDArr.length)
      //   // console.log(this.data.unsendDevicesIDArr)
      // }
    }
  },


  onUnload: function () {
    this.stopBluetoothDevicesDiscovery();
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log("关闭蓝牙模块")
      },
    })
    this.setData({
      sendMsg: false
    })
  },

  onHide: function () {
    this.stopBluetoothDevicesDiscovery();
    this.setData({
      sendMsg: false
    })
    // wx.closeBluetoothAdapter({
    //   success: (res) => {
    //     disabled:false,          
    //     console.log("关闭蓝牙模块")
    //   },
    // })
    // // wx.closeBLEConnection({
    // //   deviceId: this.data.deviceID,
    // //   success(e){
    // //     console.log(e.errCode+"断开连接")
    // //   },
    // //   fail(e){
    // //     console.log(e.errMsg+"断连失败")
    // //   }
    // // })
    // this.setData({
    //   disabled:false,
    //   devices:[]
    // })
  },

  onLoad: function () {
    getApp().setWatcher(this);
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
          wx.showLoading({
            title: '正在开启扫描',
            mask: true
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
        wx.hideLoading({
          success: (res) => {},
        })
        that.setData({
          disabled: true,
          searchText: '扫描中'
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
    var studentIdAarry = [];
    var devices = [];
    wx.onBluetoothDeviceFound((result) => {
      if (result.devices) {
        if (result.devices.length > 0) {
          console.log(result.devices)
          for (var i = 0; i < result.devices.length; i++) {
            if (result.devices[i].advertisServiceUUIDs) {
              if (result.devices[i].advertisServiceUUIDs.length > 0) {
                console.log(result.devices[i].advertisServiceUUIDs[0]);
                for (var j = 0; j < result.devices[i].advertisServiceUUIDs.length; j++) {
                  if (result.devices[i].advertisServiceUUIDs[j].includes("2017-1162-1313")) {
                    var studentID = result.devices[i].advertisServiceUUIDs[j].substr(24);
                    result.devices[i].advertisServiceUUIDs[j] = studentID
                    if (!_this.data.studentIdAarry.includes(studentID)) {
                      studentIdAarry.push(studentID);
                      devices.push(result.devices[i].deviceId)
                      studentIdAarry = _this.quickSort(studentIdAarry)
                    }
                  }
                }

              }
            }
          }
          console.log(devices);
          _this.setData({
            sendMsg: true,
            studentIdAarry: studentIdAarry,
            unsendDevicesIDArr: devices
          });
        } else {}
      }
    })
  },

  createBLEConnection: function (deviceId) {
    var that = this;
    console.log(deviceId)
    return wx.createBLEConnection({
      deviceId: deviceId,
      success: function (e) {
        console.log(e.errMsg)
        return that.WriteCharacteristics(deviceId);
      },
      fail: function (e) {
        console.log(e.errMsg + " " + e.errCode)
        if (e.errCode == -1) {
          return that.WriteCharacteristics(deviceId);
        } else {
          console.log('BLE连接失败')
          console.log(e.errMsg)
          return false;
        }
      }
    })
  },

  WriteCharacteristics:async function (deviceID) {

    var that = this;

    var promise = await wxp.createBLEConnection({
      deviceId: deviceID
    }).then(
      resolve => {
        console.log(resolve)
        return wxp.writeBLECharacteristicValue({
          characteristicId: that.data.characteristicsUUID,
          deviceId: deviceID,
          serviceId: that.data.serviceUUID,
          value: that.string2buffer("sendMsg"),
        }).then(
          resolve=>{
            console.log(resolve)
            wx.closeBLEConnection({
              deviceId: deviceID
            })
            return new Promise(function(resolve,reject){
              resolve(true)
            })
          }
        )
      },
      reject=>{
        console.log(reject)
        if(reject.errCode == -1){
          return wxp.writeBLECharacteristicValue({
            characteristicId: that.data.characteristicsUUID,
            deviceId: deviceID,
            serviceId: that.data.serviceUUID,
            value: that.string2buffer("sendMsg"),
          }).then(
            resolve=>{
              console.log(resolve)
              wx.closeBLEConnection({
                deviceId: deviceID
              })
              return new Promise(function(resolve,reject){
                resolve(true)
              })
            }
          )
        }else{
          return new Promise(function(resolve,reject){
            resolve(false)
          })
        }
      }

    )
    return promise;


    // return wx.createBLEConnection({
    //   deviceId: deviceID,
    //   success: function (e) {
    //     console.log(e.errMsg)
    //     return wx.writeBLECharacteristicValue({
    //       characteristicId: that.data.characteristicsUUID,
    //       deviceId: deviceID,
    //       serviceId: that.data.serviceUUID,
    //       value: that.string2buffer("sendMsg"),
    //       success(e) {
    //         console.log('写入数据成功')
    //         console.log(e.errMsg)
    //         wx.closeBLEConnection({
    //           deviceId: deviceID,
    //           success(e) {
    //             console.log('断连成功')
    //           }
    //         })
    //         return new Promise(function(resolve,reject){
    //           resolve(true)
    //         });
    //       },
    //       fail(e) {
    //         console.log('写入数据失败')
    //         console.log(e.errMsg)
    //         wx.closeBLEConnection({
    //           deviceId: deviceID,
    //           success(e) {
    //             console.log('断连成功')
    //           }
    //         })
    //         return new Promise(function(resolve,reject){
    //           reject(false)
    //         });
    //       }
    //     })
    //   },
    //   fail: function (e) {
    //     console.log(e.errMsg + " " + e.errCode)
    //     if (e.errCode == -1) {
    //       return wx.writeBLECharacteristicValue({
    //         characteristicId: that.data.characteristicsUUID,
    //         deviceId: deviceID,
    //         serviceId: that.data.serviceUUID,
    //         value: that.string2buffer("sendMsg"),
    //         success(e) {
    //           console.log('写入数据成功')
    //           console.log(e.errMsg)
    //           wx.closeBLEConnection({
    //             deviceId: deviceID,
    //             success(e) {
    //               console.log('断连成功')
    //             }
    //           })
    //           return new Promise(function(resolve,reject){
    //             resolve(true)
    //           });
    //         },
    //         fail(e) {
    //           console.log('写入数据失败')
    //           console.log(e.errMsg)
    //           wx.closeBLEConnection({
    //             deviceId: deviceID,
    //             success(e) {
    //               console.log('断连成功')
    //             }
    //           })
    //           return new Promise(function(resolve,reject){
    //             reject(false)
    //           });
    //         }
    //       })
    //     } else {
    //       console.log('BLE连接失败')
    //       console.log(e.errMsg)
    //       return new Promise(function(resolve,reject){
    //         reject(false)
    //       });
    //     }
    //   }
    // })

    // wx.writeBLECharacteristicValue({
    //   characteristicId: that.data.characteristicsUUID,
    //   deviceId: deviceID,
    //   serviceId: that.data.serviceUUID,
    //   value: that.string2buffer("sendMsg"),
    //   success(e) {
    //     console.log('写入数据成功')
    //     console.log(e.errMsg)
    //     wx.closeBLEConnection({
    //       deviceId: deviceID,
    //       success(e) {
    //         console.log('断连成功')
    //       }
    //     })
    //     return true;
    //   },
    //   fail(e) {
    //     console.log('写入数据失败')
    //     console.log(e.errMsg)
    //     wx.closeBLEConnection({
    //       deviceId: deviceID,
    //       success(e) {
    //         console.log('断连成功')
    //       }
    //     })
    //     return false;
    //   }
    // })

    // wx.getBLEDeviceServices({
    //   deviceId: deviceID,
    //   success(e) {
    //     console.log("获取到的设备的services")
    //     console.log(e.services);
    //     var serviceID = e.services[0].uuid;
    //     wx.getBLEDeviceCharacteristics({
    //       deviceId: deviceID,
    //       serviceId: serviceID,
    //       success(e) {
    //         var characteristicId = e.characteristics[0].uuid
    //         console.log('获取到的设备特征值')
    //         console.log(e.characteristics)
    //         // wx.notifyBLECharacteristicValueChange({
    //         //   characteristicId: characteristicId,
    //         //   deviceId: deviceID,
    //         //   serviceId: serviceID,
    //         //   state: true,
    //           // success(e) {
    //           //   console.log(e.errMsg)
    //             // wx.onBLECharacteristicValueChange((result) => {
    //             //   console.log(result)
    //             //   console.log(that.buf2string(result.value))
    //             // })
    //             wx.writeBLECharacteristicValue({
    //               characteristicId: characteristicId,
    //               deviceId: deviceID,
    //               serviceId: serviceID,
    //               value: that.string2buffer("sendMsg"),
    //               success(e) {
    //                 console.log('写入数据成功')
    //                 console.log(e.errMsg)
    //                 wx.closeBLEConnection({
    //                   deviceId: deviceID,
    //                   success(e){
    //                     console.log(e.errMsg+"断开连接")
    //                   },
    //                   fail(e){
    //                     console.log(e.errMsg+"断连失败")
    //                   }
    //                 })
    //               },
    //               fail(e) {
    //                 console.log('写入数据失败')
    //                 console.log(e.errMsg)
    //               }
    //             })
    //       },
    //       fail(e) {
    //         console.log('获取特征值失败')
    //         console.log(e.errMsg)
    //       }
    //     })
    //   },
    //   fail(e) {
    //     console.log('获取Services失败')
    //     console.log(e.errMsg)
    //   }
    // })
  },

  // getBluetoothDevices() {
  //   var _this = this;
  //   wx.getBluetoothDevices({
  //     services: [],
  //     allowDuplicatesKey: false,
  //     interval: 0,
  //     success: function (res) {
  //       wx.hideToast();
  //       if(res.devices){
  //         if (res.devices.length > 0) {
  //           console.log(res.devices)
  //           var devices=[];
  //           for(var i = 0; i<res.devices.length; i++ ){
  //             if(res.devices[i].advertisServiceUUIDs){
  //               if(res.devices[i].advertisServiceUUIDs.length>0){
  //                 console.log(res.devices[i].advertisServiceUUIDs[0]);
  //                 if(res.devices[i].advertisServiceUUIDs[0].includes("2017-1162-1313")){
  //                   var studentID = res.devices[i].advertisServiceUUIDs[0].substr(24);
  //                   res.devices[i].advertisServiceUUIDs[0]= studentID
  //                   if(!_this.data.studentIdAarry.includes(studentID)){
  //                     devices.push(res.devices[i])
  //                   }
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
    this.setData({
      searchText: '开始扫描',
      disabled: false,
      sendMsg: false
      
    })
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

  // createBLEConnection: function (ele) {
  //   var deviceID = ele.currentTarget.dataset.deviceid
  //   var that = this;
  //   if(that.data.writeValue.length<12){
  //     wx.showToast({
  //       title: '请输入十二位学号',
  //       icon:'none'
  //     })
  //     return
  //   }
  //   that.setData({
  //     deviceID:ele.currentTarget.dataset.deviceid
  //   })
  //   console.log(deviceID)
  //   wx.showLoading({
  //     title: '正在发送数据',
  //   })
  //   wx.createBLEConnection({
  //     deviceId: deviceID,
  //     success: function (e) {
  //       console.log(e.errMsg)
  //       that.GetCharacteristics(deviceID);
  //     },
  //     fail: function (e) {
  //       console.log(e.errMsg+" "+e.errCode)
  //       if(e.errCode==-1){
  //         that.GetCharacteristics(deviceID);
  //       }else{
  //         wx.hideLoading({
  //           success: (res) => {
  //             wx.showToast({
  //               title: '发送失败',
  //               icon: 'none'
  //             })
  //           },
  //         })
  //       }
  //     }
  //   })
  // },

  // GetCharacteristics: function (deviceID) {
  //   var that = this;
  //   wx.getBLEDeviceServices({
  //     deviceId: deviceID,
  //     success(e) {
  //       console.log(e.services);
  //       var serviceID = e.services[0].uuid;
  //       wx.getBLEDeviceCharacteristics({
  //         deviceId: deviceID,
  //         serviceId: serviceID,
  //         success(e) {
  //           var characteristicId = e.characteristics[0].uuid
  //           console.log(e.characteristics)
  //           // wx.notifyBLECharacteristicValueChange({
  //           //   characteristicId: characteristicId,
  //           //   deviceId: deviceID,
  //           //   serviceId: serviceID,
  //           //   state: true,
  //             // success(e) {
  //             //   console.log(e.errMsg)
  //               wx.onBLECharacteristicValueChange((result) => {
  //                 console.log(result)
  //                 console.log(that.buf2string(result.value))
  //               })
  //               wx.writeBLECharacteristicValue({
  //                 characteristicId: characteristicId,
  //                 deviceId: deviceID,
  //                 serviceId: serviceID,
  //                 value: that.string2buffer(that.data.writeValue),
  //                 success(e) {
  //                   console.log(e.errMsg)
  //                   wx.hideLoading({
  //                     success: (res) => {
  //                       wx.showToast({
  //                         title: '签到成功',
  //                         icon:'none'
  //                       })
  //                     },
  //                   }) 
  //                   wx.closeBLEConnection({
  //                     deviceId: deviceID,
  //                     success(e){
  //                       console.log(e.errMsg+"断开连接")
  //                     },
  //                     fail(e){
  //                       console.log(e.errMsg+"断连失败")
  //                     }
  //                   })
  //                 },
  //                 fail(e) {
  //                   wx.hideLoading({
  //                     success: (res) => {
  //                       wx.showToast({
  //                         title: '发送失败',
  //                         icon: 'none'
  //                       })
  //                     },
  //                   })
  //                   console.log(e.errMsg)
  //                 }
  //               })
  //             // },
  //           //   fail(e) {
  //           //     console.log(e.errMsg)
  //           //   }
  //           // })
  //         },
  //         fail(e) {
  //           console.log(e.errMsg)
  //         }
  //       })
  //     },
  //     fail(e) {
  //       wx.hideLoading({
  //         success: (res) => {
  //           wx.showToast({
  //             title: '发送失败',
  //             icon: 'none'
  //           })
  //         },
  //       })
  //       console.log(e.errMsg)
  //     }
  //   })
  // },

  sendFeedbackMsg() {

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

  quickSort(arr) {
    var that = this
    //如果数组长度小于1，没必要排序，直接返回
    if (arr.length <= 1) return arr;
    //pivot 基准索引，长度的一半
    let pivotIndex = Math.floor(arr.length / 2); //奇数项向下取整
    //找到基准，把基准项从原数组删除
    let pivot = arr.splice(pivotIndex, 1)[0];
    //定义左右数组
    let left = [];
    let right = [];
    //把比基准小的放left,大的放right
    arr.forEach(element => {
      if (element < pivot) {
        left.push(element)
      } else {
        right.push(element)
      }
    });
    return that.quickSort(left).concat([pivot], that.quickSort(right))
  }

});