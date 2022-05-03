<template>
	<video 
		id='video' 
		class="video" 
		:src="videoSrc" 
		:title="videoDesc"
		@fullscreenchange="fullChange"
		@ended="videoEnd"
	/>
</template>

<script>
	export default {
		data() {
			return {
				videoContext: null,
				videoSrc: '',
				videoDesc: ''
			}
		},
		methods: {
			fullChange(e) {
				if(!e.detail.fullScreen) {
					this.videoContext.pause();
				}
			},
			videoEnd(e) {
				this.videoContext.seek(0);
				this.videoContext.play();
			},
			play({ url, title }) {
				this.videoSrc = url;
				this.videoDesc = title;
				this.$nextTick(function(){
					this.videoContext.requestFullScreen({
						direction: 0
					});
					this.videoContext.seek(0)
					this.videoContext.play();
				})
			}
		},
		mounted() {
			this.videoContext = uni.createVideoContext('video',this);
		}
	}
</script>

<style scoped>
	.video {
		position: fixed;
		bottom: -1000px;
		width: 750rpx;
		height: 450rpx;
	}
</style>
