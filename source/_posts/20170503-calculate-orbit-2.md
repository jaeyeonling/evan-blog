---
title: "[JavaScript로 천체 구현하기] 행성의 움직임을 구현해보자"
date: 2017.05.03 21:49:04
tags:
  - 궤도 구현하기
  - 케플러 궤도 방정식
  - 케플러 6요소
  - JavaScript
categories:
  - Programming
  - Graphics
thumbnail: /2017/05/03/calculate-orbit-2/thumbnail.jpg
toc: true
widgets:
  - 
    type: toc
    position: right
  - 
    type: category
    position: right
sidebar:
  right:
    sticky: true
---

이번 포스팅에서는 {% post_link calculate-orbit-1 저번 포스팅 %}에 이어 실제 궤도의 모양과 크기, 위치, 방향을 정의하고 JavaScript코드로 작성을 해보려고 한다. 실제 어플리케이션을 작성할 때는 TypeScript를 사용하였으나, 편의상 JavsScript ES6로 포스팅을 진행한다.
<!-- more -->
궤도를 구하는 방법은 {% post_link calculate-orbit-1 저번 포스팅 %}의 용어 정리에서 언급했던 케플러 6요소를 이용하면 된다.

## 데이터 정의
지구의 궤도 데이터는 다음과 같다.

```js
const AU = 149597870;
const EARTH_ORBIT = {
  base: {
    a: 1.00000261 * AU,
    e: 0.01671123,
    i: -0.00001531,
    o: 0.0,
    l: 100.46457166,
    lp: 102.93768193
  },
  cy: {
    a: 0.00000562 * AU,
    e: -0.00004392,
    i: -0.01294668,
    o: 0.0,
    l: 35999.37244981,
    lp: 0.32327364
  }
};
```

`base`프로퍼티에 들어있는 값은 궤도의 기본 요소들을 의미하며 이 값들은 천문학에서의 역기점인 `J2000`때 측정된 값을 의미한다.
`J2000`은 2000년 1월 1일 정오를 의미한다.
그리고 `cy`프로퍼티에 있는 값들은 1세기당 궤도 요소들의 변화량을 의미한다.

`a`는 장반경, `e`는 이심률, `i`는 기울기, `o`는 승교점 적경, `l`은 평균 경도, `lp`는 근일점 경도를 의미한다.
이 중 장반경의 경우 AU값으로 선언되어있기 때문에 `1AU`를 `km`로 환산한 값인 `149597870`를 곱해줘야 한다. 이때 `1AU`는 태양과 지구 사이의 거리를 의미한다.

하지만 이 데이터에는 케플러 6요소 중 `근일점 편각`과 `근일점 통과시각`이 없다.
그렇기 때문에 필자는 근일점 경도와 승교점 적경을 사용하여 근일점 편각을 구하려고 한다.
그리고 근일점 통과 시각의 경우 `평균근점이각`을 구할 때 필요한데, 근일점 통과 시각을 사용하여 구하는 것보다 근일점 경도와 평균 경도를 사용하는 방법이 훨씬 공식이 간단하기 때문에
오히려 편해진 상황이다.

## 시간 설정과 궤도 요소 계산
위에서 잠깐 말했듯이 천문학에서는 우리가 평소 사용하는 그레고리력이 아닌 율리우스력을 사용한다.

율리우스력이란 원래 `BC 4713년 1월 1일 월요일 정오`를 기점으로 계산한 날짜 수 이다. 하지만 기원전 4713년부터 서기 2017년까지의 날짜를 세면 자릿수가 너무 커지기 때문에
1976년 IAU(국제천문연맹)에서 결정한 `J2000`을 사용하는 것이다.

이제 날짜 요소들을 선언해보자.
```js
const DAY = 60 * 60 *24;
const YEAR = 365.25;
const CENTURY = 100 * YEAR;
const J2000 = new Date('2000-01-01T12:00:00-00:00');

let today = new Date();
let epochTime = (today - J2000) / 1000;
// Date객체끼리 연산하면 값이 ms로 나오기 때문에 1000으로 나눠서 초 단위로 나오게끔 환산해준다
let tDays = epochTime / DAY; // 일수로 환산
let T = tDAys / CENTURY; // 몇 세기나 지났는지 환산
```
이 글을 작성하고 있는 지금은 2017년 5월 3일 22시 27분이다. 계산 결과 `J2000`으로부터 약 `6332.06028991`일이 지났으며 `0.17336236`세기가 지났다는 것을 알 수 있었다.
그럼 이제 아까 선언한 데이터 중 지구의 한 세기당 변화량에 방금 구한 `0.17336236`을 곱한 후 궤도의 기본 요소 값에 더해주면 `J2000`이후 오늘 이 시점의 궤도 요소 값이 나올 것이다.

```js
const keys = Object.keys(EARTH.base);
let computed = { time: epochTime };
computed = keys.reduce((carry, el) => {
  const variation = EARTH.cy || 0;
  carry[el] = EARTH.base[el] + (variation * T);
  return carry;
}, computed);
/*
  a: 149598406.2031184
  e: 0.016703615925039474
  i: -0.0022597770311920135
  l: 6341.400827688619
  lp: 102.9937254119609
  o: 0.0
*/
```

이제 현재 시점 기준의 궤도 요소 값을 구했으면 부궤도 요소를 구할 차례이다.
가장 먼저 케플러 6요소 중 하나지만 우리의 데이터에는 없는 `근일점 편각`을 구해보도록 하자. 근일점 편각 `w`는 근일점 경도에서 승교점 적경을 뺀 값이다.
하지만 지구의 승교점 적경 `o`는 `0.0`이므로 근일점 경도와 근일점 편각이 일치하게 된다.

```js
computed.w = computed.lp - computed.o;
/* w = 102.9937254119609 - 0.0 = 102.9937254119609 */
```

다음은 `평균근점이각(mean anomaly)`를 구해야한다. 평균근점이각은 어떤 물체가 공전 속도와 공전 주기를 유지한 채 정확한 원 궤도로 옮겨간다고 가정했을 때 물체와 궤도 근점간의 각거리를 의미한다.

<center>{% asset_img 'mean-anomaly.png' 'mean-anomaly' %}</center>

위 그림에서 실제 물체의 궤도는 회색 궤도이나, 저 궤도를 원이라고 가정한 빨간 궤도에서의 각거리를 구하는 것이다.

저 두 궤도의 공전 주기는 같기 때문에 같은 지역을 같은 시간 동안 지나간다. 근데 그림을 보면 원 궤도는 각 호들의 넓이가 일정하지만 타원 궤도인 회색 궤도는 일정하지 않다.
타원 궤도를 도는 물체는 초점과의 거리에 따라 `각속도`가 변하기 때문이다. 그래서 좀 더 구하기 쉬운 `평균근점이각`을 먼저 구한 후 타원 궤도에 이를 적용하게 된다.

<small>참조링크: [평균근점이각 위키](https://ko.wikipedia.org/wiki/%ED%8F%89%EA%B7%A0_%EA%B7%BC%EC%A0%90_%EC%9D%B4%EA%B0%81)</small>
<small>참조링크: [케플러 행성운동법칙 위키 - 제 2법칙: 면적속도 일정의 법칙](https://ko.wikipedia.org/wiki/%EC%BC%80%ED%94%8C%EB%9F%AC%EC%9D%98_%ED%96%89%EC%84%B1%EC%9A%B4%EB%8F%99%EB%B2%95%EC%B9%99)</small>

`평균근점이각`을 구하는 공식은 여러 개가 있으나 필자는 `근일점 경도`와 `평균 경도`값을 가지고 있기 때문에 여러 개의 공식 중 가장 쉬워보이는 녀석을 골라서 사용할 수 있다.

이때 평균근점이각 $M$은 평균 경도 $l$과 근일점 경도 $\omega$의 차로 나타내어 질 수 있다.

$$M = l-\omega$$

```js
computed.M = computed.l - computed.lp
/* M = 6341.42938740066 - 102.99372566842652 =  6238.435661732234 */
```

이제 지금까지 구한 궤도들의 단위를 바꿔줘야 한다. 우리가 가지고 있는 지구 궤도 데이터의 수치들은 모두 `digree`단위인데, 이후 계산의 편의를 위해 모두 `radian`으로 바꾸어 주겠다.

```js
const DEG_TO_RAD = Math.PI / 180;

computed.a *= 1000; // 149598406204.91275
computed.i *= DEG_TO_RAD; // -0.000039441031811489665
computed.o *= DEG_TO_RAD; // 0.0
computed.w *= DEG_TO_RAD; // 1.7975796293754245
computed.M *= DEG_TO_RAD; // 108.8812424710587
```

이제 `평균근점이각`을 구했으니 `편심이각(Eccentric anomaly)`를 구해야 한다. 편심이각은 그림으로 보는 게 더 직관적으로 이해하기가 쉽다.

<center>{% asset_img 'eccentric-anomaly.png' 'eccentric-anomaly' %}</center>

이 그림에서 물체의 위치를 `P`로 그에 따른 편심이각은 `E`로 나타내어지고 있다.
타원의 중심은 `C`이고 타원의 초점은 `F`이다.
이때 편심이각 `E`는 타원의 중심에 꼭지점 하나를 찍고 궤도 장반경과 같은 길이의 빗변 `a`를 그은 후, 장반경 `e`와 수직하면서도 `P`에 닿도록
선분을 그어 만들어진 직각삼각형에서 관찰되는 각이다.

`평균근점이각`과 마찬가지로 `편심이각`도 여러 개의 정의로 나타내어질 수 있는데, 필자는 이미 `평균근점이각`을 구했기 때문에 `평균근점이각`으로부터 유도되는 공식을 사용한다.

$$E = \frac{M+e{sinM}}{1-e{cosM}}$$

여기서 `e`는 이심률, `M`은 평균근점이각을 의미한다. 그러나 한가지 슬픈 사실은 여기서 나오는 E값이 근사값이라는 것이다.
그렇기 때문에 보통 이 공식은 [Newton-Raphson method](https://en.wikipedia.org/wiki/Newton%27s_method)를 사용하여 진행된다.

`Newton-Raphson method`메소드는 계속적인 급수 형태로 계산되어지며, 계산을 반복할 수록 더 정확한 근사치를 뱉어준다고 보면 된다.

값의 오차는 이심률이 높을 수록 더 커지게 되는데, 데이터 상 지구의 이심률은 `0.0167703`정도니까 오차율이 그렇게 크진 않을 것이라고 예상된다.
그럼 코드를 작성해보자.

```js
function getEccentricity(callback, x0, maxCount) {
  let x = 0;
  let x2 = x0;
  for(let i = 0; i < maxCount; i++) {
    x = x2;
    x2 = callback(x);
  }
}

function kepler(e, M) {
  return x => {
    return x + (M + e * Math.sin(x) - x) / (1 - e * Math.cos(x));
  };
}

computed.E = getEccentricity(kepler(computed.e, computed.M), computed.M, 6);
/* E =108.8962365500302 */
```

## 행성의 위치 도출하기
자, 지금까지는 이 파트를 위한 지루한 과정이었다. 필요한 값들을 모두 구했으니 이제 행성의 위치를 도출할 수 있게 되었다.
이 값들이 있다면 근일점 쪽을 X축으로 하는 황도좌표평면에 대한 직각 좌표 값을 계산할 수 있다.
그리고 이 좌표값의 유클리드거리 `r`과 진근점이각 `v`를 구할 수 있다. `진근점이각`은 항성과 궤도의 근일점 기준으로 어느 각도에 행성이 위치하고 있는지를 나타내는 각이다.
즉, 행성은 항성으로부터 `r`만큼의 거리만큼 떨어져 있고 궤도의 근일점으로부터 `v`만큼 돌아간 위치에 존재하고 있다는 것이다.
거리랑 각을 알면 3d scene내에서의 로컬좌표를 정의할 수 있다.

```js
const RAD_TO_DEG = 180 / Math.PI;

computed.pos = {x: null, y: null};
computed.pos.x = computed.a * (Math.cos(computed.E) - computed.e);
computed.pos.y = computed.a * (Math.sqrt(1 - (computed.e * computed.e))) * Math.sin(computed.E);

computed.r = Math.sqrt(Math.pow(computed.pos.x, 2) + Math.pow(computed.pos.y, 2));
computed.v = Math.atan2(computed.pos.y, computed.pos.x);

computed.r /= (1000 * AU);
computed.v *= RAD_TO_DEG;

/*
    r = 1.0081888306835929 AU
    v = 120.17208256525967 도
*/
```

이 포스팅 작성 당시 지구는 태양으로부터 `1.0081...`AU 떨어진 위치에 지구 궤도의 근일점으로부터 약 `120`도 돌아간 곳에 위치하고 있다는 결과를 얻을 수 있다.
사실 제일 마지막 `pos`를 구하는 공식과 `진근점이각`을 구하는 공식은 아직 이해가 잘 안된다.
하지만 중요한 것은 이런 공식을 사용해서 내가 원하는 뭔가를 만들어 볼 수 있다는 것이 아닐까 생각한다.

이상으로 행성 위치 게산하기 포스팅을 마친다.
전체 소스는 [Solarsystem 프로젝트 깃허브 레파지토리](https://github.com/evan-moon/solarsystemjs)에서 확인해볼 수 있다.
