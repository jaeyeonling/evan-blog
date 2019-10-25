---
title: "[JS 프로토타입] 프로토타입을 사용하여 객체상속하기"
toc: true
widgets:
  - type: toc
    position: right
  - type: category
    position: right
sidebar:
  right:
    sticky: true
tags:
categories:
  - Programming
  - JavaScript
thumbnail:
---

이번 포스팅에서는 {% post_link js-prototype 이전 포스팅 %}에 이어, 프로토타입을 사용한 다양한 상속 기법에 대한 이야기를 해볼까 한다.

사실 자바스크립트에는 상속이나 캡슐화와 같은 개념이 명시적으로 존재하지는 않기 때문에 자바나 C++ 같은 클래스 기반 언어를 사용하던 개발자들은 자바스크립트에 클래스가 없다는 사실에 혼란스러워한다.

<!-- more -->

즉, 자바스크립트에서의 상속과 캡슐화 등은 `OOP(객체지향프로그래밍)`에 익숙한 개발자들이 자바스크립트에서도 이런 개념들을 가져다 사용하기 위해 프토토타입을 사용하여 이를 유사하게 구현한 일종의 디자인 패턴이라고 할 수 있다.

이번 포스팅에서는 자바스크립트에서 어떤 방식으로 OOP의 개념들을 흉내내서 구현할 수 있는지 한번 살펴보겠다.

## 프로퍼티와 메소드는 공유될 수 있다
객체의 상속을 알아보기 전에 객체를 생성할 때 프로퍼티와 메소드를 부여하는 방법에 대해서 알아보도록 하자. {% post_link js-prototype 이전 포스팅 %}에서 필자는 자바스크립트는 클래스가 아닌 `함수`를 사용하여 객체를 생성한다고 이야기 했었다.

```js
function User () {}
const evan = new User();
```

이때 `User` 함수를 생성자로 호출하면서 생성된 `evan` 객체는 `User.prototype` 객체를 원본 객체로 하여 복제된 객체이다. 그렇다면 생성자 역할을 하는 함수 내에서 `this`를 통해 이 함수에 접근해서 프로퍼티에 메소드를 정의할 수 있지 않을까?

```js
function User (name) {
  this.say = function () {
    console.log('Hello, World!');
  };
}

const evan = new User();
console.log(evan.say());
```
```text
Hello, World!
```

음, `User` 생성자 함수를 직접 호출했을때 `this`의 컨텍스트가 바뀔 수 있는 위험은 있지만 일단은 된 것 같다. 그리고 `evan` 객체는 `User.prototype` 객체를 원본 객체로 하여 복제된 객체니까 함수의 프로토타입 객체에 직접 메소드를 정의해버리는 방법도 생각해볼 수 있겠다.

```js
function User (name) {}
User.prototype.say = function () {
  console.log('Hello, World!');
}

const evan = new User();
console.log(evan.say());
```
```text
Hello, World!
```

이렇게 두 가지 방법을 사용하여 정의한 `say` 메소드는 동일한 동작을 수행하고 있기 때문에 차이가 없는 것처럼 보이지만 사실 중요한 차이가 한 가지 있다. 이 두 가지 방법의 차이는 무엇일까?

바로 생성자 함수를 통해 생성된 모든 객체들이 해당 메소드를 `공유`하고 있냐, 없냐의 차이이다.

이 차이를 알기 위해서는 자바스크립트가 객체 안에서 프로퍼티를 찾을 때 어떤 과정을 거치는 지 조금 더 자세히 뜯어볼 필요가 있다.

### 프로토타입 룩업
먼저, `User.prototype`에 메소드를 선언한 경우를 한번 살펴보도록 하자.

```js
function User () {}
User.prototype.say = function () {}
```

`User.prototype` 객체는 `User` 함수를 통해 생성된 모든 객체들이 바라보고 있는 원본 객체이다.

## 프로토타입을 사용한 객체의 상속
자바스크립트에서의 객체 상속은 객체들이 가지고 있는 자신의 원본 객체에 대한 참조인 `프로토타입 링크(Prototype Link)`를 통해서 이루어지게 된다.

이때 객체들 간의 상속 방법을 대략 두 가지 스타일로 나눠볼 수 있다. 하나는 `공유(Sharing)`이고 다른 하나는 말 그대로의 `상속(Inheritance)`이다.






