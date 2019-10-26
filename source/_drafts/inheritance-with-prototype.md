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

## 프로퍼티와 메소드는 원본 객체를 통해 공유될 수 있다
객체의 상속을 알아보기 전에 객체를 생성할 때 프로퍼티와 메소드를 부여하는 방법에 대해서 알아보도록 하자. {% post_link js-prototype 이전 포스팅 %}에서 필자는 자바스크립트는 클래스가 아닌 `함수`를 사용하여 객체를 생성한다고 이야기 했었다.

```js
function User () {}
const evan = new User();
```

이때 `User` 함수를 생성자로 호출하면서 생성된 `evan` 객체는 `User.prototype` 객체를 원본 객체로 하여 복제된 객체이다.

이때 두 가지 방법을 사용하여 새롭게 생성되는 객체들에게 프로퍼티나 메소드를 부여할 수 있는데, 첫 번째는 생성자 함수 내에서 `this`를 사용하여 선언하는 방법, 두 번째는 새롭게 생성되는 객체들이 복사할 원본 객체인 `프로토타입 객체`에 선언하는 방법이다.

먼저, `this`를 사용하여 프로퍼티나 메소드를 정의하는 방법에 대해서 살펴보자.

### 생성자 함수 내에서 this를 사용하는 방법
생성자 역할을 하는 함수 내에서 `this`는 새롭게 생성되는 객체를 의미하기 때문에, 이런 간단하고 직관적인 방법으로 객체들에게 프로퍼티나 메소드를 부여할 수 있다.

```js
function User (name) {
  'use strict';
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

참고로 생성자 함수 내에서 `strict` 모드를 사용한 이유는, 해당 생성자 함수가 실수로 `new` 예약어 없이 호출되어 `this`가 전역 객체로 평가되는 불상사를 방어하기 위해서이다.<small>(이 내용은 프로토타입과는 관련이 없기 때문에 자세히 다루지는 않겠다)</small>

이 방법은 일반적인 생성자의 사용 방법과 흡사하기 때문에 직관적으로 이해가 되는 편이고, 작동도 의도대로 되기는 한다.

이때 생성자 함수 안의 `this`는 새롭게 생성된 객체를 의미하기 때문에, 함수 내에서 `this`를 통해 정의한 프로퍼티나 메소드는 이 생성자 함수를 사용하여 객체가 생성될 때마다 새롭게 정의된다.

무슨 말인지 조금 더 쉽게 알아보기 위해 생성자 함수를 통해 두 개의 새로운 객체를 생성하고, 이 객체들의 메소드를 비교해도록 하자.

```js
const evan = new User();
const john = new User();

console.log(evan.say === john.say);
```
```js
false
```

생성자 함수가 호출돨 때 `this`는 각각 `evan` 객체와 `john` 객체를 의미했을 것이고, `say` 메소드 또한 이 객체들에 직접 정의되었을 것이다. 자바스크립트의 `완전할당연산자(===)`는 다른 메모리에 적재된 객체는 다르다고 평가하므로 이 메소드들은 각자 다른 메모리에 담긴, 전혀 다른 함수라고 할 수 있다.

이때 `evan` 객체나 `john` 객체를 출력해보면, 객체 내부에 `say` 메소드가 정의되어 있는 모습 또한 확인해볼 수 있다.

```js
console.log(evan);
```
```js
User {say: function}
```

이 당연한 이야기를 하는 이유는 바로 밑에서 후술할 `프로토타입 객체에 정의하는 방법`과 차이점을 분명히 하기 위해서이다. 프로토타입 객체를 사용해서 프로퍼티나 메소드를 정의하게되면 지금과는 전혀 다른 결과가 나온다.

### 프로토타입 객체에 정의하는 방법
이번에는 `User` 생성자 함수의 프로토타입 객체인 `User.prototype`을 사용하여 메소드를 한번 정의해보도록 하자. `this`를 통해서 정의하는 방법과 어떤 차이가 있을까?

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

일단 `this`를 사용하여 정의했던 메소드와 동일한 느낌으로 작동하고 있다. 그래서 동일한 동작이라고 생각할 수도 있지만, 사실 두 방법들 사이에는 중요한 차이가 존재한다.

바로 생성자 함수를 통해 생성된 모든 객체들이 해당 메소드를 `공유하고 있냐, 없냐`의 차이이다. 이전과 마찬가지로 두 개의 객체를 생성하고, 두 객체의 메소드를 비교해보자.

```js
const evan = new User();
const john = new User();

console.log(evan.say === john.say);
```
```js
true
```

음? 이번에는 아까와는 다르게 두 객체의 메소드가 같다고 한다. `evan.say`와 `john.say`가 객체에 따로따로 정의된 메소드가 아닌, 원본 객체의 메소드를 공유하고 있는 것이기 때문이다.

즉, 함수의 메소드가 아닌 프로퍼티를 원본 객체의 프로퍼티에 정의하게 되면 객체들이 해당 프로퍼티를 공유하기 때문에 이런 상황도 발생할 수 있다.

```js
User.prototype.name = 'Evan';

console.log(evan.name);
console.log(john.name);
```
```js
Evan
Evan
```

그렇기 때문에 각 인스턴스마다 고유한 프로퍼티를 부여하고 싶다면 원본 객체에 정의하는 것이 아니라, 생성자 함수 내에서 정의해야한다. 다시 말하지만 원본 객체에 정의한 프로퍼티나 메소드는 `공유`된다.

생성된 `evan` 객체를 한번 콘솔에 출력해보면, 원본 객체의 프로퍼티나 메소드를 공유하고 있다는 말이 무엇인지 알 수 있다.

```js
console.log(evan);
```
```js
User {}
```

`evan` 객체를 출력해보니, 이 객체는 아무 메소드나 프로퍼티도 가지고 있지 않고 텅 비어있는 친구다. 하지만 우리는 분명히 `evan.say`를 통해 해당 메소드에 접근할 수 있었다.

어떻게 이런 일이 가능한 것일까?

## 프로토타입 룩업
그 질문에 대한 해답은 바로 자바스크립트가 객체 내에서 프로퍼티를 찾는 방법 중 하나인 `프로토타입 룩업(Prototype Lookup)`에서 알아볼 수 있다. 방금 전 자바스크립트가 `evan` 객체에서 `say` 메소드를 찾아냈던 과정은 다음과 같다.

<center>
  {% asset_img prototype_lookup.png 500 %}
  <br>
</center>

{% blockquote %}
1. `evan.say`로 접근 시도
2. 어, `say` 프로퍼티가 없네? `__proto__`를 통해 원본 객체로 올라가보자!
3. `User.prototype`객체야, 너는 `say` 프로퍼티 가지고 있니?
4. 있네? Profit!
{% endblockquote %}

이런 식으로 우리가 어떤 객체의 프로퍼티에 접근을 시도했을 때, 자바스크립트는 먼저 그 객체가 해당 프로퍼티를 가지고 있는지를 확인하고, 해당 프로퍼티가 없다면 그 객체의 원본 객체로 거슬러 올라가서 다시 확인하게 된다.

이 집요한 확인 과정은 모든 객체의 조상인 `Object.prototype`에 다다를 때까지 계속되고, 만약 여기에도 존재하지 않는 프로퍼티라면 그때서야 `undefined`를 반환하게 된다.

이 말인 즉슨, 모든 객체는 자신의 프로토타입 체인 내에 있는 모든 원본 객체들의 프로퍼티나 메소드에 접근할 수 있다는 뜻이다.

쉽게 말해, 방금 생성한 `evan` 객체는 아무 프로퍼티나 메소드도 가지고 있지 않지만, 자신의 원본 객체인 `User.prorotype`에 정의된 `say` 메소드에도 접근할 수 있고, `Object.prototype`에 있는 `toString`이나 `hasOwnProperty`와 같은 메소드에도 접근할 수 있다는 것이다.

<center>
  {% asset_img prototype_lookup2.png 150 %}
  <small>evan 객체는 프토토타입 체인 내에 있는 모든 원본 객체의 프로퍼티를 공유받는다</small>
  <br>
</center>

이 프로토타입 룩업 과정은 객체의 프로퍼티나 메소드에 접근하는 그 순간마다 수행되기 때문에, 클래스가 정의될 때 모든 상속관계가 함께 평가되는 클래스 기반 언어의 상속과는 조금 다른 느낌이다. 그러나 이 프로토타입 룩업을 토대로 객체의 상속을 구현할 수 있다.

## 프로토타입을 사용한 상속
자바스크립트에서 프로토타입을 사용하여 상속을 구현하는 방법은 크게 `Object.create` 메소드를 사용하는 깔끔한 방법과 이 메소드를 사용하지않는 <small>(더러운)</small> 방법, 두 가지로 나누어질 수 있다.

사실 `Object.create`만 사용해도 프로토타입을 사용한 상속은 충분히 구현이 가능하다. 하지만 굳이 두 가지를 나눠서 이야기한 이유는, `Object.create` 메소드가 `Internet Explorer 9`부터 지원이 되기 때문이다.

하지만 필자는 필자의 행복을 위해 쓰는 포스팅에서 `IE 8`이나 `Window XP` 환경에 대한 자세한 이야기는 별로 하고 싶지 않으므로 `Object.create`를 사용하지 않는 방법에 대한 코드를 간단하게 [필자의 Github Gist 링크](https://gist.github.com/evan-moon/a7e5a51e20d22016ea443a03480765b7)로만 첨부하겠다.

### Object.create를 사용하자
`Object.create` 메소드는 첫 번째 인자로 생성할 객체의 원본 객체가 될 객체, 두 번째 인자로 새로 생성할 객체에 추가할 프로퍼티를 객체 타입으로 받는다.

```js
Object.create(proto: Object, properties?: Object);
```

이때 두 번째 인자는 선택사항이며, 단순하게 `{ test: 1 }`처럼 넘기는 것이 아니라, `Object.defineProperties` 메소드를 사용할 때 처럼 데이터 서술자와 접근 서술자를 지정해줘야한다.

```js
Object.create(User.prototype, {
  foo: {
    configurable: false,
    enumerable: true,
    value: 'I am Foo!',
  }
});
```

자세한 프로퍼티들의 의미는 [MDN Web Docs: Object.defineProperties](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)에서 확인해보도록 하자.

이 메소드에서 중요한 포인트는 `객체의 프로토타입 객체`를 지정할 수 있다는 것이며, 이 말인 즉슨 객체의 프로토타입 체인을 내 맘대로 정해줄 수 있다는 것이다. 심지어 동적으로 변경도 가능하다.<small>(사실 이게 JS의 변태적인 면...)</small>

그럼 이제 `Object.create` 메소드와 프로토타입을 사용하여 상속을 한번 구현해보도록 하자.

```js
function SuperClass (name) {
  this.name = name;
}
SuperClass.prototype.say = function () {
  console.log(`I am ${this.name}`);
}
```

우선 부모 클래스 역할을 할 `SuperClass` 생성자 함수를 생성하고, 이 함수의 프로토타입 객체에 `say` 메소드를 정의했다. 그럼 이제 자식 클래스 역할을 할 생성자 함수를 구현하고, 이 두 개의 함수의 상속 관계도 함께 정의해보자.

```js
function SubClass (name) {
  SuperClass.call(this, name);
}
SubClass.prototype = Object.create(SuperClass.prototype);
SubClass.prototype.constructor = SubClass;
SubClass.prototype.run = function () {
  console.log(`${this.name} is running`);
}
```

`Function.prototype.call` 메소드는 호출된 함수의 실행 컨텍스트를 첫번째 인자로 받은 녀석으로 변경한다. 즉, `this`의 타겟을 변경하는 것이다.

즉, `SuperClass.call(this, name)`의 의미는 부모 생성자 함수의 생성자를 호출하되, 실행 컨텍스트를 자식 생성자 함수로 변경하라는 의미인 것이다. 자바로 치면 `super` 메소드를 호출하는 것과 비슷하다.

즉, 부모 생성자 함수의 실행 컨텍스트만 변경해주면 장땡이기 때문에 `apply` 메소드를 사용하여 호출해도 상관없다.

그 후 `SuperClass.prototype` 객체를 원본 객체로 하는 새로운 객체로 `SubClass`의 프로토타입 객체를 변경해준다. 자식 생성자 함수의 프로토타입 객체와 부모 생성자 함수의 프로토타입 객체 간의 프로토타입 체인, 즉 부모 자식 관계를 만들어 주는 것이다.

이렇게 되면 자식 생성자 함수의 프로토타입 객체는 부모 생성자 함수 프로토타입 객체를 그대로 복제하여 생성된다. 즉, 자식 생성자 함수의 `constructor` 프로퍼티가 부모 생성자 함수를 가르키고 있다는 것이다. 하지만 자식 생성자 함수인 `SubClass`를 통해 생성된 객체가 `SuperClass`를 사용하여 생성된 것처럼 처리되면 안되므로, 다시 `constructor` 프로퍼티를 `SubClass`로 변경해줘야한다.

이 과정을 거치면 대략 다음과 같은 관계가 성립된다.

<center>
  {% asset_img extends.png 500 %}
  <br>
</center>

이제 한번 `SubClass` 생성자 함수를 사용하여 객체를 생성해보고, 제대로 부모 생성자 함수의 속성들을 물려받았는지 확인해보자.

```js
const evan = new SubClass('Evan');
console.log(evan);
console.log(evan.__proto__);
console.log(evan.__proto__.__proto__)
```
```js
SubClass { name: 'Evan' } // 에반 객체
SubClass { constructor: [Function: SubClass], run: [Function] } // 에반 객체의 원본 객체
SuperClass { say: [Function] } // 에반 객체의 원본 객체의 원본 객체
```

`evan` 객체는 `SubClass`의 프로토타입 객체를 복제해서 정상적으로 생성되었고, `evan` 객체의 원본 객체와 원본 객체의 원본 객체도 잘 체이닝되어있다.

즉, `evan -> SubClass.prototype -> SuperClass.prototype`으로 이어지는 프로토타입 체인이 완성된 것이다. 이때 `evan` 객체의 `run`이나 `say` 메소드를 호출하면, 위에서 언급한 프로토타입 룩업을 통해 원본 객체의 메소드를 호출할 수 있다.

## 마치며
{% post_link js-prototype 이전 포스팅 %}에 이어 이번에는 자바스크립트에서 프로토타입을 활용한 상속 패턴에 대한 내용을 한번 다뤄보았다.

솔직히 말해서, 필자가 실무에서 이러한 패턴을 사용해서 상속을 구현해본 경험은 거의 없다. 필자가 개발자로 일을 시작하고 얼마 되지 않아 ES6가 나오기도 했었고, 필자는 당시 자바가 더 익숙했기 때문에 새로 추가된 `class` 키워드에 흠뻑 빠져있었다.

하지만 일을 시작하고 몇 년이 지나면서 레거시 코드에서 이 상속 패턴을 꽤 마주치기도 했고, 면접에서 이런 패턴에 대해서 물어보는 경우도 있었기 때문에 확실히 공부할 필요는 있는 것 같다.

아무리 요즘 ES5를 거의 사용하지 않는다고 하지만, 사실 이런 상속 패턴이 자바스크립트를 사용한 프로그램 아키텍처의 근간이기도 하니 말이다.

이상으로 [JS 프로토타입] 프로토타입을 사용하여 객체상속하기 포스팅을 마친다.
