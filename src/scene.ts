import type { Engine } from '@babylonjs/core';
import {
  Scene,
  FreeCamera,
  Vector3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import { TableManager } from './table-manager';
import { Role } from './role';

function createScene(engine: Engine) {
  const scene = new Scene(engine);

  // 原点
  const zeroVector = new Vector3(0, 0, 0);

  // 相机
  const camera = new FreeCamera('free-camera', new Vector3(0, 0, 0));
  camera.position = new Vector3(-100, 100, 100);
  camera.target = zeroVector;
  // 控制相机
  // camera.attachControl(engine.getRenderingCanvas(), true);

  // sky
  const skyBox = MeshBuilder.CreateBox('skyBox', { size: 1000 }, scene);
  const skyBoxMaterial = new StandardMaterial('skyBox', scene);
  skyBoxMaterial.backFaceCulling = false;
  skyBoxMaterial.emissiveColor = new Color3(0.1, 0.1, 0.1);
  skyBox.material = skyBoxMaterial;

  // 光
  const directionalLight = new DirectionalLight('directional-light', new Vector3(0, 0, 0), scene);
  directionalLight.intensity = 0.9;
  directionalLight.position = new Vector3(-10, 15, 20);
  directionalLight.setDirectionToTarget(zeroVector);
  const hemisphericLight = new HemisphericLight('hemispheric-light', new Vector3(0, 0, 0), scene);
  hemisphericLight.intensity = 0.15;

  // 底座
  const tableManager = new TableManager(scene);
  tableManager._createCube('cube1', -8, 0, 25);
  tableManager._createCube('cube2', -8, 0, -20);

  // 角色
  const role = new Role(scene);
  role.reset();

  document.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    role.press();
  });

  document.addEventListener('pointerup', (e) => {
    e.preventDefault();
    role.release(new Vector3());
  });

  return scene;
}

export { createScene };
