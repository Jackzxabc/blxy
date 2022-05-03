<template>
    <view class="burst-wrap">
		<view class="textarea-wrap">
			<textarea class="textarea" v-model="videoDesc" placeholder="请输入视频描述" />
		</view>
		<view class="list">
			<picker 
				class="list-picker" 
				:value="tagsActive" 
				:range="tags"
				range-key="name"
				@change="pickerChange"
			>
				<view class="picker-view">
					<view class="title">
						选择标签
					</view>
					<view class="picker">
						<text>{{tags[tagsActive].name}}</text>
						<image class="icon" src="/static/icon/icon_xiajiantou.png"></image>
					</view>
				</view>
			</picker>
		</view>
		<easy-upload
			:dataList="dataList" 
			:uploadUrl="uploadUrl" 
			:deleteUrl='uploadUrl' 
			:types="types"
			:formData="formData"
			@successImage="successImage" 
			@successVideo="successvideo"
		/>
			
			
        <view class="burst-wrap-bg">
            <view>
                <!-- 信息提交 -->
                <view class="burst-info">
                    <view class="uni-uploader-body">
                        <view class="uni-uploader__files">
                            <!-- 图片 -->
                           <block v-for="(image,index) in imageList" :key="index">
                                <view class="uni-uploader__file">
                                    <view class="icon iconfont icon-cuo" @tap="delect(index)"></view>
                                    <image class="uni-uploader__img" :src="image" :data-src="image" @tap="previewImage"></image>
                                </view>
                            </block>
                            <!-- 视频 --> 
                            <view class="uni-uploader__file" v-if="src">
                                <view class="uploader_video">
                                    <view class="icon iconfont icon-cuo" @tap="delectVideo"></view>
                                    <video :src="src" class="video"></video>
                                </view>
                            </view>
                            <view class="uni-uploader__input-box" v-if="VideoOfImagesShow">
                                <view class="uni-uploader__input" @tap="chooseVideoImage"></view>
                            </view>
                        </view>
                    </view>


                </view>
            </view>
        </view>
    </view>
</template>

<script>
    var sourceType = [
            ['camera'],
            ['album'],
            ['camera', 'album']
        ]
	import easyUpload from '@/components/easy-upload/easy-upload.vue'
	import baseUrl from '@/config/baseUrl.js'
    export default {
		components:{
		            easyUpload
		        },
		props: {
			videoUrl: {
				default: function() {
					return {}
				}
			}
			},
        data() {
            return {
				tags: [
					{
						name: '推荐',
						id: 'tuijian'
					},
					{
						name: '学生',
						id: 'xuesheng'
					},
					{
						name: '自由职业',
						id: 'ziyouzhiye'
					},
					{
						name: '创业',
						id: 'chuangye'
					},
					{
						name: '技术',
						id: 'jishu'
					},
					{
						name: '设计',
						id: 'sheji'
					},
					{
						name: '运营',
						id: 'yunying'
					},
					{
						name: '产品',
						id: 'chanpin'
					},
				],
				tagsActive: 0,
				videoDesc: '',
				dataList: [],
				types: 'video',
				// types: 'image',
								
                imageList:[],//图片
                src:"",//视频存放
                sourceTypeIndex: 2,
                checkedValue:true,
                checkedIndex:0,
                sourceType: ['拍摄', '相册', '拍摄或相册'],
                cameraList: [{
                        value: 'back',
                        name: '后置摄像头',
                        checked: 'true'
                    },
                    {
                        value: 'front',
                        name: '前置摄像头'
                    },
                ],
                cameraIndex: 0,
                VideoOfImagesShow:true,
				videoUrlInfo: {},
            }
        },
		computed: {
			uploadUrl() {
				return baseUrl.baseUrl + '/video/add'
			},
			formData() {
				return {
					tag: this.tags[this.tagsActive].name,
					videoDesc: this.videoDesc
				}
			}
		},
        onUnload() {
            this.src = '',
            this.sourceTypeIndex = 2,
            this.sourceType = ['拍摄', '相册', '拍摄或相册'];
        },
		onLoad() {
		},
        methods: {
			pickerChange(e) {
				this.tagsActive = e.detail.value
			},
			successImage(){
				console.log("图片上传成功！！！")
			},
			successvideo(res){
				uni.showToast({
					title: '视频上传成功',
					icon: 'success'
				});
				console.log(res)
				this.videoUrlInfo = res.data;
				this.dataList = [];
				this.videoDesc = '';
				uni.$emit('subscribe/video', {tag: this.tags[this.tagsActive]})
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
            chooseVideoImage(){
                uni.showActionSheet({
                    title:"选择上传类型",
                    itemList: ['图片','视频'],
                    success: (res) => {
                        console.log(res)
                        if(res.tapIndex == 0){
                            this.chooseImages()
                        } else {
                            this.chooseVideo()
                        }
                    }
                })
            },
            chooseImages(){
                // 上传图片
                uni.chooseImage({
                    count: 4, //默认9
                    // sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album','camera'], //从相册选择
                    success:(res)=> {
                        let igmFile = res.tempFilePaths;
                        uni.uploadFile({
                            url:this.config.fileUrl,
                            method:"POST",
                            header:{
                                'Authorization':'bearer '+ uni.getStorageSync('token'),
                                'Content-Type':'multipart/form-data'
                            },
                            filePath:igmFile[0],
                            name:'file',
                            success: (res) =>{
                                // let imgUrls = JSON.parse(res.data); //微信和头条支持
                                let imgUrls = res.data //百度支持
                                this.imagesUrlPath = this.imagesUrlPath.concat(imgUrls.result.filePath);
                                this.imageList = this.imageList.concat(imgUrls.result.filePath); //微信
                                if(this.imageList.length>=4) {
                                    this.VideoOfImagesShow = false;
                                } else {
                                    this.VideoOfImagesShow = true;
                                }
                            }
                        })
                        // this.imageList = this.imageList.concat(res.tempFilePaths)  //头条
                    },
                });
            },
            chooseVideo(){
                // 上传视频
                uni.chooseVideo({
                    maxDuration:60,
                    count: 1,
                    camera: this.cameraList[this.cameraIndex].value,
                    sourceType: ['album'],
                    success: (responent) => {
                        let videoFile = responent.tempFilePath;
                        uni.uploadFile({
                            url:this.config.fileUrl,
                            method:"POST",
                            header:{
                                'Authorization':'bearer '+ uni.getStorageSync('token')
                            },
                            filePath:videoFile,
                            name:'file',
                            success: (res) => {                    
                                // let videoUrls = JSON.parse(res.data) //微信和头条支持
                                let videoUrls = res.data //百度支持
                                this.imagesUrlPath = this.imagesUrlPath.concat(videoUrls.result.filePath);
                                this.src = videoUrls.result.filePath; //微信
                                if(this.src) {
                                    this.itemList = ['图片']
                                } else {
                                    this.itemList = ['图片','视频']
                                }
                                
                            }
                        })
                        // this.src = responent.tempFilePath;  //头条
                    }
                })
            },
            previewImage: function(e) {
                //预览图片
                var current = e.target.dataset.src
                uni.previewImage({
                    current: current,
                    urls: this.imageList
                })
            },
            delect(index){
                uni.showModal({
                    title: "提示",
                    content: "是否要删除该图片",
                    success: (res) => {
                        if (res.confirm) {
                            this.imageList.splice(index, 1)
                        }
                    }
                })
            },
            delectVideo(){
                uni.showModal({
                    title:"提示",
                    content:"是否要删除此视频",
                    success:(res) =>{
                        if(res.confirm){
                            this.src = ''
                        }
                    }
                })
            }
        }
    }
</script>

<style>
.burst-wrap{
    width: 100%;
    height: 100%;
}
.burst-wrap .burst-wrap-bg{
    position: relative;
    /* width: 100%;
    height: 320upx;
    background:linear-gradient(90deg,rgba(251,91,80,1) 0%,rgba(240,45,51,1) 100%);
    border-bottom-right-radius: 80upx;
    border-bottom-left-radius: 80upx; */
}
.burst-wrap .burst-wrap-bg>view{
    width: 90%;
    height: 100%;
    margin: 0 auto;
    position: absolute;
    top: 65upx;
    left: 0;
    right: 0;
}
.textarea-wrap {
	width: 100%;
	padding: 10rpx;
	height: 240rpx;
	box-sizing: border-box;
}
.textarea-wrap .textarea{
	width: 100%;
	height: 100%;
	font-size: 28rpx;
}
.list {
	padding: 0 10rpx ;
	font-size: 28rpx;
}
.list-picker .picker-view {
	width: 100%;
	height: 72rpx;
	display: flex;
	align-items: center;
}
.list-picker .picker-view .picker{
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex: 1;
}
.list-picker .picker-view .picker .icon{
	width: 24rpx;
	height: 16rpx;
	margin-left: 16rpx;
}

.form-item{
    width: 100%;
}
.form-item textarea{
    display: block;
    height: 220upx;
    width: 100%;
    color: #AAAAAA;
    font-size: 28upx;
}
.uni-uploader__file,.uploader_video{
    position: relative;
    z-index: 1;
    width: 200upx;
    height: 200upx;
}
.uni-uploader__img {
    width: 200upx;
    height: 200upx;
}
.icon-cuo {
    position: absolute;
    right: 0;
    top: 5upx;
    background: linear-gradient(90deg,rgba(251,91,80,1) 0%,rgba(240,45,51,1) 100%);
    color: #FFFFFF;
    z-index: 999;
    border-top-right-radius: 20upx;
    border-bottom-left-radius: 20upx;
}
.video{
    width: 100%;
    height: 100%;
}

.login-input-box{
    position: relative;
    border-bottom: 1upx solid #EEEEEE;
}
.login-input-box .forget,.login-input-box .phone{
    position: absolute;
    top: 0;
    height: 100%;
    z-index: 100;
}
.login-input-box .phone{
    width: 100upx;
    left: 0;
    color: #666666;
    font-weight: bold;
}
.login-input-box .phone-input{
    padding-left: 100upx;
}
.address-wrap,.open-info{
    margin-top: 20upx;
}
.open-info>view:last-child{
    font-size: 28upx;
    color: #999999;
}
.address-wrap .address {
    background: #F2F2F2;
    border-radius: 40upx;
    padding: 0 20upx;
}
.user-set-btn{
    margin: 40upx;
    background: linear-gradient(90deg,rgba(251,91,80,1) 0%,rgba(240,45,51,1) 100%);
    color: #FFFFFF;
    text-align: center;
    height: 88upx;
    line-height: 88upx;
}
</style>