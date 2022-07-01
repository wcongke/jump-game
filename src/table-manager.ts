import type { AbstractMesh, Scene } from '@babylonjs/core';
import { MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';
import { Config } from './config';

export class TableManager {
  public cubeMeshArray: AbstractMesh[];
  private cubeMaterial: StandardMaterial;

  constructor(private scene: Scene) {
    this.cubeMeshArray = [];
    this.cubeMaterial = new StandardMaterial('redMaterial', this.scene);
    this.cubeMaterial.diffuseColor = new Color3(1, 0, 0);
  }

  _createCube(name: string, x: number, y: number, z: number) {
    const cubeMesh = MeshBuilder.CreateBox(name, {
      depth: Config.tableSize,
      width: Config.tableSize,
      height: Config.tableHeight,
    });
    cubeMesh.material = this.cubeMaterial;
    cubeMesh.position = new Vector3(x, y, z);
    this.cubeMeshArray.push(cubeMesh);
  }

  _clearAll() {
    this.cubeMeshArray.forEach((cubeMesh) => {
      this.scene.removeMesh(cubeMesh);
    });
    this.cubeMeshArray = [];
  }
}
