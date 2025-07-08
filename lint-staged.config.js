module.exports = {
    // 각 워크스페이스별로 해당 디렉토리에서 lint 실행
    'apps/api/**/*.{ts,tsx,js,jsx}': [
        'cd apps/api && yarn lint -- --fix',
    ],
    'apps/admin/**/*.{ts,tsx,js,jsx}': [
        'cd apps/admin && yarn lint -- --fix',
    ],
    'apps/client/**/*.{ts,tsx,js,jsx}': [
        'cd apps/client && yarn lint -- --fix',
    ],
    'packages/**/*.{ts,tsx,js,jsx}': (filenames) => {
        // 변경된 파일이 속한 패키지만 lint 실행 (api-types 제외)
        const packages = [...new Set(
            filenames.map(filename => {
                const match = filename.match(/packages\/([^\/]+)/);
                return match ? match[1] : null;
            }).filter(Boolean).filter(pkg => pkg !== 'api-types')
        )];

        return packages.map(pkg => `yarn workspace ${pkg} run lint:fix`);
    }
};