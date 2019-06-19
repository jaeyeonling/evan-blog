---
title: JavaScript 배열(Array)의 발전과 성능에 대해서 자세히 알아보기 [번역]
date: 2019-06-15 12:43:13
tags:
  - 번역
  - JavaScript
  - Array
categories:
  - JavaScript
thumbnail: /2019/06/15/diving-into-js-array/actual-array-js.png
toc: true
---

> 이 포스팅은 2017년 9월 2일에 Paul Shan이 작성한 [Diving deep into JavaScript array - evolution & performance](http://voidcanvas.com/javascript-array-evolution-performance/)를 번역한 글입니다. 

## 들어가며
포스팅을 시작하기 전에 이 포스팅은 JavaScript 배열의 구문에 관한 것을 알려주거나 예제를 보여주는 등의 기본적인 내용은 아니라고 먼저 얘기해두고 싶다. 이 포스팅에서는 메모리 표현, 최적화, 구문에 따라 달라지는 동작의 차이, 성능 및 최근의 JavaScript 배열이 어떻게 발전했는지에 관해서만 설명할 것이다.

<!-- more -->

필자가 JavaScript를 처음 시작했을 때 필자는 이미 C, C++, C# 등의 언어에 익숙한 상태였다. 그래서 다른 C/C++ 개발자들처럼 JavaScript와의 첫 만남이 그리 좋지는 못했다.

그 중 필자가 JavaScript를 좋아하지 않았던 가장 큰 이유는, 바로 `배열`이다. JavaScript의 배열은 Hash Map이나 Dictionary로 구현되었고 연속적이지 않기 때문에 필자는 이 언어가 배열을 제대로 구현할수도 없는 B급 언어라고 생각했다. 그러나 그 이후 JavaScript에 대한 필자의 이해도는 많이 달라졌다.

> (역주) 기존 언어에서 구현했던 배열은 생성 시에 특정 범위의 메모리를 할당하고 연속적으로 데이터를 저장했지만 JavaScript는 메모리를 미리 할당해놓지 않고 동적 할당하므로 연속적으로 원소가 저장되지 않는다. 리스트와 동일한 방식.

## JavaScript의 배열이 실제로는 배열이 아닌 이유
자바스크립트에 관한 설명들을 시작하기 전에 `배열`이 무엇인지부터 설명을 먼저 해야할 것 같다.
배열은 연속적인 메모리 로케이션들의 묶음을 사용하여 값을 저장하는 데 사용된다. 여기서 중요한 포인트는 `연속성(continuous)`과 `인접성(contiguous)`이라는 단어이다.

{% asset_img 'actual-array-js.png' 'Actual Array in JavaScript' %}

위 그림은 배열의 메모리 상태의 예시를 표현한 것이다. 이 배열은 4 bit로 이루어진 4개의 블록을 가지고 있고 총 16 bit의 메모리 블록을 사용하고 있다.

이제 필자가 `tinyInt arr[4];`를 선언했고 `1201`부터 시작해서 이 메모리 블록들을 포착했다고 가정해보자. 이제 필자가 어떤 포인트로부터 `a[2]`를 읽으려고 한다면 `a[2]`의 메모리 주소를 찾기 위한 간단한 수학 계산이 이루어진다. `1201 + (2 x 4)`와 같은 식으로 `1209`의 주소를 바로 참조할 수 있다.

> 역주: 메모리 시작 주소 + (찾고자 하는 인덱스 x 한 블록에 할당된 메모리 블록 개수)로 계산한 것이다. 배열은 이렇게 원하는 원소에 바로 접근할 수 있다.

{% asset_img 'old-array-js.png' 'Old Array in JavaScript' %}

JavaScript에서의 배열은 Hash Map이다. 이것은 다양한 자료 구조를 사용해서 구현될 수 있고, 그 중 하나가 바로 Linked List이다. 만약 JavaScript 내에서 우리가 `var arr = new Array(4);`로 배열을 선언하면 이 배열은 상단의 그림과 같은 구조를 생성한다. 따라서 만약 우리가 `a[2]`를 읽고 싶다면 무조건 `1201`부터 탐색해나가면서 `a[2]`를 찾아나가야 한다는 것이다.

이것이 바로 JavaScript의 배열과 진짜 배열이 다른 점이다. 분명히 JavaScript의 배열을 탐색하는 것은 원래의 Linked List 탐색보다는 계산이 적다. 그러나 배열의 길이가 길어질수록 인생이 고달파지는 건 똑같다.


## JavaSciprt 배열의 발전
예전에는 친구가 컴퓨터에 256MB 짜리 램을 사용한다고 하면 부러움을 느끼던 시절도 있었지만 요즘엔 보통 8GB 정도의 램을 사용한다.

이와 비슷하게 JavaScript 또한 많은 발전을 이루었다. V8, SpiderMonkey, TC39, 증가하고 있는 웹 사용자들의 피나는 노력으로 인해 JavaScript는 전 세계의 필수 요소가 되었다. 이렇게 거대한 유저 베이스를 가지고 있다면 분명히 성능 향상 또한 필요하다.

최근의 JavaScript 엔진은 모든 요소가 동일한 타입을 가지고 있는 배열인 경우 연속적으로 메모리를 할당한다. 훌륭한 프로그래머는 항상 배열을 동일한 타입으로 사용하며 [JIT(Just in Time)](https://ko.wikipedia.org/wiki/JIT_%EC%BB%B4%ED%8C%8C%EC%9D%BC) 컴파일러는 이런 배열에 대해서 C 컴파일러와 같은 배열 계산을 수행한다.
그러나 이런 동일한 타입 배열에 다른 타입의 원소를 삽입하려고 할 때 JIT는 전체 배열의 구조를 해제하고 다시 예전의 배열처럼 비연속적인 메모리를 할당한다. 즉, 만약 우리가 코드를 제대로 작성한다면 JavaScript의 `Array` 객체는 실제 배열처럼 작동한다는 것이다. 이는 모던 JS 개발자들에게는 정말 좋은 일이다.

이에 더해서 배열은 ES2015 또는 ES6를 통해서 더욱 발전했다. TC39 위원회는 JavaScript에 타이핑된 배열을 추가하기로 결정했고 그래서 우리는 `ArrayBuffer`를 사용할 수 있게 되었다.
`ArrayBuffer`는 인접한 메모리 블록을 제공하고 우리가 그것을 마음대로 다룰 수 있게 해준다. 그러나 메모리를 직접 다루는 것은 매우 Low Level이고 또 너무 복잡하기 때문에 우리는 View라는 것을 통해서 ArrayBuffer를 다루게 된다. 이미 몇가지 View를 사용할 수 있고 나중에는 더 추가될 예정이다.

```js
var buffer = new ArrayBuffer(8);
var view   = new Int32Array(buffer);
view[0] = 100;
```

만약 당신이 `Int32Array`와 같은 *Typed Array*에 대해서 더 알고 싶다면 [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)를 참고하기 바란다.

타이핑된 배열은 굉장히 효율적이다. 타이핑된 배열은 WebGL을 사용하는 사람들이 일반 배열로는 바이너리 데이터를 효과적으로 처리할 수 없는 엄청난 성능 문제에 직면했기 때문에 요청해서 도입된 객체이다.<small>(역주: ThreeJS도 내부적으로는 전부 Typed Array를 사용 중이고, 성능 차이 또한 몸으로 느껴질 정도로 확연하다.)</small> 또한 우리는 [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)를 사용하여 여러 개의 Web Worker간 메모리를 공유하여 성능을 끌어올릴 수도 있다.

놀랍지 않은가? JavaScript의 배열은 간단한 Hash Map에서 시작해서 이제는 `SharedArrayBuffer`까지 다루고 있다.

## 일반 배열 vs 타이핑된 배열 - 성능 비교
우리는 JavaScript 배열의 발전에 대해서 이야기 했다. 이제 최근의 배열이 얼마나 좋은지 확인해보자. 필자는 Mac과 `Node.js 8.4.0` 환경에서 몇 개의 작은 테스트를 해보았다.

### 일반 배열 – 삽입

```js
var LIMIT = 10000000;
var arr = new Array(LIMIT);
console.time("Array insertion time");
for (var i = 0; i < LIMIT; i++) {
    arr[i] = i;
}
console.timeEnd("Array insertion time");
```

**수행 시간:** *55ms*

### 타이핑된 배열 – 삽입

```js
var LIMIT = 10000000;
var buffer = new ArrayBuffer(LIMIT * 4);
var arr = new Int32Array(buffer);
console.time("ArrayBuffer insertion time");
for (var i = 0; i < LIMIT; i++) {
    arr[i] = i;
}
console.timeEnd("ArrayBuffer insertion time");
```

**수행 시간:** *52ms*

> 앗...? 예전의 전통적인 배열과 최근 배열의 성능이 비슷한데요...?

Nope. 필자는 요즘의 컴파일러는 똑똑하기때문에 같은 타입을 가진 배열은 내부적으로 연속적인 메모리를 가진 배열로 변환한다는 것을 설명했다. 이게 바로 첫번째 예시에서 발생한 일이다. 필자는 `new Array(LIMIT)`을 사용했지만 내부적으로는 연속적인 메모리 할당을 가진 현대적인 배열을 유지하고 있던 것이다.

이제 첫번째 예시를 수정하여 동일한 자료형을 가지고 있지 않은 배열로 만들고 성능 차이가 있는지 살펴보도록 하자.

### 일반 배열 – 삽입 (동일하지 않은 자료형)

```js
var LIMIT = 10000000;
var arr = new Array(LIMIT);
arr.push({a: 22});
console.time("Array insertion time");
for (var i = 0; i < LIMIT; i++) {
    arr[i] = i;
}
console.timeEnd("Array insertion time");
```

**수행 시간:** *1207ms*

여기서 필자는 3번 라인에 새로운 표현을 추가했을 뿐 나머지는 이전과 전부 동일하지만 성능은 차이가 나기 시작했다. 무려 `22배` 느려진 것을 확인할 수 있다.

### 일반 배열 - 읽기

```js
var LIMIT = 10000000;
var arr = new Array(LIMIT);
arr.push({a: 22});
for (var i = 0; i < LIMIT; i++) {
    arr[i] = i;
}
var p;
console.time("Array read time");
for (var i = 0; i < LIMIT; i++) {
    //arr[i] = i;
    p = arr[i];
}
console.timeEnd("Array read time");
```

**수행 시간:** *196ms*

### Typed Array - read

```js
var LIMIT = 10000000;
var buffer = new ArrayBuffer(LIMIT * 4);
var arr = new Int32Array(buffer);
console.time("ArrayBuffer insertion time");
for (var i = 0; i < LIMIT; i++) {
    arr[i] = i;
}
console.time("ArrayBuffer read time");
for (var i = 0; i < LIMIT; i++) {
    var p = arr[i];
}
console.timeEnd("ArrayBuffer read time");
```

**수행 시간:** *27ms*

## 결론
JavaScript에 타이핑된 배열이 추가된 것은 위대한 첫 발걸음이다. `Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float32Array`, `Float64Array` 등은 네이티브 바이트 순서로 이루어진 뷰를 제공하고, 또 여러분이 직접 `DataView`를 사용하여 커스텀 뷰를 만들 수도 있다. 앞으로 ArrayBuffer를 사용하기 위해 더 많은 DataView 라이브러리들이 활성화되기를 바란다.

JavaScript의 배열이 이렇게 개선된 것은 좋은 일이다. 이제 JavaScript의 배열은 빠르고 효율적이며 강력하고 똑똑하게 메모리를 할당할 수 있게 된 것이다.
