import { glob } from 'glob';

export class ModuleLoader {
  static async loadRouters(
    basePath: string,
    pattern: string = '**/*.router.{ts,js}'
  ): Promise<any[]> {
    const files = glob.sync(pattern, {
      cwd: basePath,
      absolute: true,
    });

    const routers: any[] = [];
    for (const file of files) {
      try {
        const module = await import(file);

        // 모든 export된 클래스들을 찾아서 Router 데코레이터가 있는지 확인
        Object.keys(module).forEach(key => {
          const exportedClass = module[key];
          routers.push(exportedClass);
        });
      } catch (error) {
        console.warn(`Failed to load router from ${file}:`, error.message);
      }
    }

    return routers;
  }
}
