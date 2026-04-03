import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TRPCError } from '@trpc/server';
import { ConfigProvider } from '@src/config';

const ALLOWED_PREFIXES = ['post/', 'profile/'];
const PRESIGNED_URL_EXPIRES_IN = 300; // 5분

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cdnUrl: string;

  constructor() {
    this.s3Client = new S3Client({ region: ConfigProvider.s3.region });
    this.bucket = ConfigProvider.s3.bucket;
    this.cdnUrl = ConfigProvider.s3.cdnUrl;
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string
  ): Promise<{ presignedUrl: string; cdnUrl: string }> {
    this.validateKey(key);
    this.validateContentType(contentType);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });

    return {
      presignedUrl,
      cdnUrl: `${this.cdnUrl}/${key}`,
    };
  }

  private validateKey(key: string): void {
    const hasValidPrefix = ALLOWED_PREFIXES.some(prefix =>
      key.startsWith(prefix)
    );
    if (!hasValidPrefix) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid key prefix. Allowed: ${ALLOWED_PREFIXES.join(', ')}`,
      });
    }
  }

  private validateContentType(contentType: string): void {
    if (!contentType.startsWith('image/')) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only image files are allowed',
      });
    }
  }
}
