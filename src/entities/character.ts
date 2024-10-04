import { Sprite } from 'pixi.js';
import type { Application, Renderer } from 'pixi.js';

import { Movement } from '../utils/movement.ts';
import { parseTileset } from '../engine/tileset.ts';

export type InitCharacterArgs = {
  app: Application<Renderer>;
  onMove: (x: number, y: number) => void;
};

export class Character {
  private initialized = false;
  private animationDuration = 6;
  private speed = 3;

  private movement = new Movement({
    w: 'up',
    a: 'left',
    s: 'down',
    d: 'right',
  });

  private x: number = 0;
  private y: number = 0;

  async init({ app, onMove }: InitCharacterArgs) {
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
      animationDuration: this.animationDuration,
    });

    let lastDirection: 'up' | 'left' | 'right' | 'down' = 'down';

    let textureId = 0;
    let animation = characterSpritesheet.animations.standingDown;

    const updateAnimation = () => {
      const action = this.movement.isMoving() ? 'running' : 'standing';
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

    let elapsed = 0;
    app.ticker.add(({ deltaMS }) => {
      elapsed += deltaMS;
      if (elapsed > 100) {
        elapsed = 0;
        textureId += 1;
        character.texture = animation[textureId % this.animationDuration];
      }

      if (this.movement.state.up) {
        this.y -= this.speed;
        lastDirection = 'up';
      } else if (this.movement.state.down) {
        this.y += this.speed;
        lastDirection = 'down';
      }

      if (this.movement.state.left) {
        this.x -= this.speed;
        lastDirection = 'left';
      } else if (this.movement.state.right) {
        this.x += this.speed;
        lastDirection = 'right';
      }

      if (this.movement.isMoving()) {
        onMove(this.x, this.y);
      }

      updateAnimation();
    });

    this.initialized = true;
  }

  constructor() {}
}
