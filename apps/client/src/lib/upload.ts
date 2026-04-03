import { vanillaTrpcClient } from '@/shared';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadFile(file: File, key: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기는 50MB를 초과할 수 없습니다');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다');
  }

  const { presignedUrl, cdnUrl } =
    await vanillaTrpcClient.upload.getPresignedUrl.mutate({
      key,
      contentType: file.type,
    });

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다');
  }

  return cdnUrl;
}

export function createUploadKey(prefix: string, file: File): string {
  const ext = file.name.split('.').pop() || 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return `${prefix}/${baseName}-${crypto.randomUUID()}.${ext}`;
}
