---
title: JavaScript의 let과 const, 그리고 TDZ
date: 2019-06-18 15:19:49
tags:
  - JavaScript
  - Temporal Dead Zone
  - TDZ
  - 호이스팅
  - Hoisting
  - V8
categories:
  - Programming
  - JavaScript
thumbnail: /2019/06/18/javascript-let-const/js.001.png
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

이번 포스팅에서는 JavaScript ES6에서 추가되었던 `let`과 `const` 키워드에 대해서 자세히 포스팅하려고 한다. 부끄럽지만 지금까지 필자는 `let`과 `const`는 호이스팅이 되지 않는다고 생각하고 있었다. 하지만 얼마 전 친구와 대화하던 중에 `let`과 `const`도 호이스팅 대상체이지만 `TDZ`라는 특수한 영역을 사용하여 참조를 **방어**하는 것임을 알게 되었다.
<!-- more -->

***
**다른 분**: 근데 `var`와 다르게 `let`이랑 `const`는 왜 참조 에러가 발생하는 건가요?
**필자**: `let`이랑 `const`는 호이스팅 안될 거에요.
**친구**: `let`이랑 `const`도 호이스팅 되는데...? TDZ에 들어가 있어서 참조 에러 나는거야
**필자**: 된다고??? TDZ는 또 뭐여?
***

<center>
  {% asset_img 'no-yes.jpg' 350 %}
  <sub>호...호이스팅이 된다고...?</sub>
  <br>
</center>

이런 부끄러운 일을 겪고 이번 기회에 변수 선언 키워드들에 대해 제대로 공부도 할겸 이번 포스팅을 작성하게 되었다.

## var 키워드
`var`키워드는 JavaScript ES5까지 변수를 선언할 수 있는 키워드로 사용되었다. `var` 키워드는 다른 언어랑 조금 다른 방식으로 작동했기에 다른 언어를 사용하다가 JavaScript로 처음 입문한 개발자들의 멘탈을 털어버리는 데 혁혁한 공을 세웠다. `var` 키워드의 특징은 다음과 같다.

### 변수의 중복 선언이 가능하다.

```js
var name = 'Evan';
var name = 'Evan2';
console.log(name) // Evan2
```

이 코드는 변수 선언부가 가까이 붙어있으니 한눈에 `아 name이 두번 선언되었구나`라고 한눈에 알 수 있지만 첫번째 선언부와 두번째 선언부 사이에 500줄의 코드가 있다면 이제 문제가 심각해진다. 이런 변수의 중복 선언 허용은 의도하지 않은 변수의 변경이 일어날 가능성이 충분하다.

### 호이스팅 당한다.
호이스팅은 쉽게 얘기해서 `스코프 안에 있는 선언들을 모두 스코프의 최상단으로 끌어올리는 것`을 의미한다. 호이스팅은 JavaScript 인터프리터가 코드를 해석할 때 `변수 및 함수의 선언 처리`, `실제 코드 실행`의 두단계로 나눠서 처리하기 때문에 발생하는 현상인데 이게 또 굉장히 사람 헷갈리게 만든다.

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

물론 이건 JavaScript 인터프리터가 내부적으로 코드를 이런 방식으로 처리한다는 거지 실제 코드 라인이 변경되거나 하는건 아니다.
어쨌든 이 호이스팅을 당하게 되면<small><strike>(호이스팅은 왠지 "당한다"는 표현이 잘 어울린다. 나도 여러번 당했기 때문에...)</strike></small> 인터프리터 언어임에도 불구하고 개발자가 코드를 읽는 순서와 코드가 실행되는 순서가 달라지게 되는 것이기 때문에 JavaScript에 입문할 때 헷갈리게 만드는 요인 중 하나다.

### 함수 레벨 스코프
대부분의 프로그래밍 언어는 블록 레벨 스코프를 사용하지만 JavaScript는 역시 다르다. `var` 키워드로 선언된 변수는 함수 레벨 스코프 내에서만 인정된다. 이건 사실 JavaScript에 익숙한 개발자들이라면 큰 문제가 되지는 않지만 역시 늅늅이 시절에는 굉장히 헷갈린다.

```js
(function () {
  var local = 1;
})();
console.log(local); // Uncaught ReferenceError: local is not defined

for (var i = 0; i < 10; i++) {}
console.log(i); // 10
```

함수 스코프만 인정되기 때문에 심지어 `for` 문 내부에서 선언한 변수 `i`도 외부에서 참조 가능하다.

### var 키워드 생략 가능
변수를 선언할 때 `var` 키워드를 붙혀도 되고 안붙혀도 된다. 역시 자유의 상징 JavaScript 답다. 너무 자유로워서 개발자가 한시도 긴장의 끈을 놓을 수 없게 만든다.

```js
var globalVariable = 'global!';

if (globalVariable === 'global!') {
  globlVariable = 'global?' // 오타 냄
}

console.log(globalVariable) // global!
console.log(globlVariable) // global?
```

실수로 `globalVariable` 변수를 `globlVariable` 변수로 오타를 냈다. 순진한 개발자는 `globalVariable` 변수의 값이 `global?`로 변경되었으리라 기대를 하겠지만 아쉽게도 그 값은 오타낸 변수명인 `globlVariable`이 가져갔다.

이런 경우도 간단한 코드에서는 디버깅이 쉽지만 조금만 코드가 복잡해져도 눈물이 흐르는 케이스이다.

<center>
  {% asset_img 'off-work.jpg' 500 %}
  <sub>이런 것들에게 한번 걸리면 얄짤없이 11시까지 일하고 택시타고 집에 가야한다</sub>
  <br>
</center>

## let과 const 키워드의 등장
`var` 키워드의 경우 전역 변수를 남발하기가 쉽고 또 로컬 변수라고 해도 변수의 스코프가 너무 넓기 때문에 변수의 선언부와 호출부가 너무 멀리 떨어져 있거나 값이 의도하지 않게 바뀌는 경우를 추적하기 힘들다.
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

이로써 나도 모르게 변수를 두번 선언해서 값이 변경되어 야근하게 되는 일을 방어할 수 있게 되었다.

### 호이스팅 당한다?
이게 바로 필자가 이 포스팅을 작성하게 된 이유이다. 필자는 `let`이나 `const` 키워드가 호이스팅 되지 않는 줄 알았다.
그러나 위에서 설명했듯이 호이스팅은 JavaScript 인터프리터가 코드를 해석하는 과정에서 발생하는 일이기 때문에 `let`이나 `const`라고 한들 피해갈 수 있을리가 없다. 그렇다면 이 문제를 어떻게 해결했을까?

#### 변수 선언 키워드에 따라 다른 에러가 발생한다
```js
console.log(name); // undefined
var name = 'Evan';

console.log(aaa) // Uncaught ReferenceError: aaa is not defined

console.log(name); // Uncaught ReferenceError: Cannot access 'name' before initialization
let name = 'Evan';
```

첫번째는 호이스팅 당한 `var` 키워드를 사용하여 선언한 변수를 호출한 모습이다. 당연히 참조 에러따윈 나지 않고 깔끔하게 `undefined`가 출력된다.
두번째는 아예 선언한 적이 없는 변수를 호출하는 모습이다. `Uncaught ReferenceError`가 발생하고 메세지는 `aaa is not defined`라고 한다.
세번째는 `let` 키워드를 사용하여 선언한 변수를 선언부 이전에 호출한 모습이다. 두번째와 마찬가지로 `Uncaught ReferenceError`가 발생했지만 에러 메세지는 `Cannot access 'name' before initialization`라고 나온다.

#### V8 엔진을 뜯어보자
이 두개의 에러는 전혀 다른 에러로, V8 엔진 내부에서 사용하는 `MESSAGE_TEMPLATE`에도 엄밀히 구분되어 있고 실제 호출되는 케이스도 다르다.

```cpp
T(NotDefined, "% is not defined")
T(AccessedUninitializedVariable, "Cannot access '%' before initialization")
```

[V8 엔진의 깃허브 레파지토리](https://github.com/v8/v8)을 클론받아서 살펴본 결과 내부적으로 `var` 키워드로 선언된 JS 객체와 `let`과 `const`로 선언된 JS 객체를 분기로 갈라놓은 코드가 굉장히 많았다. 코드를 계속 분석해보면서 `var`, `let`, `const` 중 어떤 키워드를 사용하여 값을 선언하든 호이스팅은 항상 이루어진다는 것을 알 수 있었다. V8 엔진 내부의 호이스팅 플래그인 `should_hoist` 값을 JavaScript 객체에 할당할 때 변수 선언 키워드에 대한 구분을 하지않고 무조건 `true`를 할당한다.

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

#### 초기화가 필요한 상태는 무엇을 의미할까?
JavaScript 인터프리터 내부에서 변수는 총 3단계에 걸쳐 생성된다.

- `선언 (Declaration)`: 스코프와 변수 객체가 생성되고 스코프가 변수 객체를 참조한다.
- `초기화(Initalization)`: 변수 객체가 가질 값을 위해 메모리에 공간을 할당한다. 이때 초기화되는 값은 `undefined`이다.
- `할당(Assignment)`: 변수 객체에 값을 할당한다.

`var` 키워드를 사용하여 선언한 객체의 경우 `선언`과 `초기화`가 동시에 이루어진다. 선언이 되자마자 `undefined`로 값이 초기화 된다는 것이다.

```cpp v8/src/parsing/parser.cc
// Var 모드로 변수 선언 시
auto var = scope->DeclareParameter(name, VariableMode::kVar, is_optional,
                                         is_rest, ast_value_factory(), beg_pos);
var->AllocateTo(VariableLocation::PARAMETER, 0);
```

V8 엔진의 코드를 보면 `kVar` 모드로 변수 객체를 생성한 후 바로 `AllocateTo` 메소드를 통해 메모리에 공간을 할당하는 모습을 볼 수 있다.
그러나 `let`이나 `const` 키워드로 생성한 변수 객체는 다르다.

```cpp v8/src/parsing/parser.cc
// kLet 모드로 변수 선언 시
VariableProxy* proxy =
      DeclareBoundVariable(variable_name, VariableMode::kLet, class_token_pos);
proxy->var()->set_initializer_position(end_pos);

// Const 모드로 변수 선언 시
VariableProxy* proxy =
          DeclareBoundVariable(local_name, VariableMode::kConst, pos);
proxy->var()->set_initializer_position(position());
```

`kLet` 모드나 `kConst` 모드로 생성한 변수 객체들은 `AllocateTo` 메소드가 바로 호출되지 않았고 대신 소스 코드 상에서 해당 코드의 위치를 의미하는 `position`값만 정해주는 것을 볼 수 있다.

바로 이 타이밍에 `let` 키워드나 `const` 키워드로 생성된 변수들이 `TDZ(Temporal Dead Zone)` 구간에 들어가는 것이다. 즉, `TDZ` 구간에 있는 변수 객체는

> 선언은 되어있지만 아직 초기화가 되지않아 변수에 담길 값을 위한 공간이 메모리에 할당되지 않은 상태

라고 할 수 있는 것이다. 이때 해당 변수에 접근을 시도하면 얄짤없이 `Cannot access '%' before initialization` 에러 메세지를 만나게 되는 것이다.

### 블록 레벨 스코프를 사용한다
함수 레벨 스코프를 사용하는 `var` 키워드와 다르게 `let`과 `const`는 블록 레벨 스코프를 사용한다. 블록 레벨 스코프를 사용하지 않기 때문에 블록 내부에서 선언한 변수 또한 전역 변수로 취급된다.

```js
var globalVariable = 'I am global';

if (globalVariable === 'I am global') {
  var globalVariable = 'am I local?';
}

console.log(globalVariable); // am I local?
```

그러나 `let`과 `const` 키워드의 경우에는 블록 내부에서 선언한 변수는 지역 변수로 취급된다.

```js
let globalVariable = 'I am global';

if (globalVariable === 'I am global') {
  let globalVariable = 'am I local?';
  let localVariable = 'I am local';
}

console.log(globalVariable); // I am global
console.log(localVariable); // Uncaught ReferenceError: localVariable is not defined
```

이 경우 블록 내부에서 선언된 `localVariable`은 지역 변수로 취급되어 전역 스코프에서는 참조가 불가능하다. 참고로 `let`과 `const`는 호이스팅도 블록 단위로 발생한다.

```js
let name = 'Global Evan';

if (name === 'Global Evan') {
  console.log(name); // Uncaught ReferenceError: Cannot access 'name' before initialization
  let name = 'Local Evan';
}
```

이 경우 `if`문 내부에서도 전역 변수로 선언한 `name` 변수의 값인 `Global Evan`이 출력될 것이라고 생각할 수 있지만 `if`문의 블록 내부에서도 호이스팅이 발생하여 지역 변수인 `name`의 선언부가 블록의 최상단으로 끌어올려졌기 때문에 참조 에러가 발생한다.

### let, const 키워드는 생략이 불가능하다.

```js
name = 'Evan'
// 상기 코드는
var name = 'Evan'
// 과 같다
```
변수 선언 키워드를 사용하지 않으면 `var` 키워드를 사용한 것으로 취급되기 때문에 무조건 써줘야 한다.

## const 키워드의 특징
`let` 키워드의 경우 위에서 설명한 이유들을 제외하면 `변수`를 선언할 때 사용한다는 점에서 `var` 키워드와 동일한 역할을 한다고 할 수 있다.
그러면 기존의 `var` 키워드와 다른 역할을 하는 `const`에 대해서 조금 더 알아보자.

### 상수를 선언할 때 사용한다
위에서 설명했듯이 `const`는 `상수`를 선언할 때 사용하는 키워드이다. `상수`는 어떠한 불변 값을 의미한다. 즉, 한번 `const` 키워드를 사용하여 선언한 값은 두번 다시 변경할 수 없다는 뜻이다.

```js
const maxCount = 30;
maxCount = 40; // Uncaught TypeError: Assignment to constant variable.
```

만약 `const` 키워드로 선언한 값을 재할당하려고 시도하면 친절한 에러메세지와 함께 불가능하다고 알려준다.

하지만 여기에 중요한 점이 있다. 바로 `Call by reference` 호출 방식을 사용하는 타입을 `const` 키워드로 선언 했을 때다.

```js
const obj = { name: 'Evan' }
obj = { name: 'John' } // Uncaught TypeError: Assignment to constant variable.
```

이 경우 당연히 `obj` 변수가 바라보는 값 자체의 참조를 변경하려고 했기 때문에 에러가 발생한다. 그러나 객체 내부의 프로퍼티들은 `const` 키워드의 영향을 받지 않는다.

```js
const obj = { name: 'Evan' }
obj.name = 'John'
console.log(obj) // { name: 'John' }
```

이건 `Call by reference` 호출 방식을 사용하는 다른 타입인 `Array`도 마찬가지다. `const` 키워드를 사용하여 선언했더라도 `push`나 `splice` 등으로 배열 내부의 원소를 변경하는 행위에는 아무런 제약이 없다.

### 반드시 선언과 동시에 초기화 해줘야 한다
`let` 키워드의 경우 명시적으로 선언만 했더라도 인터프리터가 해당 코드 라인을 해석함과 동시에 묵시적으로는 `undefined`가 할당되며 초기화된다.

```js
let hi;
console.log(hi); // undefined
```

그러나 `const` 키워드를 사용하는 경우 반드시 선언과 동시에 값을 할당해줘야 한다.

```js
const hi; // Uncaught SyntaxError: Missing initializer in const declaration
```

## 결론
반드시 JavaScript ES5로 코드를 작성해야하는 안습한 경우를 제외한다면 `var` 키워드는 이제 더이상 사용하지 않는 것을 추천한다. 

그렇다면 남은 것은 `let`과 `const`인데 `이 친구들을 어떻게 사용하는 것이 좋을까?` 라는 고민이 생긴다
사실 `var` 키워드만 쓰다보니까 생각도 안해본 사실인데, 생각보다 프로그램 내부에서 `반드시 변수에 값을 재할당 해야하는 경우`는 많지 않다. 필자도 별다른 생각없이 코딩하다가 어느 날 작성했던 소스코드를 봤는데 대부분 `const` 키워드를 사용하여 변수를 선언했고 `let` 키워드는 몇군데 사용하지 않은 것을 알 수 있었다.

만약 `let` 키워드를 사용해야한다면 절대 전역 스코프에서는 사용하지말고 가능하면 블록 스코프를 작게 만들고 그 내부에서 사용하는 것을 추천한다.

그리고 `const` 키워드의 경우 값을 재할당하려고 하면 바로 에러를 뿜뿜 해주기 때문에 개발자가 의도하지 않게 변수의 값이 재할당되는 슬픈 상황을 방지할 수 있다. 그렇기에 `const` 키워드를 잘 활용하여 안전한 코딩 라이프를 즐기고 다들 야근하지말고 칼퇴하시길 바란다.

<center>
  {% asset_img 'off-work2.jpg' %}
  <sub>빨리 집에 가서 밥먹고 넷플릭스봐야지!</sub>
  <br>
</center>

이상으로 JavaScript의 let과 const, 그리고 TDZ 포스팅을 마친다.
