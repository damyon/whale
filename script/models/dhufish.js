'use strict';

class Dhufish extends Character {
  constructor() {
    // Allow passing configuration data to the constructor.
    super();

    this.main = new FishTorso();
    //this.members = [new Member()];
  }
}
