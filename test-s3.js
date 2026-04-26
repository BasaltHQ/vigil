
require('dotenv').config({ path: '.env.local' });
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function test() {
  try {
    const s3 = new S3Client({
      region: process.env.S3_REGION || 'us-west-or',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });

    const res = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME || 'basaltvigil',
      Prefix: 'data-room/brand-assets/'
    }));
    
    const items = res.Contents || [];
    items.sort((a, b) => b.LastModified - a.LastModified);
    
    if (items.length > 0) {
      const latest = items[0];
      const url = process.env.S3_ENDPOINT.replace(/\/$/, '') + '/' + process.env.S3_BUCKET_NAME + '/' + latest.Key;
      console.log('Latest file:', url);
      
      const fetchRes = await fetch(url);
      console.log('Public fetch status:', fetchRes.status);
      console.log('Headers:', fetchRes.headers.get('content-type'));
    } else {
      console.log('No brand assets found in S3 bucket!');
    }
  } catch(e) {
    console.error(e);
  }
}
test();

