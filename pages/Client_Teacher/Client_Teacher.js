// pages/testBluetooth/testBluetooth.js
Page({
  data: {
    searchText:'开始扫描',
    disabled:false,
    studentIdAarry:[],
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
    // this.setData({
    //   disabled:false,
    //   searchText:'开始扫描',
    //   devices:[],
    //   studentIdAarry:[]
    // })
  },
  onHide:function(){
    this.stopBluetoothDevicesDiscovery();
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

  openBluetoothAdapter() {
    var that = this;
    try {
      const res = wx.getSystemInfoSync()
      console.log(res.locationEnabled)
      that.data.location = res.locationEnabled
    } catch (e) {
      // Do something when catch error
    }
    if(!that.data.location){
      wx.showToast({
        title: '需开启定位服务才能搜索到设备',
        icon:'none'
      })
      return
    }
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.showLoading({
            title: '正在开启扫描',
            mask:true
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
      allowDuplicatesKey:false,
      success: function (res) {
        wx.hideLoading({
          success: (res) => {
          },
        })
        that.setData({
          disabled:true,
          searchText:'扫描中'          
        })
        that.onBluetoothDeviceFound();
      },
      fail(err) {
        console.log(err);
      },
    });
  },
  onBluetoothDeviceFound(){
    var _this = this;
    var studentIdAarry=[];
    var devices=[];
    wx.onBluetoothDeviceFound((result) => {
        if(result.devices){
          if (result.devices.length > 0) {
            console.log(result.devices)
            for(var i = 0; i<result.devices.length; i++ ){
              if(result.devices[i].advertisServiceUUIDs){
                if(result.devices[i].advertisServiceUUIDs.length>0){
                  console.log(result.devices[i].advertisServiceUUIDs[0]);
                  if(result.devices[i].advertisServiceUUIDs[0].includes("2017-1162-1313")){
                    var studentID = result.devices[i].advertisServiceUUIDs[0].substr(24);
                    result.devices[i].advertisServiceUUIDs[0]= studentID
                    if(!_this.data.studentIdAarry.includes(studentID)){
                      studentIdAarry.push(studentID);
                      devices.push(result.devices[i])
                      studentIdAarry = _this.quickSort(studentIdAarry)
                    }
                  }
                }
              } 
            }
            console.log(devices);
            _this.setData({
              studentIdAarry:studentIdAarry,
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
      searchText:'开始扫描',
      disabled:false,
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
  }

});
