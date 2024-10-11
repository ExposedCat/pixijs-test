import type { GameState } from '../entities/state.ts';
import type { BaseEntity, HitBox } from '../entities/base-entity.ts';

export type CollidesArgs = {
  hitbox: HitBox;
  x: number;
  y: number;
  state: GameState;
  skipEntity?: BaseEntity;
};

export function collides({ x, y, hitbox, state, skipEntity }: CollidesArgs) {
  const movableCollision = state.entities.some(entity => {
    return (
      entity !== skipEntity &&
      x < entity.x + entity.hitbox.offsetX + entity.hitbox.width &&
      x + hitbox.width > entity.x + entity.hitbox.offsetX &&
      y < entity.y + entity.hitbox.offsetY + entity.hitbox.height &&
      y + hitbox.height > entity.y + entity.hitbox.offsetY
    );
  });

  const player = state.player;
  const playerCollision =
    x < player.x + player.hitbox.offsetX + player.hitbox.width &&
    x + hitbox.width > player.x + player.hitbox.offsetX &&
    y < player.y + player.hitbox.offsetY + player.hitbox.height &&
    y + hitbox.height > player.y + player.hitbox.offsetY;

  return movableCollision || playerCollision;
}
