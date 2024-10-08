import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import uniqid from "uniqid";

export async function POST(req) {
    const formData = await req.formData();
    if (formData.has('file')) {
        const file = formData.get('file');

        const s3Client = new S3Client({
            region: 'ap-southeast-2',
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
                secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
            },
        });
        
        const randomId = uniqid();
        const ext = file.name.split('.').pop();
        const newFilename = randomId + '.' + ext;
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;

        const chunks = [];
        for await (const chunk of file.stream()) {
            chunks.push(chunk);
        }

        // Define the folder path
        const folderPath = 'projects/images';
        const s3Key = `${folderPath}/${newFilename}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            ACL: 'public-read',
            Body: Buffer.concat(chunks),
            ContentType: file.type,
        }));

        const link = `https://${bucketName}.s3.amazonaws.com/${s3Key}`;
        return Response.json(link);
    }
}
