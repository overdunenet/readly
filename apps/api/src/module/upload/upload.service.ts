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

  getPresignedUploadUrl(
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

    return getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    })
      .then(presignedUrl => ({
        presignedUrl,
        cdnUrl: `${this.cdnUrl}/${key}`,
      }))
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate presigned URL',
        });
      });
  }

  private validateKey(key: string): void {
    if (key.includes('..')) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid key: path traversal is not allowed',
      });
    }

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
