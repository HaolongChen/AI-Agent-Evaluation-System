import OSS from "ali-oss";

export async function getSchemaModelById(schemaId: string) {
  try {
    const client = new OSS({
      region: "oss-cn-shanghai",
      accessKeyId: process.env.ALIYUN_ACCESS_KEY,
      accessKeySecret: process.env.ALIYUN_ACCESS_SECRET,
      bucket: process.env.ALIYUN_OSS_BUCKET,
      authorizationV4: true,
      endpoint: "oss-cn-shanghai.aliyuncs.com",
    });
    // List all buckets in all regions within the current Alibaba Cloud account.
    const result = await client.get(`schema/${schemaId}/model.bin`);
    return result.content;
  } catch (error) {
    console.log(error);
  }
}
