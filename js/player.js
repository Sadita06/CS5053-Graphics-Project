// Handles player movement and camera
// player.js
import { drawPlayer } from "../assets/playerModel.js";

export class Player {
  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };

    this.moveSpeed = 0.12;
    this.turnSpeed = 0.12;

    this.width = 0.8;
    this.height = 1.4;
    this.depth = 0.8;

    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    this.flashlightOn = false;

    this.cameraOffset = {
      x: 0,
      y: 3,
      z: 6,
    };

    this.setupControls();
  }

  setupControls() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (key in this.keys) {
        this.keys[key] = true;
      }

      if (key === "f") {
        this.flashlightOn = !this.flashlightOn;
      }
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();

      if (key in this.keys) {
        this.keys[key] = false;
      }
    });
  }

  update(obstacles = []) {
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.w) moveZ -= this.moveSpeed;
    if (this.keys.s) moveZ += this.moveSpeed;
    if (this.keys.a) moveX -= this.moveSpeed;
    if (this.keys.d) moveX += this.moveSpeed;

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;

      moveX *= this.moveSpeed;
      moveZ *= this.moveSpeed;

      const oldX = this.position.x;
      const oldZ = this.position.z;

      this.position.x += moveX;
      this.position.z += moveZ;

      if (this.checkObstacleCollision(obstacles)) {
        this.position.x = oldX;
        this.position.z = oldZ;
      }

      this.rotation.y = Math.atan2(moveX, moveZ);
    }
  }

  checkObstacleCollision(obstacles) {
    const playerBox = this.getBoundingBox();

    for (let i = 0; i < obstacles.length; i++) {
      const box = obstacles[i];

      if (this.boxIntersect(playerBox, box)) {
        return true;
      }
    }

    return false;
  }

  checkCollectibles(collectibles) {
    const playerBox = this.getBoundingBox();
    const collected = [];

    for (let i = 0; i < collectibles.length; i++) {
      if (!collectibles[i].collected) {
        const itemBox = collectibles[i].getBoundingBox();

        if (this.boxIntersect(playerBox, itemBox)) {
          collectibles[i].collected = true;
          collected.push(collectibles[i]);
        }
      }
    }
    return collected;
  }

  boxIntersect(a, b) {
    return (
      a.minX <= b.maxX &&
      a.maxX >= b.minX &&
      a.minY <= b.maxY &&
      a.maxY >= b.minY &&
      a.minZ <= b.maxZ &&
      a.maxZ >= b.minZ
    );
  }

  getBoundingBox() {
    return {
      minX: this.position.x - this.width / 2,
      maxX: this.position.x + this.width / 2,
      minY: this.position.y,
      maxY: this.position.y + this.height,
      minZ: this.position.z - this.depth / 2,
      maxZ: this.position.z + this.depth / 2,
    };
  }

  getCameraPosition() {
    return {
      x: this.position.x + this.cameraOffset.x,
      y: this.position.y + this.cameraOffset.y,
      z: this.position.z + this.cameraOffset.z,
    };
  }

  getCameraTarget() {
    return {
      x: this.position.x,
      y: this.position.y + 1.0,
      z: this.position.z,
    };
  }

  setPosition(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  draw(gl, programInfo) {
    drawPlayer(gl, programInfo, this.position, this.rotation);
  }
}
