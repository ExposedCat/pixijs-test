import { Sprite } from 'pixi.js';
import type { Application, Renderer } from 'pixi.js';

import { parseTileset } from './tileset.ts';

export type CreateCharacterArgs = {
  app: Application<Renderer>;
  onMove: (x: number, y: number) => void;
};

export async function createCharacter({ app, onMove }: CreateCharacterArgs) {
  const animationDuration = 6;

  const characterSpritesheet = await parseTileset({
    fileName: 'character',
    width: 312,
    height: 176,
    rowSize: 12,
    columnSize: 4,
    names: [
      'standingLeft',
      'runningLeft',
      'standingDown',
      'standingRight',
      'runningDown',
      'runningRight',
      'standingUp',
      'runningUp',
    ],
    animationDuration,
  });

  let offsetX = 0;
  let offsetY = 0;

  const movement = {
    left: false,
    right: false,
    up: false,
    down: false,
  };
  const moving = () => movement.left || movement.right || movement.up || movement.down;

  let lastDirection: 'up' | 'left' | 'right' | 'down' = 'down';

  let textureId = 0;
  let animation = characterSpritesheet.animations.standingDown;

  const updateAnimation = () => {
    const action = moving() ? 'running' : 'standing';
    switch (lastDirection) {
      case 'down':
        animation = characterSpritesheet.animations[`${action}Down`];
        break;
      case 'left':
        animation = characterSpritesheet.animations[`${action}Left`];
        break;
      case 'right':
        animation = characterSpritesheet.animations[`${action}Right`];
        break;
      case 'up':
        animation = characterSpritesheet.animations[`${action}Up`];
        break;
    }
  };

  const character = new Sprite(animation[0]);
  character.x = app.screen.width / 2 - 16 / 2;
  character.y = app.screen.height / 2 - 16 / 2;
  app.stage.addChild(character);

  const speed = 3;

  let elapsed = 0;
  app.ticker.add(({ deltaMS }) => {
    elapsed += deltaMS;
    if (elapsed > 100) {
      elapsed = 0;
      textureId += 1;
      character.texture = animation[textureId % animationDuration];
    }

    if (movement.up) {
      offsetY -= speed;
      lastDirection = 'up';
    } else if (movement.down) {
      offsetY += speed;
      lastDirection = 'down';
    }

    if (movement.left) {
      offsetX -= speed;
      lastDirection = 'left';
    } else if (movement.right) {
      offsetX += speed;
      lastDirection = 'right';
    }

    if (moving()) {
      onMove(offsetX, offsetY);
    }

    updateAnimation();
  });

  document.addEventListener('keydown', event => {
    switch (event.key) {
      case 'a':
        movement.left = true;
        break;
      case 'd':
        movement.right = true;
        break;
      case 'w':
        movement.up = true;
        break;
      case 's':
        movement.down = true;
        break;
    }
  });

  document.addEventListener('keyup', event => {
    switch (event.key) {
      case 'a':
        movement.left = false;
        break;
      case 'd':
        movement.right = false;
        break;
      case 'w':
        movement.up = false;
        break;
      case 's':
        movement.down = false;
        break;
    }
  });
}
