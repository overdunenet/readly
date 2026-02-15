import fs from 'fs';
import path from 'path';

import type { Plugin, PreviewServer, ResolvedConfig } from 'vite';

interface PrerenderOptions {
  routes: string[];
  renderAfterTime?: number;
}

export function prerender(options: PrerenderOptions): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'vite:prerender',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async closeBundle() {
      const outDir = path.isAbsolute(config.build.outDir)
        ? config.build.outDir
        : path.join(config.root, config.build.outDir);

      const { routes, renderAfterTime = 2000 } = options;

      console.log(`\n[prerender] Rendering routes: ${routes.join(', ')}`);

      // Dynamic import to avoid ESM issues
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({ headless: true });

      let server: PreviewServer | null = null;

      try {
        // Start a preview server
        server = await (
          await import('vite')
        ).preview({
          root: config.root,
          preview: { port: 4173, strictPort: false },
          build: { outDir: config.build.outDir },
        });

        const address = server.httpServer.address();
        const port =
          typeof address === 'object' && address ? address.port : 4173;
        const origin = `http://localhost:${port}`;

        for (const route of routes) {
          const page = await browser.newPage();
          const url = `${origin}${route}`;

          console.log(`[prerender] Rendering ${route}...`);
          await page.goto(url, { waitUntil: 'networkidle0' });

          // Wait for SPA rendering
          await new Promise((r) => setTimeout(r, renderAfterTime));

          const html = await page.content();
          await page.close();

          // Write rendered HTML
          const outputPath = path.join(outDir, route, 'index.html');
          const outputDir = path.dirname(outputPath);
          fs.mkdirSync(outputDir, { recursive: true });
          fs.writeFileSync(outputPath, html);

          console.log(`[prerender] Written: ${outputPath}`);
        }

        console.log('[prerender] All routes rendered successfully!');
      } finally {
        await browser.close();
        if (server) {
          server.httpServer.close();
        }
      }
    },
  };
}
