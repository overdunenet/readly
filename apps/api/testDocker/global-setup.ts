import { execSync } from 'child_process';
import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { DataSources } from '../src/database/datasources';
import {
  CONTAINER_HEALTH_STATUS,
  HealthCheckInterval,
  HealthCheckTimeout,
  TESTING_CONTAINER_NAME,
} from './const';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const getRunningDockerStatus = (): string => {
  try {
    const result = execSync(
      `docker inspect --format '{{.State.Status}}' ${TESTING_CONTAINER_NAME}`,
      {
        encoding: 'utf-8',
      }
    );
    return result.trim();
  } catch {
    return 'not_found';
  }
};

const isPortReachable = async (): Promise<boolean> => {
  try {
    const ds = new DataSource({
      type: 'postgres',
      host: '127.0.0.1',
      port: 55432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
    });
    await ds.initialize();
    await ds.destroy();
    return true;
  } catch {
    return false;
  }
};

const startDockerContainer = () => {
  console.log('Start Docker Container');
  execSync('docker compose -f ./testDocker/docker-compose.yml up -d', {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
};

const ensureDatabase = async () => {
  const adminDs = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 55432,
    username: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });
  await adminDs.initialize();
  const result = await adminDs.query(
    `SELECT 1 FROM pg_database WHERE datname = 'readly_test'`
  );
  if (result.length === 0) {
    await adminDs.query(`CREATE DATABASE readly_test`);
    console.log('Created database: readly_test');
  }
  await adminDs.destroy();
};

const waitForContainerReady = async () => {
  let countdown = HealthCheckTimeout;
  const step = HealthCheckInterval;
  console.log('postgres booting...');

  while (countdown > 0) {
    const status = getRunningDockerStatus();
    if (status === CONTAINER_HEALTH_STATUS.HEALTHY) {
      console.log('postgres container ready');
      break;
    }
    if (status === CONTAINER_HEALTH_STATUS.UNHEALTHY)
      throw Error('Container failed to start.');

    countdown -= step;
    await sleep(step);
  }
};

const setupWrapper = async () => {
  // 1. 이미 55432 포트에 postgres가 떠 있으면 그대로 사용
  const reachable = await isPortReachable();
  if (reachable) {
    console.log('Postgres already reachable on port 55432, reusing...');
  } else {
    // 2. test-postgresql 컨테이너 확인 → 없으면 생성
    const status = getRunningDockerStatus();
    if (status === CONTAINER_HEALTH_STATUS.HEALTHY) {
      console.log('Container healthy, waiting for connection...');
    } else {
      console.log('Container not running, starting a new container...');
      startDockerContainer();
    }
    await waitForContainerReady();
  }

  // 3. readly_test DB가 없으면 생성
  await ensureDatabase();

  // 4. DataSource 초기화 + 스키마 동기화
  await DataSources.readly.initialize();
  await DataSources.readly.synchronize();
  console.log('postgres activated - schema synchronized');
  await DataSources.readly.destroy();
};

export default setupWrapper;
