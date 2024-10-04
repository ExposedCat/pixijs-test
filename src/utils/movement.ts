export type MovementArgs = Record<string, 'left' | 'right' | 'up' | 'down'>;

export class Movement {
  state = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor(movementKeys: MovementArgs) {
    document.addEventListener('keydown', event => {
      const direction = movementKeys[event.key];
      if (direction) {
        this.state[direction] = true;
      }
    });
    document.addEventListener('keyup', event => {
      const direction = movementKeys[event.key];
      if (direction) {
        this.state[direction] = false;
      }
    });
  }

  isMoving() {
    return this.state.left || this.state.right || this.state.up || this.state.down;
  }
}
