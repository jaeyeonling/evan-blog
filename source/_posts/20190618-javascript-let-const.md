---
title: JavaScript의 let과 const, 그리고 TDZ
date: 2019-06-18 15:19:49
tags:
  - JavaScript
  - Temporal Dead Zone
  - TDZ
categories:
  - JavaScript
---

## 들어가며
이번 포스팅에서는 JavaScript ES6에서 추가되었던 `let`과 `const` 키워드에 대해서 자세히 포스팅하려고 한다. 부끄럽지만 지금까지 필자는 `let`과 `const`는 호이스팅이 되지 않는다고 생각하고 있었다. 하지만 얼마 전 친구와 대화하던 중에 `let`과 `const`도 호이스팅 대상체이지만 `TDZ`라는 특수한 영역을 사용하여 참조를 **방어**하는 것임을 알게 되었다.

***
**다른 분**: 근데 `var`와 다르게 `let`이랑 `const`는 왜 참조 에러가 발생하는 건가요?
**필자**: `let`이랑 `const`는 호이스팅 안될 거에요.
**친구**: `let`이랑 `const`도 호이스팅 되는데...? TDZ에 들어가 있어서 참조 에러 나는거야
**필자**: 된다고???
***

{% asset_img 'no-yes.jpg' %}

이런 부끄러운 일을 겪고 이번 기회에 호이스팅에 대해 제대로 공부도 할겸 이번 포스팅을 작성하게 되었다.

## var 키워드
`var`키워드는 JavaScript ES5까지 변수를 선언할 수 있는 키워드로 사용되었다. `var` 키워드는 다른 언어랑 조금 다른 방식으로 작동했기에 다른 언어를 사용하다가 JavaScript로 처음 입문한 개발자들의 멘탈을 털어버리는 데 혁혁한 공을 세웠다. `var` 키워드의 특징은 다음과 같다.

#### 변수의 중복 선언이 가능하다.

```js
var name = 'Evan';
var name = 'Evan2';
console.log(name) // Evan2
```

이 코드는 변수 선언부가 가까이 붙어있으니 한눈에 `아 name이 두번 선언되었구나`라고 한눈에 알 수 있지만 첫번째 선언부와 두번째 선언부 사이에 500줄의 코드가 있다면 이제 문제가 심각해진다. 이런 변수의 중복 선언 허용은 의도하지 않은 변수의 변경이 일어날 가능성이 충분하다.

#### 호이스팅 당한다.
호이스팅은 쉽게 얘기해서 `함수 안에 있는 선언들을 모두 함수 스코프의 최상단으로 끌어올리는 것`을 의미한다. 호이스팅은 JavaScript 인터프리터가 코드를 해석할 때 `변수 및 함수의 선언 처리`, `실제 코드 실행`의 두단계로 나눠서 처리하기 때문에 발생하는 현상인데 이게 또 굉장히 사람 헷갈리게 만든다.

```js
console.log(name); // undeinfed
var name = 'Evan';
```

필자도 처음 JavaScript를 시작했을 때 `아니 이게 왜 참조 에러가 안나지?`라고 생각했었다. 사실 호이스팅이 발생하면서 이 코드는 아래와 같은 방식으로 동작한다.

```js
var name; // 선언부를 제일 위로 끌어올린다.

console.log(name);
name = 'Evan';
```

물론 이건 JavaScript 인터프리터가 내부적으로 코드를 이런 방식으로 처리한다는 거지 실제 코드 라인이 변경되거나 하는건 아니다. 어쨌든 이 호이스팅을 당하게 되면<small><strike>(호이스팅은 왠지 "당한다"는 표현이 잘 어울린다. 나도 여러번 당했기 때문에...)</strike></small> 인터프리터 언어임에도 불구하고 개발자가 코드를 읽는 순서와 코드가 실행되는 순서가 달라지게 되는 것이기 때문에 JavaScript에 입문할 때 헷갈리게 만드는 요인 중 하나다.

#### 함수 레벨 스코프
대부분의 프로그래밍 언어는 블록 레벨 스코프를 사용하지만 JavaScript는 역시 다르다. `var` 키워드로 선언된 변수는 함수 레벨 스코프 내에서만 인정된다. 이건 사실 JavaScript에 익숙한 개발자들이라면 큰 문제가 되지는 않지만 역시 늅늅이 시절에는 굉장히 헷갈린다.

```js
(function () {
  var local = 1;
})();
console.log(local); // Uncaught ReferenceError: local is not defined

for (var i = 0; i < 10; i++) {
	
}
console.log(i); // 10
```

함수 스코프만 인정되기 때문에 심지어 `for` 문 내부에서 선언한 변수 `i`도 외부에서 참조 가능하다.

#### var 키워드 생략 가능
변수를 선언할 때 `var` 키워드를 붙혀도 되고 안붙혀도 된다. 역시 자유의 상징 JavaScript 답다. 너무 자유로워서 개발자가 한시도 긴장의 끈을 놓을 수 없게 만든다.

```js
var globalVariable = 'global!';

if (globalVariable === 'global!') {
  globlVariable = 'global?' // 오타 냄
}

console.log(globalVariable) // global!
console.log(globlVariable) // global?
```

실수로 `globalVariable` 변수를 `globlVariable` 변수로 오타를 냈다. 개발자는 `globalVariable` 변수가 `global?`로 변경되었으리라 기대를 하겠지만 아쉽게도 그 값은 오타낸 변수명인 `globlVariable`이 가져갔다. 이런 경우도 간단한 코드에서는 디버깅이 쉽지만 조금만 코드가 복잡해져도 눈물이 흐르는 케이스이다.

{% asset_img 'off-work.jpg' %}
<center><sub>이런 것들에게 한번 걸리면 야근의 늪에서 빠져나올 수가 없다...</sub></center>

## let과 const 키워드의 등장
`var`키워드의 경우 전역 변수를 남발하기가 쉽고 또 로컬 변수라고 해도 변수의 스코프가 너무 넓기 때문에 변수의 선언부와 호출부가 너무 멀리 떨어져 있거나 값이 의도하지 않게 바뀌는 경우를 추적하기 힘들기 때문에 문제가 많았다.
그래서 2015년에 발표된 JavaScript ES6에는 새로운 변수 선언 키워드로 `let`과 `const`가 추가되었다.

`let` 키워드는 `var`와 마찬가지로 변수를 선언할 때 사용하는 키워드이고 `const` 키워드는 상수를 선언할 때 사용하는 키워드이다.
즉 `const` 키워드는 리터럴 값의 재할당이 불가능하다.

```js
const callEvan = 'Hello, Evan!';
callEvan = 'Bye, Evan!'; // Uncaught TypeError: Assignment to constant variable.
```

그럼 이 친구들이 기존의 `var` 키워드와 다른 점은 무엇일까? 위에서 설명했던 `var` 키워드의 특징은

- 변수의 중복 선언이 가능하다.
- 호이스팅 당한다.
- 블록 레벨 스코프가 아닌 함수 레벨 스코프를 사용한다
- var 키워드는 생략이 가능하다.

이상 4개 였다. 여기에 대조되는 `let`과 `const` 키워드의 특징부터 먼저 살펴보자.

## let과 const 키워드의 특징
우선 위에서 설명한 `var` 키워드의 특징과 대조되는 점 부터 살펴보자.

### 변수의 중복 선언이 불가능하다.
이 친구들은 `var` 키워드와는 다르게 한번 키워드를 사용해서 선언한 변수는 재선언이 불가능하다.

```js
var name = 'Evan';
var name = 'Evan2'; // 아무 일도 일어나지 않았다...

let name = 'Evan';
let name = 'Evan2'; // Uncaught SyntaxError: Identifier 'name' has already been declared

const name = 'Evan';
const name = 'Evan2'; // Uncaught SyntaxError: Identifier 'name' has already been declared
```

이로써 나도 모르게 변수를 두번 선언해서 값이 변경되는 일을 방어할 수 있게 되었다.

### 호이스팅 당한다?
이게 바로 필자가 이 글을 작성하게 된 이유이다. 필자는 `let`이나 `const` 키워드가 호이스팅되지 않는 줄 알았다.
그러나 위에서 설명했듯이 호이스팅은 JavaScript 인터프리터가 코드를 해석하는 과정에서 발생하는 일이기 때문에 `let`이나 `const`라고 한들 피해갈 수 있을리가 없다. 그렇다면 이 문제를 어떻게 해결했을까?

우선 예제부터 보자.

```js
console.log(name); // undefined
var name = 'Evan';

console.log(aaa) // Uncaught ReferenceError: aaa is not defined

console.log(name); // Uncaught ReferenceError: Cannot access 'name' before initialization
let name = 'Evan';
```

첫번째는 호이스팅 당한 `var` 키워드를 사용하여 선언한 변수를 호출한 모습이다. 당연히 `undefined`가 출력된다.
두번째는 아예 선언한 적이 없는 변수를 호출하는 모습이다. `Uncaught ReferenceError`가 발생하고 메세지는 `aaa is not defined`라고 한다.
세번째는 `let` 키워드를 사용하여 선언한 변수를 선언부 이전에 호출한 모습이다. 두번째와 마찬가지로 `Uncaught ReferenceError`가 발생했지만 에러 메세지는 `Cannot access 'name' before initialization`라고 나온다.

이 두개의 에러는 전혀 다른 에러로, V8 엔진 내부에서 사용하는 `MESSAGE_TEMPLATE`에도 엄밀히 구분되어 있고 실제 호출되는 케이스도 다르다.

```cpp
T(NotDefined, "% is not defined")
T(AccessedUninitializedVariable, "Cannot access '%' before initialization")
```

[V8 엔진의 깃허브 레파지토리](https://github.com/v8/v8)을 클론받아서 살펴본 결과 내부적으로 `var` 키워드로 선언된 JS 객체와 `let`과 `const`로 선언된 JS 객체를 분기로 갈라놓은 코드가 굉장히 많았다. 코드를 계속 분석해보면서 `var`, `let`, `const` 키워드를 사용하여 값을 선언하든 호이스팅은 이루어진다는 것을 알 수 있었다. 호이스팅 플래그인 `should_hoist` 값을 할당할 때 변수 선언 키워드에 대한 구분은 없이 무조건 `true`를 할당한다.

```cpp
static InitializationFlag DefaultInitializationFlag(VariableMode mode) {
  DCHECK(IsDeclaredVariableMode(mode));
  return mode == VariableMode::kVar ? kCreatedInitialized
                                    : kNeedsInitialization;
}
```

그러나 이후 진행 로직을 보면 `DefaultInitializationFlag`라는 함수를 통해 V8 엔진 내부에서 사용되는 `VariableKind`라는 타입을 반환하는데, 이때 `var` 키워드를 사용하여 선언한 변수는 `kCreatedInitialized` 값을, 그 외의 키워드인 `let`과 `const`로 선언한 변수는 `kNeedsInitialization` 키워드를 반환하고 있다.

> 즉 let, const 키워드로 선언한 리터럴 값은 호이스팅은 되나 특별한 이유로 인해 "초기화가 필요한 상태"로 관리되고 있다.

라고 말할 수 있다.


<!-- let, const hoisting -->






