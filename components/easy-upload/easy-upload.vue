<template>
	<view>
			<view class="upload">
				<block v-for="(upload,index) in uploads" :key="index">
					<view class="uplode-file">
						<image v-if="types == 'image'" class="uploade-img" :src="upload" :data-src="upload" @tap="previewImage"></image>
						<image v-if="types == 'image'" class="clear-one-icon" :src="clearIcon" @tap="delImage(index)"></image>
						<video v-if="types == 'video'" class="uploade-img" :src="upload" controls>
							<cover-image v-if="types == 'video'" class="clear-one-icon" :src="clearIcon" @tap="delImage(index)"></cover-image>
						</video>
					</view>
				</block>
				<view v-if="uploads.length < uploadCount" :class="uploadIcon ? 'uploader-icon' : 'uploader-input-box'">
					<view v-if="!uploadIcon" class="uploader-input" @tap="chooseUploads"></view>
					<image v-else class="image-cion" :src="uploadIcon" @tap="chooseUploads"></image>
				</view>
			
		</view>	
		<button class="add-btn" type="primary" @tap="unifiedUpload">上传</button>
	</view>
</template>

<script>
	export default{
		props: {
			types: {
				type: String,
				default: 'image'
			},
			dataList: {
				type: Array,
				default: function() {
					return []
				}
			},
			clearIcon: {
				type: String,
				default: 'http://img1.imgtn.bdimg.com/it/u=451604666,2295832001&fm=26&gp=0.jpg'
			},
			uploadIcon: {
				type: String,
				default: ''
			},
			uploadUrl: {
				type: String,
				default: ''
			},
			deleteUrl: {
				type: String,
				default: ''
			},
			uploadCount: {
				type: Number,
				default: 1
			},
			//上传图片大小 默认3M
			upload_max: {
				type: Number,
				default: 10
			},
			autoUpload: {
				type: Boolean,
				default: false
			},
			formData: {
				type: Object,
				default: () => {
					return {}
				}
			}
		},
		data(){
			return {
				//上传的图片地址
				uploadImages: [],
				//展示的图片地址
				uploads: [],
				// 超出限制数组
				exceeded_list: [],
			}
		},
		watch:{
			dataList:{
				handler(val){
					this.uploads = val;
				},
				immediate: true
			}
		},
		methods:{
			previewImage (e) {
				var current = e.target.dataset.src
				uni.previewImage({
					current: current,
					urls: this.dataList
				})
			},
			chooseUploads(){
				switch (this.types){
					case 'image': 
						uni.chooseImage({
							count: this.uploadCount - this.uploads.length, //默认9
							sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
							sourceType: ['album', 'camera'], //从相册选择
							success: (res) => {
								for(let i = 0; i< res.tempFiles.length; i++){
									if(Math.ceil(res.tempFiles[i].size / 1024) < this.upload_max * 1024){
										this.uploads.push(res.tempFiles[i].path)
										if(this.autoUpload){
											this.uploadFile(res.tempFiles[i].path)
										}else{
											this.uploadImages.push(res.tempFiles[i].path);
										}
									}else {
										this.exceeded_list.push(i === 0 ? 1 : i + 1);
										uni.showModal({
											title: '提示',
											content: `第${[...new Set(this.exceeded_list)].join(',')}张图片超出限制${this.upload_max}MB,已过滤`
										});
									}
								}
							}
						});
					break;
					case 'video' :
						uni.chooseVideo({
							sourceType: ['camera', 'album'],
							success: (res) => {
								console.log(res)
								this.uploads.push(res.tempFilePath)
							}
						});
					break;
				}
			},
			delImage(index){
				//第一个是判断app或者h5的 第二个是判断小程序的
				if(this.uploads[index].substring(0,4) !== 'http' || this.uploads[index].substring(0,11) == 'http://tmp/'){
					this.uploads.splice(index,1)
					return;
				};
				if(!this.deleteUrl) {
					uni.showModal({
						content: '请填写删除接口'
					});
					return;
				};
				uni.request({
					url: this.deleteUrl,
					method: 'DELETE',
					data: {
						image: this.dataList[index]
					},
					success: res => {
						if(res.data.status == 1) {
							uni.showToast({
								title: '删除成功'
							})
							this.uploads.splice(index,1)
						}
					},
				});
			},
			uploadFile(path){
				uni.showLoading({
					title: '上传中...',
					mask: true
				});
				let url = `${this.uploadUrl}/${this.formData.tag}/${this.formData.videoDesc}/?token=${this.$store.state.userInfo.token}`
				uni.uploadFile({
					url, //仅为示例，非真实的接口地址
					filePath: path,
					name: 'multipartFile',
					success: (uploadFileRes) => {
						uni.hideLoading()
						this.$emit('successVideo',uploadFileRes)
					},
					fail:(err) => {
						uni.hideLoading()
						uni.showToast({
							title: JSON.stringify(err),
							icon: 'none'
						});
					}
				});
			},
			unifiedUpload(){
				if(!this.uploadUrl) {
					uni.showModal({
						content: '请填写上传接口'
					});
					return;
				};
				if(!this.formData.videoDesc) {
					uni.showToast({
						title: '请描述一下视频吧',
						icon: 'none'
					});
					return;
				}
				if(this.uploads.length == 0) {
					uni.showToast({
						title: '请选择上传视频',
						icon: 'none'
					});
					return;
				};
				for (let i of this.uploads) {
					this.uploadFile(i)	
				}
			}
		}
	}
</script>

<style scoped>
	.upload {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		flex-wrap: wrap;
	}
	.uplode-file {
		margin: 10upx;
		width: 210upx;
		height: 210upx;
		position: relative;
	}
	.uploade-img {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		width: 210upx;
		height: 210upx;
	}
	.clear-one{
		position: absolute;
		top: -10rpx;
		right: 0;
	}
	.clear-one-icon{
		position: absolute;
		width: 20px;
		height: 20px;
		top: 0;
		right: 0;
		z-index: 9;
	}
	.uploader-input-box {
		position: relative;
		margin:10upx;
		width: 208upx;
		height: 208upx;
		border: 2upx solid #D9D9D9;
	}
	.uploader-input-box:before,
	.uploader-input-box:after {
		/* #ifndef APP-NVUE */
		content: " ";
		/* #endif */
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #D9D9D9;
	}
	.uploader-input-box:before {
		width: 4upx;
		height: 79upx;
	}
	.uploader-input-box:after {
		width: 79upx;
		height: 4upx;
	}
	.uploader-input-box:active {
		border-color: #999999;
	}
	.uploader-input-box:active:before,
	.uploader-input-box:active:after {
		background-color: #999999;
	}
	.uploader-input {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}
	.uploader-icon{
		position: relative;
		margin:10upx;
		width: 208upx;
		height: 208upx;
	}
	.image-cion{
		width: 100%;
		height: 100%;
	}
	.add-btn {
		margin: 0 10rpx;
		background-color: #ec706b;
	}
</style>
