<!--
  功能：图片视频上传组件
  作者：小莫唐尼
  邮箱：studio@925i.cn
  时间：2021年07月08日
  版本：v1.1.5
  修改时间：2021年09月22日
-->
<template>
	<view class="upload-wrap">
		<view class="preview-wrap">
			<!-- 预览 -->
			<block v-if="usePreview">
				<view class="image" v-for="(item, index) in tempImgArr" :key="item[imgCoverKey]" :style="{ borderRadius: radius + 'rpx' }">
					<u-image
						width="100%"
						height="152rpx"
						:border-radius="radius"
						@click="fnPreviewImage(index, tempImgArr)"
						:lazy-load="true"
						:src="item[imgCoverKey]"
						mode="aspectFill"
					></u-image>
					<u-icon v-if="!disabled" class="delete-icon" name="close" color="#fff" size="24" @click="deleteImageOrVideo(index, true)"></u-icon>
				</view>
				<view
					class="video"
					:class="{ 'no-mask': !item[videoCoverKey] }"
					:style="{ borderRadius: radius + 'rpx', '--radius': radius + 'px' }"
					v-for="(item, index) in tempVideoArr"
					:key="item[videoCoverKey]"
				>
					<block v-if="item[videoCoverKey]">
						<u-image
							width="152rpx"
							height="152rpx"
							:border-radius="radius"
							:lazy-load="false"
							:src="item[videoCoverKey]"
							mode="aspectFill"
							@click="fnPreviewVideo(item)"
						></u-image>
						<view class="video-play"><u-icon class="video-play-icon" name="play-right-fill" color="#fff" size="30" @click="fnPreviewVideo(item)"></u-icon></view>
						<u-icon v-if="!disabled" class="delete-icon" name="close" color="#fff" size="24" @click="deleteImageOrVideo(index, false)"></u-icon>
					</block>
					<block v-else>
						<view class="video-play-cover" :style="{ borderRadius: radius + 'rpx' }" >
							<u-image
								class="video-play-cover-image"
								width="100%"
								height="100%"
								:border-radius="radius"
								:lazy-load="false"
								:src="videoDefaultCover"
								mode="scaleToFill"
								@click="fnPreviewVideo(item)"
							></u-image>
						</view>
						<!-- <text class="video-play"><u-icon class="video-play-icon" name="play-right-fill" color="#fff" size="30" @click="fnPreviewVideo(item)"></u-icon></text> -->
						<u-icon v-if="!disabled" class="delete-icon" name="close" color="#fff" size="24" @click="deleteImageOrVideo(index, false)"></u-icon>
					</block>
				</view>
			</block>
			<!-- 选择 -->
			<block>
				<view class="select-item" :style="{ borderRadius: radius + 'rpx' }" v-if="useImage && imgArr.length < imgLimit" @click="chooseImage">
					<u-icon class="icon" name="camera" color="#999" size="40"></u-icon>
					<view class="text">{{ selectImageText }}</view>
				</view>
				<view class="select-item" :style="{ borderRadius: radius + 'rpx' }" v-if="useVideo && videoArr.length < videoLimit" @click="chooseVideo">
					<text class="icon e-icon-video e-icon e-icon-shipin"></text>
					<view class="text">{{ selectVideoText }}</view>
				</view>
			</block>
		</view>
		<!-- 超出的图片大小展示 -->
		<view class="over-size-wrapper" v-if="showOverLimitTip && !useOverLimitTipModal && overSizeImgArr.length != 0">
			<view class="over-size-wrapper-title">
				<text class="over-size-wrapper-title-tip">以下图片超出限制上传失败，限制为{{ fileUnitConversion(imgSizeLimit, 'KB', 'M') }}M</text>
				<text class="over-size-wrapper-title-clear" @click="fnClearOverSizeArr('image')" :style="{ color: color }">
					<u-icon class="over-size-wrapper-title-clear-icon" name="close" size="20" :color="color"></u-icon>
					关闭提示
				</text>
			</view>
			<view class="over-size-wrapper-list">
				<block v-for="(img, index) in overSizeImgArr" :key="index">
					<view class="over-size-wrapper-list-item">
						<image class="over-size-wrapper-list-item-image" :src="img.url" mode="aspectFill"></image>
						<view class="over-size-wrapper-list-item-name">{{ img.fileName }}</view>
						<view class="over-size-wrapper-list-item-size">{{ img.size }}</view>
					</view>
				</block>
			</view>
		</view>
		<u-popup v-model="isShowOverLimitModal" mode="center" :z-index="9999" border-radius="20">
			<view class="modal-content padding-15">
				<view class="over-size-wrapper in-modal" v-if="showOverLimitTip && overSizeImgArr.length != 0">
					<view class="over-size-wrapper-title">
						<text class="over-size-wrapper-title-tip">以下图片超出限制上传失败，限制为{{ fileUnitConversion(imgSizeLimit, 'KB', 'M') }}M</text>
						<text class="over-size-wrapper-title-clear" @click="fnClearOverSizeArr('image')" :style="{ color: color }">
							<u-icon class="over-size-wrapper-title-clear-icon" name="close" size="20" :color="color"></u-icon>
							关闭提示
						</text>
					</view>
					<view class="over-size-wrapper-list">
						<block v-for="(img, index) in overSizeImgArr" :key="index">
							<view class="over-size-wrapper-list-item">
								<image class="over-size-wrapper-list-item-image" :src="img.url" mode="aspectFill"></image>
								<view class="over-size-wrapper-list-item-name">{{ img.fileName }}</view>
								<view class="over-size-wrapper-list-item-size">{{ img.size }}</view>
							</view>
						</block>
					</view>
				</view>
			</view>
		</u-popup>
		<u-modal
			:show-cancel-button="true"
			:confirm-color="color"
			v-model="uploadFileDeleteModal.show"
			@confirm="uploadFileDeleteConfirm"
			@cancel="uploadFileDeleteModal.show = false"
			:content="uploadFileDeleteModal.tip"
		></u-modal>
		<u-modal z-index="10076" v-model="uploadFileTip.show" title="提示" :confirm-text="cancelText" :confirm-color="cancelColor" @confirm="uploadFileTipDestroy()">
			<view class="slot-content">
				<view class="progress-wrapper">
					<u-line-progress :active-color="color" :striped="true" :striped-active="true" :percent="uploadFileTip.progress"></u-line-progress>
					<view class="progress-tip">文件上传中，请稍等（{{ uploadFileTip.totalBytesSent }}/{{ uploadFileTip.totalBytesExpectedToSend }}M）</view>
				</view>
			</view>
		</u-modal>
	</view>
</template>

<script>
import { getFileSuffix, getFileUnitConversion, previewImages } from './evan-utils.js';
export default {
	name: 'evan-upload',
	props: {
		debug: {
			type: Boolean,
			default: false
		},
		// 主色调
		color: {
			type: String,
			default: '#ddb880'
		},
		radius: {
			type: Number,
			default: 6
		},
		cancelColor: {
			type: String,
			default: '#ddb880'
		},
		cancelText: {
			type: String,
			default: '取消上传'
		},
		selectImageText: {
			type: String,
			default: '选择图片'
		},
		selectVideoText: {
			type: String,
			default: '选择视频'
		},
		/**
		 * 是否自动切换数据配置，用于独立配置的情况
		 * 注意：如果独立使用组件，且单独配置上传地址的情况下，
		 * 	    如 v-if 显示图片选择 或者 视频选择的情况下 需要手动调用 fnChangeOptions()
		 * */
		autoChangeOptions: {
			type: Boolean,
			default: true
		},
		// 文件的扩展名字段，用于（ loadAllPreview）手动初始化默认的数据时候的判断
		fileSuffix: {
			type: String,
			default: 'fileType'
		},
		// 通用上传配置
		options: {
			type: Object,
			default: null
		},
		// 图片上传配置
		imageOptions: {
			type: Object,
			default: null
		},
		// 视频上传配置
		videoOptions: {
			type: Object,
			default: null
		},
		// 数据通用的格式化（默认是响应的格式）
		format: {
			type: Function,
			default: null
		},
		// 图片格式化(默认是响应的格式)
		imgFormat: {
			type: Function,
			default: null
		},
		// 视频格式化(默认是响应的格式)
		videoFormat: {
			type: Function,
			default: null
		},
		// 是否禁用上传
		disabled: {
			type: Boolean,
			default: false
		},
		// 是否显示超出上传大小限制的图片
		showOverLimitTip: {
			type: Boolean,
			default: true
		},
		// 超出限制的使用是否启用弹窗效果
		useOverLimitTipModal: {
			type: Boolean,
			default: false
		},
		// 是否启用预览功能
		usePreview: {
			type: Boolean,
			default: true
		},
		// 是否使用图片上传
		useImage: {
			type: Boolean,
			default: true
		},
		// 是否使用视频上传
		useVideo: {
			type: Boolean,
			default: true
		},
		// 图片过滤
		imgExtension: {
			type: Array,
			default() {
				return ['jpg', 'jpeg', 'png'];
			}
		},
		// 图片的预览的键（默认 thumbnail）
		imgCoverKey: {
			type: String,
			default: 'thumbnail'
		},
		// 图片限制
		imgLimit: {
			type: Number,
			default: 9
		},
		// 图片单张大小限制（默认2048k = 2M）
		imgSizeLimit: {
			type: Number,
			default: 2048
		},
		// 图片压缩配置，默认原图和压缩
		imgSizeType: {
			type: Array,
			default() {
				return ['original', 'compressed'];
			}
		},
		// 图片来源，默认相册和相机
		imgSourceType: {
			type: Array,
			default() {
				return ['album', 'camera'];
			}
		},

		// 视频封面图的key （默认是 thumbnail ）
		videoCoverKey: {
			type: String,
			default: 'thumbnail'
		},
		// 视频限制
		videoLimit: {
			type: Number,
			default: 1
		},
		// 视频大小限制（默认102400kb = 100M）
		videoSizeLimit: {
			type: Number,
			default: 102400
		},
		// 是否启用视频压缩
		useVideoCompressed: {
			type: Boolean,
			default: true
		},
		// 视频来源，默认相册和相机
		videoSourceType: {
			type: Array,
			default() {
				return ['album', 'camera'];
			}
		},

		// 表单模块名称
		moduleName: {
			type: String,
			default: ''
		},
		// 默认预览的图片或者视频
		defaultImageOrVideoList: {
			type: Array,
			default() {
				return [];
			}
		},
		// 默认预览的图片
		defaultImageList: {
			type: Array,
			default() {
				return [];
			}
		},
		// 默认预览的视频
		defaultVideoList: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		return {
			// 文件上传提示
			uploadFileTip: {
				task: null, // 文件上传Task
				show: false, // 是否显示
				totalBytesExpectedToSend: 0,
				totalBytesSent: 0, // 已经上传的数据长度，单位 Bytes
				progress: 0 // 上传进度百分比
			},
			uploadFileDeleteModal: {
				show: false,
				isImage: true,
				tip: ''
			},
			videoDefaultCover:'data:image/png;base64,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',
			Options: { url: '', name: 'file', moduleName: '', header: {}, formData: {} },
			ImageOptions: { url: '', name: 'file', moduleName: '', header: {}, formData: {} },
			VideoOptions: { url: '', name: 'file', moduleName: '', header: {}, formData: {} },
			isShowOverLimitModal: false,
			tempImgArr: [], // 用于展示的图片
			tempVideoArr: [], // 用于展示的视频
			imgArr: [], //图片数组
			videoArr: [], //视频数组
			overSizeImgArr: [], // 超出大小的图片
			overSizeVideoArr: [] // 超出大小的视频
		};
	},
	beforeUpdate() {
		if (this.autoChangeOptions) {
			if (this.useImage && this.useVideo) return;
			// 组件更新之前切换配置
			this.fnChangeOptions();
		}
	},
	mounted() {
		// 在小程序中存在数据无法回显的问题，改为手动触发
		// #ifndef MP-WEIXIN
		this.handleDefaultPrivew();
		// #endif
		// 初始化配置
		this.fnChangeOptions();
	},
	methods: {
		// 配置
		fnChangeOptions() {
			if (this.options) {
				this.ImageOptions = Object.assign({}, this.ImageOptions, this.options);
				this.VideoOptions = Object.assign({}, this.VideoOptions, this.options);
			}
			if (this.imageOptions) {
				this.ImageOptions = Object.assign({}, this.ImageOptions, this.imageOptions);
			}
			if (this.videoOptions) {
				this.VideoOptions = Object.assign({}, this.VideoOptions, this.videoOptions);
			}
		},
		loadAllPreview(list) {
			this.clear();
			if (!list) return;
			list.forEach((item, index) => {
				this.handlePreviewData(item, item[this.fileSuffix] !== 'mp4', true);
			});
		},
		loadImagePreview(list) {
			this.clear();
			if (!list) return;
			list.forEach((item, index) => {
				this.handlePreviewData(item, true);
			});
		},
		loadVideoPreview(list) {
			this.clear();
			if (!list) return;
			list.forEach((item, index) => {
				this.handlePreviewData(item, false);
			});
		},
		chooseImage() {
			if (this.disabled) return;
			if (!this.ImageOptions.url) {
				return uni.showToast({
					icon: 'none',
					title: '未配置上传地址'
				});
			}
			const _this = this;
			this.overSizeImgArr = [];
			uni.chooseImage({
				count: this.imgLimit,
				extension: this.imgExtension,
				crop: this.crop,
				sourceType: this.imgSourceType,
				sizeType: this.imgSizeType, //可以指定是原图还是压缩图，默认二者都有
				success: function(res) {
					uni.showLoading({
						title: '上传中...',
						mask: true
					});
					_this.$emit('on-loading', true);
					for (var i = 0; i < res.tempFilePaths.length; i++) {
						if (_this.fileUnitConversion(res.tempFiles[i].size, 'B', 'KB') > _this.imgSizeLimit) {
							_this.overSizeImgArr.push({
								url: res.tempFilePaths[i],
								fileName: res.tempFiles[i].name,
								size: _this.fileUnitConversion(res.tempFiles[i].size) + 'M'
							});
						} else {
							uni.uploadFile({
								url: _this.ImageOptions.url,
								filePath: res.tempFilePaths[i],
								name: _this.ImageOptions.name,
								header: _this.ImageOptions.header,
								formData: {
									..._this.ImageOptions.formData,
									moduleName: _this.moduleName
								},
								success: uploadFileRes => {
									if (uploadFileRes.statusCode != 200) {
										uni.showToast({
											icon: 'none',
											title: '上传失败，服务器异常！'
										});
										_this.$emit('on-error', uploadFileRes);
									} else {
										_this.handleUploadRes(uploadFileRes, true);
									}
								},
								fail(err) {
									uni.showToast({
										icon: 'none',
										title: '上传出错了'
									});
									_this.debug && console.error(err);
									// uni.hideLoading();
									_this.$emit('on-error', err);
								}
							});
						}
						// 执行回调显示超出限制的图片
						if (i + 1 == res.tempFilePaths.length) {
							if (_this.overSizeImgArr.length == res.tempFilePaths.length) {
								uni.hideLoading();
							}
							_this.fnEmitOverSize();
							_this.$emit('on-success', true);
						}
					}
				}
			});
		},
		chooseVideo() {
			if (this.disabled) return;
			if (!this.VideoOptions.url) {
				return uni.showToast({
					icon: 'none',
					title: '未配置上传地址'
				});
			}
			const _this = this;
			uni.chooseVideo({
				sourceType: this.videoSourceType,
				compressed: this.useVideoCompressed,
				success: function(res) {
					_this.uploadFileTip.show = true;
					// 上传视频
					_this.uploadFileTip.task = uni.uploadFile({
						url: _this.VideoOptions.url,
						filePath: res.tempFilePath,
						name: _this.VideoOptions.name,
						header: _this.VideoOptions.header,
						formData: {
							..._this.VideoOptions.formData,
							moduleName: _this.moduleName
						},
						success: uploadFileRes => {
							if (uploadFileRes.statusCode != 200) {
								uni.showToast({
									icon: 'none',
									title: '上传失败，服务器异常！'
								});
								_this.$emit('on-error', uploadFileRes);
							} else {
								_this.handleUploadRes(uploadFileRes, false);
							}
						},
						fail(err) {
							uni.showToast({
								icon: 'none',
								title: '上传出错了'
							});
							_this.debug && console.error(err);
							_this.uploadFileTipDestroy();
							_this.$emit('on-error', err);
						}
					});
					_this.uploadFileTask();
				}
			});
		},
		// 处理回调的数据
		handleUploadRes(res, isImage = true) {
			uni.hideLoading();
			const _this = this;
			if (res.statusCode != 200) {
				_this.$emit('on-error', res);
				_this.$u.toast(res.msg || '上传失败，请重试！');
				_this.uploadFileTipDestroy();
				return;
			}
			// 后台返回数组的形式
			if (res['code'] != undefined && res.code === 200) {
				if (Object.prototype.toString.call(res.data) === '[object Array]') {
					res.data.forEach(item => {
						_this.handlePreviewData(item, isImage);
					});
					// 后台返回对象形式
				} else if (Object.prototype.toString.call(res.data) === '[object Object]') {
					// 返回对象的形式
					_this.handlePreviewData(res.data, isImage);
				} else {
					// 后台返回直接返回图片
					_this.handleRes(res.data, isImage);
				}
				_this.handleCallback(res);
				// 校验是否有状态码的情况(直接返回图片地址)
			} else if (Object.prototype.toString.call(res.data) == '[object String]') {
				_this.handleRes(res.data, isImage, true);
				_this.handleCallback(res);
			} else {
				_this.$emit('on-error', res);
				_this.$u.toast(res.msg || '上传失败，请重试！');
				_this.uploadFileTipDestroy();
			}
		},
		handleRes(res, isImage, isString = false) {
			const _this = this;
			let _fileNameOrUrl = isString ? res : res.data;
			let _fileSuffix = getFileSuffix(_fileNameOrUrl);
			if (isImage) {
				if (this.imgCoverKey == 'url') {
					_this.handlePreviewData(
						{
							url: _fileNameOrUrl,
							[this.fileSuffix]: _fileSuffix
						},
						true
					);
				} else {
					_this.handlePreviewData(
						{
							[this.imgCoverKey]: _fileNameOrUrl,
							url: _fileNameOrUrl,
							[this.fileSuffix]: _fileSuffix
						},
						true
					);
				}
			} else {
				_this.handlePreviewData(
					{
						url: _fileNameOrUrl,
						[this.fileSuffix]: _fileSuffix
					},
					false
				);
			}
		},
		handleCallback(res) {
			this.sendData();
			this.uploadFileTipDestroy();
			this.$emit('on-success', res);
		},
		uploadFileTask() {
			this.uploadFileTip.task.onProgressUpdate(res => {
				this.uploadFileTip.progress = res.progress;
				this.uploadFileTip.totalBytesSent = this.fileUnitConversion(res.totalBytesSent);
				this.uploadFileTip.totalBytesExpectedToSend = this.fileUnitConversion(res.totalBytesExpectedToSend);
			});
		},
		// 销毁上传任务
		uploadFileTipDestroy() {
			this.uploadFileTip.show = false;
			if (this.uploadFileTip.task) {
				this.uploadFileTip.task.abort(); // 终止上传
			}
			const _setTimeout = setTimeout(() => {
				this.uploadFileTip.task = null;
				this.uploadFileTip.progress = 0;
				this.uploadFileTip.totalBytesSent = 0;
				this.uploadFileTip.totalBytesExpectedToSend = 0;
				clearTimeout(_setTimeout);
			}, 200);
		},
		fileUnitConversion(byte, from = 'B', to = 'M') {
			return getFileUnitConversion(byte, from, to);
		},
		/**
		 * 超出大小限制的图片或者视频
		 * */
		fnEmitOverSize() {
			if (this.showOverLimitTip && this.useOverLimitTipModal && this.overSizeImgArr.length != 0) {
				this.isShowOverLimitModal = true;
			}
			this.$emit('on-over-list', {
				images: this.overSizeImgArr,
				videos: this.overSizeVideoArr
			});
		},
		fnClearOverSizeArr(type) {
			this.isShowOverLimitModal = false;
			if (type == 'image') {
				this.overSizeImgArr = [];
			} else {
				this.overSizeVideoArr = [];
			}
		},
		// 更新文件上传对象字段
		updateFileDataObject(key, val) {
			this.$set(this.uploadFileTip, key, val);
		},
		// 回调发送数据
		sendData() {
			let _data = [],
				_type = 'all';
			if (this.useImage && this.useVideo) {
				// 都使用
				if (this.imgArr.length !== 0) {
					_data.push(...this.imgArr);
				}
				if (this.videoArr.length !== 0) {
					_data.push(...this.videoArr);
				}
				_type = 'all';
			} else if (this.useImage) {
				// 使用图片
				if (this.imgArr.length !== 0) {
					_data.push(...this.imgArr);
				}
				_type = 'image';
			} else if (this.useVideo) {
				if (this.videoArr.length !== 0) {
					_data.push(...this.videoArr);
				}
				_type = 'video';
			}
			this.$emit('on-upload', {
				type: _type,
				data: _data
			});
		},
		// 图片预览
		fnPreviewImage(current, images) {
			previewImages(current, images);
		},
		// 删除图片或视频
		deleteImageOrVideo(index, isImage = true) {
			this.uploadFileDeleteModal.tip = `您确定要删除该${isImage ? '图片' : '视频'}吗？`;
			this.uploadFileDeleteModal.show = true;
			this.uploadFileDeleteModal.isImage = isImage;
			this.uploadFileDeleteModal.index = index;
		},
		// 确认删除
		uploadFileDeleteConfirm() {
			let index = this.uploadFileDeleteModal.index;
			if (this.uploadFileDeleteModal.isImage) {
				this.tempImgArr.splice(index, 1);
				this.imgArr.splice(index, 1);
			} else {
				this.tempVideoArr.splice(index, 1);
				this.videoArr.splice(index, 1);
			}
			this.sendData();
		},
		// 处理图片数据
		handlePushImage(dataItem) {
			// 支持自定义格式化
			if (this.imgFormat && typeof this.imgFormat === 'function') {
				this.imgArr.push(this.imgFormat(dataItem));
				this.tempImgArr.push(this.imgFormat(dataItem));
			} else if (this.format && typeof this.format === 'function') {
				this.imgArr.push(this.format(dataItem));
				this.tempImgArr.push(this.format(dataItem));
			} else {
				this.imgArr.push(dataItem);
				this.tempImgArr.push(dataItem);
			}
		},
		// 处理视频数据
		handlePushVideo(dataItem) {
			if (this.videoFormat && typeof this.videoFormat === 'function') {
				this.videoArr.push(this.videoFormat(dataItem));
				this.tempVideoArr.push(this.videoFormat(dataItem));
			} else if (this.format && typeof this.format === 'function') {
				this.videoArr.push(this.format(dataItem));
				this.tempVideoArr.push(this.format(dataItem));
			} else {
				this.videoArr.push(dataItem);
				this.tempVideoArr.push(dataItem);
			}
		},
		handlePreviewData(dataItem, isImage = true, isAll = false) {
			if (isAll) {
				if (isImage) {
					this.handlePushImage(dataItem);
				} else {
					this.handlePushVideo(dataItem);
				}
				return;
			}
			if (isImage) {
				this.handlePushImage(dataItem);
			} else {
				this.handlePushVideo(dataItem);
			}
		},
		/**
		 * 	处理传入的文件
		 * 注意：传入的文件名称 的key是 name 而不是fileName
		 * */
		handleDefaultPrivew() {
			this.clear();
			if (this.useImage && this.useVideo) {
				// 都使用
				this.defaultImageOrVideoList.forEach((item, index) => {
					this.handlePreviewData(item, item[this.fileSuffix] !== 'mp4', true);
				});
			} else if (this.useImage) {
				this.defaultImageList.forEach((item, index) => {
					this.handlePreviewData(item, true);
				});
			} else {
				this.defaultVideoList.forEach((item, index) => {
					this.handlePreviewData(item, false);
				});
			}
			// #ifndef MP-WEIXIN
			this.$forceUpdate();
			// #endif
		},
		// 预览视频
		fnPreviewVideo(video) {
			this.$emit('on-pre-video', video);
		},
		// 重置相关变量
		clear() {
			this.tempImgArr = [];
			this.tempVideoArr = [];
			this.imgArr = [];
			this.videoArr = [];
			this.overSizeImgArr = [];
			this.overSizeVideoArr = [];
		}
	}
};
</script>

<style lang="scss" scoped>
@import './evan-iconfont.css';
.upload-wrap {
	display: flex;
	flex-wrap: wrap;
}
.progress-wrapper {
	padding: 30rpx;
	padding-bottom: 16rpx;
}
.progress-tip {
	font-size: 28rpx;
	text-align: center;
}
.preview-wrap {
	display: inline-flex;
	flex-wrap: wrap;
	.image,
	.video {
		position: relative;
		margin: 8rpx;
		box-sizing: border-box;
		width: 156rpx;
		height: 152rpx;
		video {
			width: 100%;
			height: 100%;
		}

		.cover {
			position: relative;
			width: 100%;
			height: 100%;
			// background-color: #000000;
			display: flex;
			flex-direction: column;
			align-items: center;
			border-radius: 6rpx;
			.icon {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				z-index: 10;
				box-sizing: border-box;
				background-color: #fa3534;
				border-radius: 100%;
				width: 36rpx;
				height: 36rpx;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
			}

			.play-icon {
				box-sizing: border-box;
				color: #ffffff;
				font-size: 60rpx;
				padding-top: 20rpx;
			}
			.play-text {
				margin-top: -20rpx;
				color: #ffffff;
				font-size: 24rpx;
			}
		}
	}
	.image {
		width: 156rpx;
	}
	.video {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		&.no-mask {
			&::after {
				display: none;
			}
		}
		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			border-radius: var(--radius);
			background-color: rgba(0, 0, 0, 0.3);
		}
		.video-play {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 50rpx;
			height: 50rpx;
			border-radius: 50%;
			border: 4rpx solid #fff;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 2;
			&-icon {
			}
		}
		.video-play-cover {
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			padding: 12rpx 0;
			border: 2rpx solid #eee;
			background-color: #f2f2f2;
			&-image {
				width: 100%;
				height: 100%;
				z-index: 2;
			}
		}
		.video-play-cover-icon {
			display: inline-block;
			width: 100%;
			height: 100%;
			text-align: center;
			line-height: 120rpx;
			font-size: 110rpx;
			border: 2rpx solid #eee;
			background-color: #f2f2f2;
		}
		.video-play-name {
			width: 150rpx;
			position: absolute;
			bottom: 10rpx;
			font-size: 24rpx;
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.delete-icon {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		z-index: 10;
		box-sizing: border-box;
		background-color: #fa3534;
		border-radius: 100%;
		width: 36rpx;
		height: 36rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
	.delete-cover {
		width: 160rpx;
		height: 152rpx;
		position: relative;
		background-color: transparent;
		z-index: 2;
		.icon {
			position: absolute;
			top: 10rpx;
			right: 10rpx;
			z-index: 10;
			box-sizing: border-box;
			background-color: #fa3534;
			border-radius: 100%;
			width: 44rpx;
			height: 44rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
		}
	}
}
.select-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	align-content: center;
	justify-content: center;
	justify-items: center;
	box-sizing: border-box;
	border: 2rpx dashed #dadada;
	margin: 8rpx;
	width: 156rpx;
	height: 152rpx;
	border-radius: 6rpx;
	.icon {
		margin-top: 16rpx;
		z-index: 3;
	}
	.e-icon-video {
		color: #999 !important;
		font-size: 40rpx;
		margin-top: 14rpx;
	}
	.text {
		color: #999;
		font-size: 24rpx;
	}
}
.over-size-wrapper {
	box-sizing: border-box;
	margin: 8rpx;
	padding: 10rpx;
	width: 100%;
	border-radius: 6rpx;
	border: 2rpx dashed #ddb880;
	&.in-modal {
		margin: 0;
	}
	&-title {
		display: flex;
		margin-bottom: 10rpx;
		color: red;
		font-size: 24rpx;
		&-tip {
			flex-grow: 1;
		}
		&-clear {
			width: 150rpx;
			text-align: right;
			font-size: 24rpx;
			color: #ddb880;
			&-icon {
			}
		}
	}
	&-list {
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		&-item {
			position: relative;
			width: 25%;
			padding: 6rpx;
			&-image {
				width: 100%;
				height: 130rpx;
			}
			&-name {
				text-align: center;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				font-size: 24rpx;
			}
			&-size {
				position: absolute;
				top: 105rpx;
				right: 6rpx;
				left: 6rpx;
				text-align: center;
				padding-right: 10rpx;
				font-size: 24rpx;
				background: #d6c09fa8;
				color: #fff;
			}
		}
	}
}
</style>
