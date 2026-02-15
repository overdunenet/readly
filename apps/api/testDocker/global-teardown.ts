import { execSync } from 'child_process';
import 'tsconfig-paths/register';
import { TESTING_CONTAINER_NAME } from './const';

const stopAndRemoveContainer = () => {
  execSync(`docker stop ${TESTING_CONTAINER_NAME}`, { stdio: 'inherit' });
  execSync(`docker rm -v ${TESTING_CONTAINER_NAME}`, { stdio: 'inherit' });
};

const globalTeardown = async () => {
  // 로컬에서는 docker 재부팅 속도가 너무 느려서 Teardown 하지 않음
  if (process.env.PREV_NODE_ENV === 'localdev') return;
  // CI 환경에서만 컨테이너 정리
  if (process.env.PREV_NODE_ENV === 'ci') {
    await stopAndRemoveContainer();
  }
};

export default globalTeardown;
