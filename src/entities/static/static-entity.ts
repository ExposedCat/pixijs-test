import { BaseEntity } from '../base-entity.ts';
import type { InitBaseEntityArgs } from '../base-entity.ts';

export type InitStaticEntityArgs = Omit<InitBaseEntityArgs, 'animationDuration'> & {
  hp: number | null;
};

export class StaticEntity extends BaseEntity {
  async initStatic({ app, ...args }: InitStaticEntityArgs) {
    await this.initBase({
      ...args,
      app,
      animationDuration: 1,
    });

    app.stage.addChild(this.sprite);
  }

  destroy() {
    super.destroy();
    this.state.app.stage.removeChild(this.sprite);
  }
}
