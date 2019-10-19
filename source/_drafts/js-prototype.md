---
title: 자바스크립트의 프로토타입에 대해(가제)
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
  - 프로토타입
  - 자바스크립트
  - JavaScript
  - Prototype
categories:
   - Programming
   - JavaScript
thumbnail:
---

이번 포스팅에서는 자바스크립트(JavaScript)하면 빠질 수 없는 `프로토타입(Prototype)`에 대해서 한번 이야기해보려고 한다.

필자가 처음 프론트엔드 개발을 시작했을때는 자바스크립트의 `ES5` 버전을 사용하고 있던 시절이었는데, 기존에는 자바(Java)를 주로 사용하고 있던 필자가 프론트엔드 개발로 넘어오면서 제일 애먹었던 부분이 바로 이 프로토타입이었다.

<!-- more -->

물론 지금은 자바스크립트의 위상이 많이 올라가면서 프로토타입 패턴에 대한 관심도 많아지기 시작했지만, 그래도 여전히 주류는 C 계열 언어나 Java에서 사용하는 클래스를 기반으로한 객체 생성 방식이다. 

그래서 자바스크립트를 처음 접하는 개발자에게 프로토타입을 사용한 객체 생성 방식은 낯선 방식이었고, 이로 인해 기존 개발자들이 자바스크립트로 진입하는데 어려움이 있었다. 그런 이유로 ES6에서는 `class` 예약어가 등장한 것이다.<small>(클래스로 위장한 프로토타입...)</small>

사실 필자도 아직 클래스 기반의 객체 생성 방식이 익숙하기 때문에 프로토타입에 대한 공부가 더 필요하다. 그래서 이번 포스팅에서는 프로토타입 패턴에 대해서 한번 이야기해보려고 한다.

## ES6부터 클래스를 지원하는데도 프로토타입을 굳이 알아야 하나요?
일단 ES6에서 지원하고 있는 `class` 예약어는 클래스의 탈을 쓴 프로토타입이다. 많은 개발자들이 자바스크립트의 클래스를 단순한 `문법 설탕(Syntactic Sugar)`라고 이야기하지만, 정확히 말하자면 단순한 문법 설탕은 아니다.

문법 설탕이라는 단어는 다음과 같은 뜻을 가진다.
> 해당 문법이 사라져도 그 언어가 제공하는 기능과 표현력을 동일하게 유지할 수 있다

그러나 자바스크립트의 클래스는 ES5 시절 프로토타입을 사용하여 객체를 생성했던 방법보다 더 엄격한 제약을 가지고 있기 때문에 정확히 말하자면 문법 설탕이라기보다 `상위 요소(Superset)`라고 할 수 있다.

그러면 그냥 클래스를 쓰면 되는데 왜 프로토타입을 알아야 하는 것일까?

그 이유는 아무리 자바스크립트가 `class` 예약어를 지원한다고 해도 결국 그 클래스 또한 프로토타입을 사용하여 만들기 때문이다. 결국 자바스크립트는 프로토타입 기반의 언어이다.

그리고 예전에 작성된 레거시 프론트엔드 코드의 경우에는 ES5로 작성된 것도 많기 때문에 아직까지 프론트엔드 개발자들은 ES5를 만져야하는 경우가 왕왕 있는 것이 현실이다. 물론 ES5를 ES6 이상의 버전으로 마이그레이션하려고 해도 기존의 프로토타입 기반의 객체 생성이나 상속으로 구현된 코드를 이해할 수 없다면 마이그레이션 또한 불가능하다.

## 프로토타입은 디자인 패턴이다
`프로토타입`이라고 하면 일반적으로 자바스크립트를 떠올리지만, 사실 프로토타입은 자바스크립트에서만 사용되는 것은 아니고, 그냥 일종의 디자인 패턴 중 하나이다. 그래서 `ActionScript`, `Lua`, `Perl` 등 프로토타입 기반 프로그래밍을 지원하는 다른 언어도 많다.

그래서 자바스크립트의 프로토타입을 자세히 알아보기 전에 디자인 패턴으로써의 프로토타입을 먼저 알아볼까 한다.

프로토타입 패턴은 [추상 팩토리 패턴](https://ko.wikipedia.org/wiki/%EC%B6%94%EC%83%81_%ED%8C%A9%ED%86%A0%EB%A6%AC_%ED%8C%A8%ED%84%B4)과 마찬가지로 `객체를 효율적으로 생성하는 방법`을 다루는 패턴인데, 주로 객체를 생성하는 비용이 클 때 이를 회피하기 위해 사용된다.

객체를 생성할 때의 비용이 크다는 말은 말 그대로 객체를 생성할 때마다 뭔가 일을 많이 해야한다는 뜻이다.

예를 들어 RPG 게임의 캐릭터를 하나 구현해본다고 생각해보자. 이 캐릭터는 여러가지 장비를 장착할 수 있는 기능을 가지고 있는데, 처음 캐릭터가 생성될 때 딸랑 맨 몸으로 시작하면 유저들이 싫어할 것 같으니 기본적인 장비 몇 가지를 장착한 상태로 생성될 수 있도록 만들어주려고 한다.

```java Player.java
class Weapon {}
class Armor {}
class BasicSward extends Weapon {}
class BasicArmor extends Armor {}

class Player {
    private Weapon weapon;
    private Armor armor;

    public Player() {
        this.weapon = new BasicSward(); // 초심자의 목도
        this.armor = new BasicArmor(); // 초보자용 갑주
    }
}
```

간단하게 만들어보면 대충 이런 느낌이다. `Player` 객체는 자신이 생성될 때 `BasicSward` 객체와 `BasicArmor` 객체까지 함께 생성해야한다.

이런 경우 그냥 `Player` 객체만 생성하는 상황보다는 `객체의 생성 비용이 높다`고 할 수 있다. 게다가 캐릭터 생성 시 처음 부여하는 아이템의 종류가 많아질수록 `Player`의 객체의 생성 비용 또한 계속 높아질 것이다.

음... 근데 곰곰히 생각해보니, 캐릭터가 처음 생성되며 가지고 있는 아이템이 항상 같다는 전제 조건이 있다면 생성 비용이 높은 `Player`객체를 딱 한번만 생성하고 그 다음부터는 생성된 객체를 복사해서 사용해도 될 것 같다는 생각이 든다.

```java
// 이건 너무 객체 생성 비용이 높으니까...
Player evan = new Player();
Player john = new Player();
Player wilson = new Player();

// 이런 방법으로 접근해보는 것은 어떨까?
Player player = new Player();
Player evan = player.clone();
Player john = player.clone();
Player wilson = player.clone();
```

이런 관점으로 접근하는 것이 바로 프로토타입 패턴이라고 할 수 있다. 프로토타입, 즉 `원본 객체`가 존재하고 그 객체를 복제해서 새로운 객체를 생성하는 방법인 것이다.

실제로 자바에서 프로토타입 패턴을 사용할때, 복제 대상이 되는 클래스는 보통 `Cloneable` 인터페이스를 사용하여 구현한다. Cloneable 클래스는 `clone` 메소드를 가지고 있기 때문에, 이 클래스를 상속받은 클래스는 반드시 `clone` 메소드를 오버라이딩해서 구현해야한다.

```java
class Player implements Cloneable {
  //...
  @Override
  public Player clone () throws CloneNotSupportedException {
      return (Player)super.clone();
  }
}
```

`clone` 메소드를 구현하고나면 이제 `Player` 객체는 복사 가능한 객체가 된다. 즉, 다른 객체들의 프로토타입이 될 수 있는 기능을 가지게 되었다는 것이다.

이제부터는 `Player` 객체를 추가로 생성하고 싶을 때는 기존에 생성되어 있던 객체를 그대로 복사하면 되기 때문에 높은 객체 생성 비용이 드는 것을 피할 수 있다.

```java
Player evan = new Player();
Player evanClone = evan.clone();
```

또한 `Player` 객체는 복사되어 새로운 메모리 공간을 할당받지만, 깊은 복사를 하지 않는 이상 `Player`객체가 가지고 있는 `BasicSward` 객체와 `BasicArmor` 객체는 새롭게 생성되지 않고 기존에 이 객체들이 할당된 메모리 공간을 참조하기만 한다.

즉, 메모리 공간을 아낄 수도 있다는 것이다. 자바스크립트에서 원시 자료형은 `Call by value`, 그 외 자료형은 `Call by reference`를 사용하는 것과 동일한 원리이다.

하지만 그 말인 즉슨 잠깐 정신줄 놓고 코딩하다보면 이런 상황도 발생할 수 있다는 뜻이다.

```java
Player evan = new Player();
try {
  Player evanClone = evan.clone();
  evanClone.weapon.attackPoint = 40;
  System.out.println("에반 무기 공격력 -> " + evan.weapon.attackPoint);
  System.out.println("에반 복사본 무기 공격력 -> " + evanClone.weapon.attackPoint);
}
catch (Exception e) {
    System.err.println(e);
}
```

```string
에반 무기 공격력 -> 40
에반 복사본 무기 공격력 -> 40
```

<center>
  {% asset_img overtime_work.jpg 400 %}
  <small>디버깅 지옥이 펼쳐진다...</small>
  <br>
</center>

정리해보자면 프로토타입 패턴이란, `객체를 생성할 때 원본이 되는 객체를 복사해서 생성하는 패턴`이라고 할 수 있다. 자바스크립트의 프로토타입은 이것보다는 약간 더 복잡하게 구현되어있지만 근본적인 원리 자체는 프로토타입 패턴을 따라간다.

그럼 이제 자바스크립트가 객체를 생성할 때 프로토타입 패턴을 어떤 식으로 사용하고 있는 지 한번 알아보도록 하자.

## 자바스크립트의 프로토타입
자바스크립트의 프로토타입 또한 기본적으로 프로토타입 패턴을 사용하여 구현한 것이기 때문에 위에서 설명한 내용과 크게 다르지 않다.

단, 자바스크립트는 프로토타입 기반 프로그래밍을 지원하는 만큼, 자바스크립트 내에서 사용되는 모든 객체들이 프로토타입으로 연결되어 있다는 점이 다르다.

만약 ES5에서 Array 객체를 참조하여 생성되는 모든 객체에 동일한 메소드를 추가하고 싶다면 우리는 이런 코드를 작성한다.

```js
Array.prototype.print = function () {
  console.log(this);
}

const arr = [1, 2, 3];
arr.print();
```
```text
[1, 2, 3]
```
