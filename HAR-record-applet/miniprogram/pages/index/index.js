//index.js
const app = getApp()
var that
const db = wx.cloud.database();
var loaded = 0;


Page({
  data: {
    collection: ['HARtrain','HARtest','HARpred','HARnone', 'HARjump', 'HARstep', 'HARsquat', 'HARorz'],
    accX: [],
    accY: [],
    accZ: [],
    geoX: [],
    geoY: [],
    geoZ: [],
    timeA: [],
    timeG: [],


    inputTime: 60,
    // inputTall: 175,
    left: 0,

    collections: ['0 train', '1 test', '2 predict','4 无', '5 跳', '6 踏步', '7 扩胸', '8 前绕环'],
    objectArray: [{
      id: 0,
      name: 'train'
    },
    {
      id: 1,
      name: 'test'
    }
    ],
    col_index: 0,
    gender: ['0 男', '1 女'],
    objectArray: [{
        id: 0,
        name: '男'
      },
      {
        id: 1,
        name: '女'
      }
    ],
    gender_index: 0,
    act: ['0 前绕环', '1 开合跳', '2 踏步', '3 扩胸', , '4 无'],
    objectArray: [{
        id: 0,
        name: '前绕环'
      },
      {
        id: 1,
        name: '跳'
      },
      {
        id: 2,
        name: '踏步'
      },
      {
        id: 3,
        name: '扩胸'
      },
      {
        id: 4,
        name: '无'
      },
      
    ],
    act_index: 0,

  },


  onLoad: function(options) {

    this.innerAudioContext4 = wx.createInnerAudioContext()
    this.innerAudioContext4.src = '/speech/start.wav'

    this.innerAudioContext5 = wx.createInnerAudioContext()
    this.innerAudioContext5.src = '/speech/finish.wav'
  },

  bindPickerGender: function(e) {
    console.log('gender发送选择改变，携带值为', e.detail.value)
    this.setData({
      gender_index: e.detail.value
    })
  },
  bindPickerAct: function(e) {
    console.log('act发送选择改变，携带值为', e.detail.value)
    this.setData({
      act_index: e.detail.value
    })
  },
  bindPickerCol: function (e) {
    console.log('col发送选择改变，携带值为', e.detail.value)
    this.setData({
      col_index: e.detail.value
    })
  },

  bindInputTall: function(e) {
    this.setData({
      inputTall: Number(e.detail.value)
    })
    console.log('inputTime', this.data.inputTall)
  },
  bindInputTime: function(e) {
    this.setData({
      inputTime: Number(e.detail.value),
      timeleft: Number(e.detail.value)
    })
    console.log('inputTime', this.data.inputTime)
  },


  waitstart: function () {
    that = this
    that.innerAudioContext4.play();
    setTimeout(function(){
      console.log('start');
      // that = this
    var i;
      var timestart;
      var timeend;
      let accX = [];
      let accY = [];
      let accZ = [];
      let geoX = [];
      let geoY = [];
      let geoZ = [];
      let timeA = [];
      let timeG = [];

      i = 0;

      wx.startAccelerometer({
        interval: 'game',
        success: function (res) {
          console.log('seccess')
        },
        fail: function (res) {
          console.log('fail')
        }
      })
    wx.startGyroscope({
      interval: 'ui',
      })
    console.log(that.data.inputTime);
      timestart = (new Date()).valueOf()
    timeend = timestart + that.data.inputTime * 1000
    // console.log(timeend);

    wx.onGyroscopeChange(function (res) {

        var now = (new Date()).valueOf()

        if (now >= timeend) {
          wx.offGyroscopeChange()
          wx.stopGyroscope()
          loaded = 0;
          if (i == 0) {
            i = 1;
            wx.vibrateLong();
            console.log('over');
            that.setData({
              left: timeG.length
            })
            that.innerAudioContext5.play();
          }
          that.data.geoX = geoX;
          that.data.geoY = geoY;
          that.data.geoZ = geoZ;
          that.data.timeG = timeG;
          // return
        }

        if (now < timeend) {
          // console.log('g',now)
          timeG.push(now)
          geoX.push(res.x)
          geoY.push(res.y)
          geoZ.push(res.z)
        }

      })



    wx.onAccelerometerChange(function (res) {

        var now = (new Date()).valueOf()

        if (now >= timeend) {
          wx.offAccelerometerChange()
          wx.stopAccelerometer()
          // wx.vibrateShort()
          // console.log('over')

          that.data.accX = accX;
          that.data.accY = accY;
          that.data.accZ = accZ;
          that.data.timeA = timeA;
          // return
        }

        if (now < timeend) {
          // console.log('a',now)
          timeA.push(now)
          accX.push(res.x)
          accY.push(res.y)
          accZ.push(res.z)
        }

      })
    }, 800)
  },


  upload: function() {
    that = this
    var block = 250;
    // var a = that.data.timeA.length;
    // var g = that.data.timeG.length;
    var n = that.data.timeA.length - that.data.timeG.length;
    if (that.data.left > block) {
      // g = block
      console.log('>250')
      wx.showToast({
        title: '数据量较大',
        icon: 'none',

      })
    } else {
      block = that.data.left
    }

    var collection = that.data.collection[that.data.col_index]
    console.log(block)
    console.log(that.data.accX, that.data.timeG)
    console.log(collection)

    let promiseMethod = new Array(block)
    for (var i = 0; i < block; i++) {
      promiseMethod[i] = db.collection(collection).add({
          data: {
            timestamp: that.data.timeG[i + loaded],
            accX: that.data.accX[i + n + loaded],
            accY: that.data.accY[i + n + loaded],
            accZ: that.data.accZ[i + n + loaded],
            geoX: that.data.geoX[i + loaded],
            geoY: that.data.geoY[i + loaded],
            geoZ: that.data.geoZ[i + loaded],
            // sex: Number(that.data.gender_index),
            // height: that.data.inputTall,

            label: Number(that.data.act_index),
          }

        })
        .then(res => {
          // console.log(i)

          wx.showToast({
            title: '上传中',
            icon: 'none',
            duration: 500

          })


        })
        .catch(console.error)

    }
    Promise.all([...promiseMethod]).then(() => {
      loaded = loaded + block;
      that.setData({
        left: that.data.timeG.length - loaded
      })
      wx.showToast({
        title: '上传完成',

      })
    })

  },

  onPullDownRefresh: function() {
    wx.reLaunch({
      url: 'index'
    })
  },
  sample: function () {
    wx.navigateTo({
      url: '/pages/sample/sample',
    })
  }


})