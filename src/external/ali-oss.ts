import OSS from "ali-oss";
import {
	ALIYUN_ACCESS_KEY,
	ALIYUN_ACCESS_SECRET,
	ALIYUN_OSS_BUCKET,
} from "../config/env.ts";

export const client = new OSS({
	region: "oss-cn-shanghai",
	accessKeyId: ALIYUN_ACCESS_KEY,
	accessKeySecret: ALIYUN_ACCESS_SECRET,
	bucket: ALIYUN_OSS_BUCKET,
	authorizationV4: true,
	endpoint: "oss-cn-shanghai.aliyuncs.com",
});

export async function getSchemaModel(schemaId: string) {
	try {
		// List all buckets in all regions within the current Alibaba Cloud account.
		const result = await client.get(`schema/${schemaId}/model.bin`);
    return result.content;
	} catch (err) {
		console.log(err);
	}
}