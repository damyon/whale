'use strict';

class Shark extends Character {
  constructor() {
    // Allow passing configuration data to the constructor.
    super();

    this.main = new SharkTorso();
    this.members = [new SharkTail()];
  }
}
