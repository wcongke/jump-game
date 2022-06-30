import type { Engine } from '@babylonjs/core';
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';

function createScene(engine: Engine) {
  const scene = new Scene(engine);

  // 相机
  const camera = new ArcRotateCamera(
    'arc-rotate-camera',
    -Math.PI / 2,
    Math.PI / 2.5,
    10,
    new Vector3(0, 0, 0),
  );
  camera.attachControl(engine.getRenderingCanvas(), true);

  // sky
  const skyBox = MeshBuilder.CreateBox('skyBox', { size: 1000 }, scene);
  const skyBoxMaterial = new StandardMaterial('skyBox', scene);
  skyBoxMaterial.backFaceCulling = false;
  skyBoxMaterial.emissiveColor = new Color3(1, 1, 1);
  skyBox.material = skyBoxMaterial;

  // 光
  const hemisphericLight = new HemisphericLight('hemispheric-light', new Vector3(0, 0, 0), scene);
  hemisphericLight.intensity = 0.9;

  const box = MeshBuilder.CreateBox('box', {});

  return scene;
}

export { createScene };
