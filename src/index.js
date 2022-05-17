import utils from "util";
import { exec } from "child_process";
import fs from "fs";
import AWS from "aws-sdk";

function execute(command) {
  return utils.promisify(exec)(command);
}

function uploadToS3(fileName) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  });
  console.log(process.cwd());
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket: process.env.MY_AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
  };
  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
    }
    console.log(`${fileName} uploaded to ${data.Location}`);
  });
}

export const onPreBuild = async function ({ constants: { PUBLISH_DIR } }) {
  const tarName = `${process.env.COMMIT_REF}.tgz`;
  await execute(`tar czf ${tarName} ${PUBLISH_DIR}`);
  uploadToS3(tarName);
};
