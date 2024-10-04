import { Application } from 'pixi.js';

export type InitPixiAppArgs = {
  width: number;
  height: number;
};

export async function initPixiApp({ width, height }: InitPixiAppArgs) {
  const app = new Application();

  await app.init({
    width,
    height,
    background: '#ffffff',
  });

  return app;
}
