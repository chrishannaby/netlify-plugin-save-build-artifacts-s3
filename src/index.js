import utils from 'util'
import { execSync } from 'child_process'
import fs from 'fs'
import AWS from 'aws-sdk'

async function uploadToS3(fileName) {
  console.log(`Uploading ${fileName} to S3`)
  const s3 = new AWS.S3({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
  })
  console.log(process.cwd())
  const fileContent = fs.readFileSync(fileName)
  const params = {
    Bucket: process.env.MY_AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
  }
  s3.putObject(params, (err, data) => {
    if (err) {
      console.error(err)
    }
    console.log(`${fileName} uploaded to ${data.Location}`)
  })
}

export const onSuccess = async function ({ constants: { PUBLISH_DIR } }) {
  const tarName = `${process.env.COMMIT_REF}.tgz`
  execSync(`tar vczf ${tarName} ${PUBLISH_DIR}`, {
    stdio: 'inherit',
  })
  uploadToS3(tarName)
}
