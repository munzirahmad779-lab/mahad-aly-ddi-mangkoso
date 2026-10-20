const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function listR2() {
  console.log('--- SCANNING CLOUDFLARE R2 BUCKET ---');
  try {
    const cmd = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 100,
    });
    const res = await s3.send(cmd);
    console.log(`Found ${res.Contents?.length || 0} objects in R2:`);
    res.Contents?.forEach(obj => {
      console.log(`- Key: ${obj.Key}, Size: ${obj.Size} bytes, LastModified: ${obj.LastModified}`);
    });
  } catch (err) {
    console.error('R2 Error:', err.message);
  }
}

listR2();
