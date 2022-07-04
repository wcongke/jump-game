import { Mesh, Quaternion, Scene } from '@babylonjs/core';
import { MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';
import { Easing, Tween, remove } from '@tweenjs/tween.js';
import { Config } from './config';

// 角色状态
enum RoleStatus {
  Idle,
  Pressed,
  Jump,
  Dead,
}

const upVec = new Vector3(0, 1, 0);

export class Role {
  private roleMaterial: StandardMaterial;
  private headMesh?: Mesh;
  private bodyMesh?: Mesh;
  private roleMesh?: Mesh;
  private status: RoleStatus = RoleStatus.Idle;
  private rotateAxis = new Vector3(0, 1, 0);
  private velocityVertical = 0;
  private velocityHorizontal = 0;
  private reBounceTween?: Tween<any>;
  private touchStartTime: number = 0;
  private jumpTime: number = 0;
  private jumpTotalTime: number = 0;
  private translateDirection: Vector3 = new Vector3();

  constructor(private scene: Scene) {
    this.roleMaterial = new StandardMaterial('roleMaterial', this.scene);
    this.roleMaterial.diffuseColor = new Color3(1, 1, 1);
    this._createRoleModel(scene);
  }

  /**
   * @function 创建角色模型
   * @param scene
   */
  private _createRoleModel(scene: Scene) {
    this.headMesh = this._createRolePart(
      MeshBuilder.CreateSphere('role-head', { diameter: 5 }, scene),
      this.roleMaterial,
    );

    this.headMesh.position = new Vector3(0, 10, 0);

    const bodyBottomMesh = this._createRolePart(
      MeshBuilder.CreateCylinder(
        'role-body-bottom',
        { height: 5, diameterTop: 3, diameterBottom: 5 },
        scene,
      ),
      this.roleMaterial,
    );
    bodyBottomMesh.position = new Vector3(0, 0, 0);
    const bodyMiddleMesh = this._createRolePart(
      MeshBuilder.CreateCylinder(
        'role-body-middle',
        { height: 2.5, diameterTop: 4, diameterBottom: 3 },
        scene,
      ),
      this.roleMaterial,
    );
    bodyMiddleMesh.position = new Vector3(0, 2.5, 0);
    const bodySphereMesh = this._createRolePart(
      MeshBuilder.CreateSphere('role-body-sphere', { diameter: 4 }, scene),
      this.roleMaterial,
    );
    bodySphereMesh.position = new Vector3(0, 4, 0);

    this.bodyMesh = Mesh.MergeMeshes(
      [bodyBottomMesh, bodyMiddleMesh, bodySphereMesh],
      true,
      true,
      undefined,
      false,
      true,
    ) as Mesh;
    this.bodyMesh.name = 'role-body';

    this.roleMesh = Mesh.MergeMeshes(
      [this.headMesh, this.bodyMesh],
      true,
      true,
      undefined,
      false,
      true,
    ) as Mesh;
    this.roleMesh.name = 'role';
  }

  /**
   * @function 创建角色部件
   * @param mesh
   * @param material
   */
  private _createRolePart(mesh: Mesh, material: StandardMaterial) {
    mesh.material = material;

    return mesh;
  }

  /**
   * @function 重置角色位置和旋转角度
   */
  reset() {
    const initPosition = Config.roleInitPosition;
    (this.roleMesh as Mesh).position = new Vector3(...initPosition);
    (this.roleMesh as Mesh).rotation = new Vector3(0, 0, 0);
  }

  /**
   * @function 按压角色
   */
  press() {
    if (this.status === RoleStatus.Idle) {
      this.status = RoleStatus.Pressed;
      this.touchStartTime = Date.now();
    }
  }

  /**
   * @function 角色状态处理
   * @param deltaTime -增量时间
   */
  statusHandle(deltaTime: number): void {
    switch (this.status) {
      case RoleStatus.Pressed: {
        const scaling = (this.bodyMesh as Mesh).scaling;
        scaling.x += 0.0003 * deltaTime;
        if (scaling.x > 1.8) scaling.x = 1.8;
        scaling.z = scaling.x;
        scaling.y -= 0.0001 * deltaTime;
        if (scaling.y < 0.8) scaling.y = 0.8;
        const headPosition = (this.headMesh as Mesh).position;
        headPosition.y -= 0.000175 * deltaTime;
        if (headPosition.y < 1.25) headPosition.y = 1.25;
        break;
      }
      case RoleStatus.Jump: {
        if (this.jumpTime > this.jumpTotalTime) {
          this.status = RoleStatus.Idle;
          (this.roleMesh as Mesh).position.y = Config.groundY;
          return;
        }

        const translateVertical = this.velocityVertical * deltaTime;
        const translateHorizontal = this.velocityHorizontal * deltaTime;
        this.velocityVertical = this.velocityVertical - Config.gravity * deltaTime;
        (this.roleMesh as Mesh).position.y += translateVertical;
        (this.roleMesh as Mesh).position.x += translateHorizontal * this.translateDirection.x;
        (this.roleMesh as Mesh).position.z += translateHorizontal * this.translateDirection.z;
        this.jumpTime += deltaTime;
        break;
      }
    }
  }

  /**
   * @function 角色跳跃旋转
   */
  jumpRotate() {
    const direction = this.translateDirection;
    const { rotateAxis, jumpTotalTime } = this;
    rotateAxis.set(direction.x, 0, direction.z);
    Vector3.CrossToRef(rotateAxis, upVec, rotateAxis);

    const quat = this.roleMesh?.rotationQuaternion;

    new Tween({ rotation: 0 })
      .to({ rotation: -360 }, jumpTotalTime)
      .onUpdate((obj) => {
        Quaternion.RotationAxisToRef(
          rotateAxis,
          (Math.PI * obj.rotation) / 180,
          quat as Quaternion,
        );
        (this.roleMesh as Mesh).rotationQuaternion = quat as Quaternion;
      })
      .onComplete(() => {
        (this.roleMesh as Mesh).rotation = new Vector3(0, 0, 0);
      })
      .easing(Easing.Linear.None)
      .start();
  }

  /**
   * @function 角色释放
   * @param direction
   */
  release(direction: Vector3) {
    if (this.status === RoleStatus.Pressed) {
      this.translateDirection.set(direction.x, direction.y, direction.y).normalize();
      this.calculateVelocity(Date.now() - this.touchStartTime);
      this.jumpTime = 0;
      this.jumpTotalTime = this.calculateTotalTime(
        this.velocityVertical,
        Config.gravity,
        Math.abs((this.roleMesh as Mesh).position.y - Config.groundY),
      );
      this.reBounce();
      this.jumpRotate();
      this.status = RoleStatus.Jump;
    }
  }

  /**
   * @function 角色回弹
   */
  private reBounce() {
    const scaling = (this.bodyMesh as Mesh).scaling;
    const headPosition = (this.headMesh as Mesh).position;

    this.reBounceTween && remove(this.reBounceTween);

    this.reBounceTween = new Tween({
      scaleX: scaling.x,
      scaleY: scaling.y,
      scaleZ: scaling.z,
      positionY: headPosition.y,
    })
      .to({ scaleX: 1, scaleY: 1, scaleZ: 1, positionY: 1.6 }, 200)
      .onUpdate((obj) => {
        scaling.set(obj.scaleX, obj.scaleY, obj.scaleZ);
        (this.headMesh as Mesh).position.y = obj.positionY;
        (this.bodyMesh as Mesh).scaling = scaling;
      })
      .easing(Easing.Elastic.Out)
      .start();
  }

  /**
   * @function 计算初速度
   * @param duration -时长
   */
  private calculateVelocity(duration: number) {
    this.velocityHorizontal = Math.min((0.02 / 2000) * duration, 0.02);
    this.velocityVertical = Math.min((0.04 / 2000) * duration, 0.04);
  }

  /**
   * @function 计算总时长
   */
  private calculateTotalTime(v: number, g: number, h: number) {
    const moreTime = (-v + Math.sqrt(v * v - 2 * g * -h)) / g;
    return (v / g) * 2 - moreTime;
  }
}
