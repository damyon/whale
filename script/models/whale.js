'use strict';

class Whale extends Character {
  constructor() {
    // Allow passing configuration data to the constructor.
    super();

    this.main = new WhaleTorso();
    this.members = [];
  }
}
