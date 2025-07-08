import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import * as fs from 'fs';
import path from 'path';

async function generateEnv() {
  const stage = process.env.NODE_ENV;
  console.log('stage', stage);
  let secretId = '';
  switch (stage) {
    case 'development':
      secretId = 'dev-secret';
      break;
    case 'production':
      secretId = 'prod-secret';
      break;
  }
  if (!secretId) {
    return;
  }
  const secrets = await new SecretsManager({
    region: 'ap-northeast-2',
  })
    .getSecretValue({
      SecretId: secretId,
    })
    .then(secretData => JSON.parse(secretData.SecretString as string));
  const envString = Object.entries(secrets)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  fs.writeFileSync(path.resolve(process.cwd(), '.env'), envString);
}

generateEnv();
