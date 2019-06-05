---
title: JavaScript로 중력 구현하기 - 2. 중력이란?
date: 2017-05-06 14:22:01
tags:
    - 일반물리
    - JavaScript
categories:
    - 물리
    - 그래픽스
---

### 들어가며
***
이번 포스팅에서는 {% post_link gravity-via-js-1 저번 포스팅 %}에 이어 중력을 직접 JS로 구현해보려고 한다.
개발환경은 JavaScript ES7, babel, Webpack, Three.js을 사용하였다.

### 코딩
***
먼저 프로그램에서 사용할 상수 값들 부터 선언하겠다.

```js
export const initOptions = {
    framerate: 60,
    G: 250, // 내 맘대로 중력상수
    START_SPEED: 30, // 초기화 시 물체들의 속도
    OBJECT_COUNT: 40, // 초기화 후 렌더 될 물체 개수
    TRACE_LENGTH: 100, // 물체의 이동 궤적 길이
    MIN_MASS: 400, // 물체들의 최소 질량
    MAX_MASS: 3000, // 물체들의 최대 질량
    DENSITY: 0.15 // 물체들이 렌더되는 밀도
};
export const SPHERE_SIDES = 20;
export const MASS_FACTOR = 0.01;
```

원래라면 `6.6742e-11`의 값을 가지는 중력 상수는 `250`이나 준 이유는 이 물체들의 질량이 너무 작기 때문이다.
실제 중력상수 값을 이용해서 계산을 하고 그 중력의 영향이 눈에 보일 정도가 되려면 질량도 행성급으로 커야한다.

`MASS_FACTOR`는 나중에 렌더할 때 물체의 질량에 비례하도록 구의 크기를 설정하려고 하는데 질량 값들이 `400~3000`이다보니까 구의 부피가 너무 커질 것 같아서 그걸 보정하기 위해 선언한 상수이다.
일종의 압축률 비슷한 느낌으로 나중에 구의 scale값을 정의할 때 물체의 질량에 `MASS_FACTOR`를 곱해줘서 일정한 비율로 크기를 줄일 예정이다.

 이 포스팅은 `ThreeJS`를 설명하기 위한 포스팅이 아니므로 `Scene`과 `Renderer`의 선언 및 초기화 등에 대해서는 생략하고 지나가겠다.

 자 그럼 이제 실제 움직일 놈들을 구현하자.
 이름을 Object로 하고 싶었지만 알다시피 JS에서 Object라는 이름은 Build-in Object가 이미 가지고 있다.
 그래서 다른 이름을 고심하다가 그냥 Mover라고 했다. 만들던 중에 다른 사람들이 구현한 것도 좀 찾아보고 그러다보니 알게된 건데 다들 Mover라고 하더라....

 ```js
import { SPHERE_SIDES, MASS_FACTOR } from 'src/constants';
import {
    Vector3, SphereGeometry, Line,
    MeshPhongMaterial, PointLight, Mesh, Geometry
} from 'three';

export class Mover {
    constructor(mass, velocity, location, id, scene) {
        this.uid = `mover-${id}`;
        this.location = location;
        this.velocity = velocity;
        this.acceleration = new Vector3(0.0, 0.0, 0.0);
        this.mass = mass;
        this.alive = true;

        this.geometry = new SphereGeometry(100, SPHERE_SIDES, SPHERE_SIDES);
        this.vertices = [];

        this.line = new Line();
        this.color = this.line.material.color;

        this.basicMaterial = new MeshPhongMaterial({
            color: this.color,
            specular: this.color,
            shininess: 10
        });

        this.mesh = new Mesh(this.geometry, this.basicMaterial);
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = true;

        this.position = this.location;

        this.parentScene = scene;
    }
}
```

`Mover`클래스로 생성된 객체는 `constructor` 실행 시 넘겨받은 랜덤한 질량값과 속도, 위치 값을 가지고 있다.
그리고 `acceleration`값을 초기화 해준다. 가속도는 어떠한 방향으로 움직이는 속도이므로 3개의 원소를 가진 벡터로 선언해 주었다.

그리고 `alive`멤버변수는 `Mover`끼리 충돌판정이 나면 `Mover` 두개를 하나로 합쳐서 더 큰 질량을 가진 `Mover`로 만들 예정이기때문에 얘가 죽었나 살았나를 판별하기 위한 값이다.
이후 `Scene`에는 초기화 시 `Mover`들을 그려주는 로직을 써주었다.

```js
export default {
    reset() {
        let movers = this.movers;

        if(movers) { // movers리스트 초기화
            movers.forEach(v => {
                this.scene.remove(v.mesh);
                this.scene.remove(v.selectionLight);
                this.scene.remove(v.line);
            });
        }

        movers = [];
        for (let i = 0; i < parseInt(this.options.MOVER_COUNT); i++) {
            let mass = this.getRandomize(this.options.MIN_MASS, this.options.MAX_MASS),
                maxDistance = parseFloat(1000 / this.options.DENSITY),
                maxSpeed = parseFloat(this.options.START_SPEED);

            let velocity = new Vector3(
                this.getRandomize(-maxSpeed, maxSpeed),
                this.getRandomize(-maxSpeed, maxSpeed),
                this.getRandomize(-maxSpeed, maxSpeed)
            );
            let location = new Vector3(
                this.getRandomize(-maxDistance, maxDistance),
                this.getRandomize(-maxDistance, maxDistance),
                this.getRandomize(-maxDistance, maxDistance)
            );

            movers.push(new Mover(mass, velocity, location, i, this.scene));
            // 랜덤한 속도, 위치, 질량을 가진 Mover를 생성
        }

        movers.forEach(v => {
            v.addMover(); // Mover가 초기화될 때 만들어진 Mesh, Line, Light 객체를 Scene에 넣는다
        });

        this.movers = movers;
    },
    getRandomize(min, max) {
        return Math.random() * (max - min) + min;
    }
}
```

이제 `Scene`은 여러 개의 `Mover`를 담은 리스트인 `movers`를 가지게 되었다. 이제 렌더되는 동안 계산만 하면 끝! 인데...
전 포스팅에서 말했듯이 여러 개의 물체에 대한 중력을 구하는 다체문제는 해를 구할 수가 없다.
그래서 우리는 `movers`를 순회하며 한번 순회할 때마다 다른 `Mover`들과의 중력을 이체문제로 모두 계산하는 로직을 만들어야한다.

```js
let movers = this.movers;

movers.forEach((o1, i) => {
    if(!o1.alive) return false;
    movers.forEach((o2, j) => {
        if(o1.alive && o2.alive && i !== j) {
            let distance = o1.location.distanceTo(o2.location); // o1 -> o2의 거리
            let r1 = (o1.mass / MASS_FACTOR / MASS_FACTOR / 4 * Math.PI) ** (1/3),
                r2 = (o2.mass / MASS_FACTOR / MASS_FACTOR / 4 * Math.PI) ** (1/3);
                 // o1, o2의 반지름 r

            if(distance <= r1 + r2) {
                // 둘의 거리가 둘의 반지름의 합 이하면 충돌한 것으로 판정, 두 물체를 합친다
                o2.eat(o1);
            }
            else {
                // 충돌이 아닐 경우 그냥 운동만 시킨다
                o2.attract(o1, this.options);
            }
        }
    });
});
```

우선 이런 식으로 전체 `Mover`들을 순회하면서 충돌 판정을 내주었다.
`Mover`클래스의 `eat`메소드는 충돌 판정이 난 두개의 `Mover`들을 하나로 합치는 로직을 가지고 있으며,
`attract`메소드에는 현재 두 물체의 거리에서의 중력을 측정하고 `Mover`의 가속도에 더해주는 역할을 하고 있다.
이후 모든 계산이 끝나면 `Mover`의 위치와 크기, 속도, 방향 등을 업데이트 해주었다. `Gravity`클래스의 `calcGravity`메소드는 {% post_link gravity-via-js-1 저번 포스팅 %}에서 적었던 로직 그대로이다.
`Mover`의 운동에 관련된 메소드들은 다음과 같다.

```js
export class Mover {
    constructor(mass, velocity, location, id, scene) {
        ...
    }

    eat(otherMover) {
        const newMass = this.mass + otherMover.mass;
        const newLocation = new Vector3(
            (this.location.x * this.mass + otherMover.location.x * otherMover.mass) / newMass,
            (this.location.y * this.mass + otherMover.location.y * otherMover.mass) / newMass,
            (this.location.z * this.mass + otherMover.location.z * otherMover.mass) / newMass
        );

        const newVelocity = new Vector3(
            (this.velocity.x * this.mass + otherMover.velocity.x * otherMover.mass) / newMass,
            (this.velocity.y * this.mass + otherMover.velocity.y * otherMover.mass) / newMass,
            (this.velocity.z * this.mass + otherMover.velocity.z * otherMover.mass) / newMass
        );

        this.location = newLocation;
        this.velocity = newVelocity;
        this.mass = newMass;

        otherMover.kill();
    }

    attract(otherMover, options) {
        const force = Gravity.calcGravity(this, otherMover, options.G);
        this.applyForce(force);
    }

    applyForce(force) {
        if(!this.mass) this.mass = 1.0;
        const f = force.divideScalar(this.mass);
        this.acceleration.add(f);
        // mover의 가속도에 힘을 적용
    }

    update() {
       this.velocity.add(this.acceleration); // 속도에 가속도 더함
       this.location.add(this.velocity); // 위치에 속도 더해서 이동시킴
       this.acceleration.multiplyScalar(0); // 가속도 초기화

        this.mesh.position.copy(this.location); // mover의 mesh객체에 위치 적용
    }
}
```

정리하자면 매 프레임마다 `movers`리스트를 순회하면서 각 `Mover`들간의 중력을 계산하고 가속도를 적용한 후 실제로 `Mover`를 이동시키는 것이다.
[프로젝트 깃허브 링크](https://github.com/evan-moon/3d-gravity-test)

이상으로 JavaScript로 중력구현하기 포스팅을 마친다.
