import { execSync } from 'child_process'
import fs from 'fs'
import AWS from 'aws-sdk'

async function uploadToS3(fileName) {
  console.log(`Uploading ${fileName} to S3`)
  const s3 = new AWS.S3({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
    apiVersion: '2006-03-01',
  })
  const fileStream = fs.createReadStream(fileName)
  fileStream.on('error', function (err) {
    console.log('File Error', err)
  })
  const params = {
    Bucket: process.env.MY_AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
  }
  const data = await s3.upload(params).promise()
  console.log(`${fileName} uploaded to ${data.Location}`)
}

export const onSuccess = async function ({ constants: { PUBLISH_DIR } }) {
  const tarName = `${process.env.COMMIT_REF}.tgz`
  execSync(`tar vczf ${tarName} ${PUBLISH_DIR}`, {
    stdio: 'inherit',
  })
  await uploadToS3(tarName)
}
