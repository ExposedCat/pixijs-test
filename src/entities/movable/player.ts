import type { Ticker } from 'pixi.js';

import { Plant } from '../static/plant.ts';
import { Text } from '../generic/text.ts';
import { MovableEntity } from './movable-entity.ts';
import type { InitMovableEntityArgs } from './movable-entity.ts';
import type { BaseEntity } from '../base-entity.ts';
import { distance } from '../../utils/geometry.ts';

export type InitCharacterArgs = Pick<InitMovableEntityArgs, 'app' | 'state'> & {
  onMove?: (x: number, y: number) => void;
};

export class Player extends MovableEntity {
  private plants = 0;
  private onMove!: (x: number, y: number) => void;

  private scoreLabel!: Text;

  initialX!: number;
  initialY!: number;

  constructor() {
    super({
      keys: {
        w: 'up',
        a: 'left',
        s: 'down',
        d: 'right',
      },
      speed: 3,
      animationDelay: 100,
      verticalAnimation: true,
    });
  }

  private updateScore(change: number) {
    this.plants += change;
    this.scoreLabel.text = `Score: ${this.plants}`;
  }

  private pickPlant() {
    const plantIndex = this.state.entities.findIndex(
      entity => entity instanceof Plant && entity.growthLevel === 4 && distance({ from: this, to: entity }) < 50,
    );
    if (plantIndex > 0) {
      const plant = this.state.entities[plantIndex] as Plant;
      this.state.entities.splice(plantIndex, 1);
      plant.destroy();
      this.updateScore(1);
    }
  }

  private collidesWithEntity(newX: number, newY: number, entity: BaseEntity) {
    return (
      newX < entity.virtualX + entity.hitbox.offsetX + entity.hitbox.width &&
      newX + this.hitbox.width > entity.virtualX + entity.hitbox.offsetX &&
      newY < entity.virtualY + entity.hitbox.offsetY + entity.hitbox.height &&
      newY + this.hitbox.height > entity.virtualY + entity.hitbox.offsetY
    );
  }

  private collides(newX: number, newY: number) {
    return this.state.entities.some(entity => this.collidesWithEntity(newX, newY, entity));
  }

  protected canMove(changeX: number, changeY: number) {
    const x = this.x + changeX + this.hitbox.offsetX;
    const y = this.y + changeY + this.hitbox.offsetY;
    const { width, height } = this.hitbox;
    return (
      x > 0 &&
      this.state.map.width > x + width &&
      y > 0 &&
      this.state.map.height > y + height &&
      !this.collides(this.initialX + changeX + this.hitbox.offsetX, this.initialY + changeY + this.hitbox.offsetY)
    );
  }

  protected updatePosition() {
    this.onMove(this.x - this.initialX, this.y - this.initialY);
  }

  protected updateVisibility() {}

  async init({ app, state, onMove }: InitCharacterArgs) {
    const width = 312;
    const height = 176;
    const rowSize = 12;
    const columnSize = 4;

    const tileWidth = width / rowSize;
    const tileHeight = height / columnSize;
    this.initialX = (app.screen.width - tileWidth) / 2;
    this.initialY = (app.screen.height - tileHeight) / 2;

    await this.initMovable({
      hp: 100,
      state,
      app,
      initialX: this.initialX,
      initialY: this.initialY,
      fileName: 'character',
      width,
      height,
      rowSize,
      columnSize,
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
      animationDuration: 6,
      hitbox: {
        offsetX: 6,
        offsetY: 24,
        width: 14,
        height: 12,
      },
    });

    this.scoreLabel = new Text({ x: 10, y: 10 });
    this.state.app.stage.addChild(this.scoreLabel);
    this.updateScore(0);

    this.onMove = onMove ?? (() => {});
    this.initialized = true;
  }

  lifeCycle(ticker: Ticker) {
    super.lifeCycle(ticker);
    if (this.controls.state[' ']) {
      this.pickPlant();
    }
  }

  setPosition(_x: number, _y: number): void {
    console.warn(`setPosition should not be called on Character`);
  }
}
