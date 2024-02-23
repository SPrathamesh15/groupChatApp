const AWS = require('aws-sdk')
const dotenv = require('dotenv')
dotenv.config()

exports.uploadToS3 = async (fileData, fileName) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    const s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    });

    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: fileData,
            ACL: 'public-read'
        };

        const s3response = await s3bucket.upload(params).promise();
        console.log('File uploaded successfully:', s3response.Location);
        return s3response.Location;
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        throw err;
    }
};

