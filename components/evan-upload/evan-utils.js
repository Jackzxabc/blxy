/**
 * 获取文件扩展名
 */
export function getFileSuffix(str) {
	if (str) return str.substring(str.lastIndexOf('.') + 1, str.length)
	return ''
}

/**
 * 文件大小单位转换
 * from:原数据
 *  to :类型 M kb b
 * */
export function getFileUnitConversion(byte, from = 'B', to = 'M') {
	from = from
		.toString()
		.toUpperCase()
		.trim();
	to = to
		.toString()
		.toUpperCase()
		.trim();
	switch (to) {
		case 'M':
			if (from == 'B') return (byte / Math.pow(1024, 2)).toFixed(2);
			if (from == 'KB') return (byte / 1024).toFixed(2);
			return (0).toFixed(2);
		case 'KB':
			if (from == 'M') return (byte * 1024).toFixed(2);
			if (from == 'B') return (byte / 1024).toFixed(2);
			return (0).toFixed(2);
		case 'B':
			if (from == 'M') return (byte * Math.pow(1024, 2)).toFixed(2);
			if (from == 'KB') return (byte * 1024).toFixed(2);
			return (0).toFixed(2);
		default:
			return (0).toFixed(2);
	}
};

/**
 *   图片预览
 * @param {Number} current = [value]  索引
 * @param {Array} images = [value]  图片数组
 * @param {String} oUrlKey = [value]  图片的原图地址Key
 */
export function previewImages(current, images, oUrlKey = 'url') {
	const urls = images.map(it => {
		return it[oUrlKey];
	});
	uni.previewImage({
		current,
		urls,
		loop: true,
		indicator: 'number',
		longPressActions: {
			itemList: ['保存图片'],
			success: res => {
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: res => {
						console.log('图片保存成功');
					}
				});
			}
		}
	});
}
