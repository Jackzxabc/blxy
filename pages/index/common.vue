<template>
	<view> 
		<!-- <z-nav-bar backState="2000" title="我的页面"></z-nav-bar> -->
		<view class="nav_list" @click="onPageJump('/pages/user/login')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>登录</text>
		</view>
		<view class="nav_list" @click="onPageJump('/pages/user/register')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>注册</text>
		</view>
		<view class="nav_list" @click="onPageJump('/pages/user/forget')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>修改登录密码</text>
		</view>
		<view class="nav_list" @click="onPageJump('/pages/user/bindPhone')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>绑定手机号</text>
		</view>
		<view class="nav_list" @click="onPageJump('/pages/user/protocol')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>协议</text>
		</view>
		<view class="nav_list" @click="onTokenJump('/pages/template/editInfo')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>个人信息</text>
		</view>
		<view class="nav_list" @click="loginOut">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>退出登录</text>
		</view>
		<!-- <view class="nav_list" @click="onPageJump('/pages/template/poster/goodsPoster')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>商品海报生成</text>
		</view>
		<view class="nav_list" @click="onTokenJump('/pages/template/poster/scanCode')">
			<image src="../../static/demo/icon_case.png" mode="aspectFit"></image>
			<text>推广海报生成</text>
		</view> -->
		<!-- <z-navigation></z-navigation> -->
	</view>
</template>

<script>
	import http from '@/config/requestConfig.js'
	import { mapState, mapMutations } from 'vuex';
export default {
	data() {
		return {};
	},
	computed: {
		...mapState(["userInfo"])
	},
	//第一次加载
	onLoad(e) {
		// 隐藏原生的tabbar
		// uni.hideTabBar();
	},
	//页面显示
	onShow() {
		// 隐藏原生的tabbar
		// uni.hideTabBar();
	},
	//方法
	methods: {
		...mapMutations(['emptyUserInfo']),
		onPageJump(url) {
			uni.navigateTo({
				url: url
			});
		},
		onTokenJump(url) {
			// this.judgeLogin(() => {
				uni.navigateTo({
					url: url
				});
			// });
		},
		loginOut() {
			console.log(this.userInfo)
			if(!this.userInfo.token){
				uni.showToast({
					title: '您已是游客状态',
					icon: 'none'
				});
				return;
			};
			http.post('/sys/logout?token=' + this.userInfo.token).then((res) => {
				if(res.response.data.code === 0) {
					uni.showToast({
						title: '退出成功！',
						icon: 'none'
					});
					this.emptyUserInfo();
				}
			})
		}
	},
	//页面隐藏
	onHide() {},
	//页面卸载
	onUnload() {},
	//页面下来刷新
	onPullDownRefresh() {},
	//页面上拉触底
	onReachBottom() {},
	//用户点击分享
	onShareAppMessage(e) {
		return this.wxShare();
	}
};
</script>
<style lang="scss" scoped>
@import '@/static/css/mixin.scss';
.nav_list {
	background-color: #fff;
	padding: 30upx;
	display: flex;
	align-items: center;
	position: relative;
	margin-bottom: 10upx;
	&:active {
		background-color: #f5f5f5;
	}
	image {
		width: 40upx;
		height: 40upx;
	}
	text {
		font-size: 28upx;
		color: #333;
		margin-left: 30upx;
	}
	&::after {
		content: '';
		position: absolute;
		right: 30upx;
		top: 50%;
		transform: translateY(-50%);
		width: 40upx;
		height: 40upx;
		background-image: url('../../static/demo/icon_right.png');
		background-position: center center;
		background-repeat: no-repeat;
		background-size: cover;
	}
}
</style>
