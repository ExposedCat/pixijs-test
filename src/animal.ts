import { Sprite } from 'pixi.js';
import type { Application, Renderer } from 'pixi.js';

import { parseTileset } from './tileset.ts';
import type { ParseTileSheetArgs } from './tileset.ts';

export type CreateAnimalArgs = Pick<ParseTileSheetArgs, 'fileName' | 'width' | 'height'> & {
  app: Application<Renderer>;
  initialX: number;
  initialY: number;
};

export async function createAnimal({ app, initialX, initialY, ...tilesetArgs }: CreateAnimalArgs) {
  const animationDuration = 2;

  const characterSpritesheet = await parseTileset({
    ...tilesetArgs,
    rowSize: 4,
    columnSize: 2,
    names: ['standingLeft', 'standingRight', 'runningLeft', 'runningRight'],
    animationDuration,
  });

  const movement = {
    left: false,
    right: false,
    up: false,
    down: false,
  };
  const moving = () => movement.left || movement.right || movement.up || movement.down;

  let lastDirection: 'left' | 'right' = 'left';

  let textureId = 0;
  let animation = characterSpritesheet.animations.standingLeft;

  const updateAnimation = () => {
    const action = moving() ? 'running' : 'standing';
    switch (lastDirection) {
      case 'left':
        animation = characterSpritesheet.animations[`${action}Left`];
        break;
      case 'right':
        animation = characterSpritesheet.animations[`${action}Right`];
        break;
    }
  };

  let offsetX = 0;
  let offsetY = 0;
  let spriteX = initialX;
  let spriteY = initialY;

  const updatePosition = () => {
    sprite.x = spriteX - offsetX;
    sprite.y = spriteY - offsetY;
  };

  const sprite = new Sprite(animation[0]);
  sprite.x = spriteX;
  sprite.y = spriteY;
  app.stage.addChild(sprite);

  const speed = 1;

  let elapsed = 0;
  app.ticker.add(({ deltaMS }) => {
    elapsed += deltaMS;
    if (elapsed > 250) {
      elapsed = 0;
      textureId += 1;
      sprite.texture = animation[textureId % animationDuration];
    }

    if (movement.up) {
      spriteY -= speed;
    } else if (movement.down) {
      spriteY += speed;
    }

    if (movement.left) {
      spriteX -= speed;
      lastDirection = 'left';
    } else if (movement.right) {
      spriteX += speed;
      lastDirection = 'right';
    }

    updateAnimation();
    updatePosition();
  });

  document.addEventListener('keydown', event => {
    switch (event.key) {
      case 'ArrowLeft':
        movement.left = true;
        break;
      case 'ArrowRight':
        movement.right = true;
        break;
      case 'ArrowUp':
        movement.up = true;
        break;
      case 'ArrowDown':
        movement.down = true;
        break;
    }
  });

  document.addEventListener('keyup', event => {
    switch (event.key) {
      case 'ArrowLeft':
        movement.left = false;
        break;
      case 'ArrowRight':
        movement.right = false;
        break;
      case 'ArrowUp':
        movement.up = false;
        break;
      case 'ArrowDown':
        movement.down = false;
        break;
    }
  });

  const shift = (x: number, y: number) => {
    offsetX = x;
    offsetY = y;
  };

  return { shift };
}
