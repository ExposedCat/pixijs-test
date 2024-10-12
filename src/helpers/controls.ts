export type MovementArgs = Record<string, 'left' | 'right' | 'up' | 'down'>;

export class Controls {
  movement: Record<string, boolean> = {};
  state: Record<string, boolean> = {};

  constructor(movementKeys: MovementArgs) {
    document.addEventListener('keydown', event => {
      const direction = movementKeys[event.key];
      if (direction) {
        this.movement[direction] = true;
      } else {
        this.state[event.key] = true;
      }
    });

    document.addEventListener('keyup', event => {
      const direction = movementKeys[event.key];
      if (direction) {
        this.movement[direction] = false;
      } else {
        this.state[event.key] = false;
      }
    });
  }

  isMoving() {
    return this.movement.left || this.movement.right || this.movement.up || this.movement.down;
  }
}
