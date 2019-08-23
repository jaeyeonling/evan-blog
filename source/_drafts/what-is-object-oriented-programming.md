---
title: 알고 보면 재밌는 객체 지향 프로그래밍, OOP 흝어보기
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
  - OOP
  - 객체지향프로그래밍
  - Object Oriendted Programming
categories:
  - Methodology
thumbnail:
---

이번 포스팅에서는 `객체 지향 프로그래밍(Object-Oriented Programming)`, 줄여서 흔히들 OOP라고 부르는 설계 방법론에 대해서 이야기해보려고 한다. OOP는 프로그래밍의 설계 패러다임 중 하나로, 현실 세계를 프로그램 설계에 반영한다는 개념을 기반으로 접근하는 방법이다. OOP는 90년대 초반부터 유명해지기 시작했지만 아직까지도 전 세계의 많은 프로그래머들이 사용하고 있는 설계 패턴 중 하나이기 때문에 알아둬서 나쁠 건 없다.
<!-- more -->

## 객체 지향 프로그래밍을 알면 좋은 이유
사실 OOP가 오랜 기간동안 전 세계에서 사랑받고있는 설계 패턴인 것은 맞지만 최근에는 OOP의 단점을 이야기하며 `함수형 프로그래밍`과 같은 새로운 설계 패러다임이 제시되기도 한다. 사실 `OOP`니 `함수형 프로그래밍`이니 하는 이런 것들은 결국 `프로그램을 어떻게 설계할 것인가?`에 대한 방법이기 때문에 당연히 장단점 또한 존재하기 마련이고 이에 따른 개선된 방안이 제시되는 것은 자연스러운 흐름이다.

필자는 개인적으로 아직까지는 OOP가 좋은 설계 패턴이라고 생각하고 있지만, 물론 그렇게 생각하지 않는 사람도 당연히 존재한다. 단, 어떤 기술을 선택할 때는 해당 기술의 장단점과 그 기술을 선택했을 때 얻을 수 있는 것과 잃을 수 있는 것을 제대로 파악하고 있어야 올바른 선택을 할 수 있기 때문에 여러분이 함수형 프로그래밍을 선택한다고 하더라도 OOP가 무엇인지 알고 있어야 하는 것은 마찬가지다.

그래서 이번 포스팅에서는 OOP가 추구하는 것이 무엇인지, 또 OOP를 이루고 있는 개념들은 무엇이 있는지 간략하게 살펴보려고 한다.

## 객체 지향이라는 것은 무엇을 의미하나요?
Object-Oriented Programming의 `Object-Oriented`를 한국말로 그대로 직역하면 `객체 지향`이다. 여기서 말하는 객체는 현실 세계에 존재하는 하나하나의 독립된 무언가를 의미한다. 보통 OOP를 배울 때 가장 처음 접하는 개념이 바로 이 `객체`라는 개념인데, 사실 한번 이해하고나면 꽤 간단한 개념이지만 우리가 평소에 살면서 잘 생각해보지 않는 개념이기 때문에 잘 이해가 되지 않을 수도 있다.

`객체`를 설명하기 위해서는 `클래스`라는 개념을 함께 설명해야하는데, 용어가 직관적이지 않아서 그렇지 조금만 생각해보면 누구나 다 이해할 수 있는 개념이다. 일반적으로 이걸 설명할 때 붕어빵과 붕어빵 틀과 같은 비유를 들며 설명하지만 필자는 일반적인 설명과 다르게 `클래스는 무엇이고, 객체는 무엇이다`라는 방식으로 접근하기보다는 일단 OOP의 포괄적인 설계 개념을 먼저 설명하는 방식으로 접근하도록 하겠다.

### 클래스와 객체
필자는 이 포스팅의 서두에서 OOP란 `현실 세계를 프로그램의 설계에 반영하는 것`이라고 이야기했다. 이 말이 뜻하는 의미를 먼저 이해하고 나면 클래스나 객체 같은 것은 자연스럽게 이해할 수 있으니 먼저 OOP가 왜 현실 세계를 반영한 설계 방식이라고 하는 지를 먼저 알아보도록 하자.

뭐 여러가지 예시가 있겠지만 우리가 일상적으로 사용하고 있는 물건을 예로 드는 것이 좀 더 와닿을테니 필자는 `스마트폰`을 예로 들어서 설명을 진행하려고 한다. 필자는 애플에서 만든 `iPhone7`이라는 기종을 사용하고 있기 때문에 iPhone7을 예시로 설명을 시작하겠다.

<center>
  {% asset_img iphone7.jpg 400 %}
  <br>
</center>

먼저, `iPhone7`이 무엇인지부터 정의해보자. 너무 어렵게 생각할 필요없다. 필자가 지금 바로 생각해낸 iPhone7의 특징은 약간 동글동글한 바디를 가지고 있고 햅틱 엔진이 내장된 홈 버튼을 가지고 있으며, 시리즈 최초로 3.5mm 이어폰 단자가 없어진 `iPhone` 시리즈라는 것이다.

우리는 여기서 한발짝 더 나아가서 iPhone7의 상위 개념인 iPhone에 대해서도 정의해볼 수 있다. 결국 iPhone7은 iPhone이라는 개념을 기반으로 확장된 개념이기 때문이다. 그럼 `iPhone`은 무엇일까?

iPhone은 애플에서 제조한 스마트폰으로, iOS를 사용하고 있는 스마트폰 시리즈의 명칭이다. 모든 iPhone은 물리버튼인 홈 버튼을 가지고 있다. 또한 iPhone은 iPhone7 외에도 iPhoneX, iPhone8, iPhone SE 등 수많은 iPhone 제품들을 포함하는 좀 더 포괄적인 개념이다.

여기서 중요한 점은 하위 개념인 iPhone7은 상위 개념인 iPhone의 특징을 모두 가지고 있다는 것이다. 한번만 더 해보도록 하자. iPhone의 상위 개념은 무엇일까?

iPhone은 애플에서 제조하고 iOS를 사용하는 스마트폰의 명칭이다. 즉, iPhone의 상위 개념은 `스마트폰`이라고 할 수 있다. 이런 식으로 우리는 `iPhone7`이라는 개념에서 출발하여 계속해서 상위 개념을 정의해나갈 수 있다.

> iPhone7 -> iPhone -> 스마트폰 -> 휴대전화 -> 무선 전화기 -> 전화기 -> 통신 기기 -> 기계...

결국 이렇게 개념을 확장을 해나가면서 설계하는 것이 OOP의 기초이고, 이때 `iPhone7`, `iPhone`과 같은 개념들을 `클래스(Class)`라고 부르는 것이다. 그리고 방금 했던 것처럼 상위 개념을 만들어나가는 행위 자체를 `추상화(Abstraction)`라고 한다. 추상화는 밑에서 다시 한번 설명할테니 일단 지금은 클래스라는 개념만 기억하도록 하자.

그럼 `객체(Object)`는 무엇일까? 필자는 방금 클래스를 설명하면서 `개념`이라는 단어를 굉장히 많이 사용했다. 말 그대로 클래스의 역할은 어떠한 개념을 의미하는 것이다. 하지만 개념이라는 것 그 자체 만으로는 현실의 물건이 될 수는 없는 법이다.

잘 생각해보면 iPhone7이라는 것 또한 그냥 어떠한 제품 라인의 이름이다. iPhone7 클래스에는 CPU, 디스플레이 해상도, 메모리와 같은 사양이 정의되어있을 것이고 이를 기반으로 공장에서 `실제 iPhone7`을 찍어내고 일련번호를 부여한 후 출고하고나면 그제서야 우리 손에 잡을 수 있는 물건인 iPhone7이 되는 것이다. 이때 이렇게 생산된 iPhone7을이 `객체`라고 할 수 있다.

> 즉, `클래스`는 일종의 설계도이고 이것을 사용하여 우리가 사용할 수 있는 실제 물건으로 만들어내는 행위가 반드시 필요하다. 그리고 `객체`는 클래스를 사용하여 생성한 실제 물건이다.

이러한 OOP의 설계 접근 방식으로 우리의 일상 속에 보이는 대부분의 개념들을 추상화할 수 있는데, 그냥 평소에 보이는 모든 것들을 이렇게 추상화해보는 연습을 하면 나름 재미도 있다. 몇가지 예를 들어보겟다.

***
- 소나타 -> 중형 세단 -> 세단 -> 자동차 -> 이동수단
- 문동욱 -> 남자 -> 인간 -> 영장류 -> 포유류 -> 동물
- 오버워치 -> 블리자드가 만든 FPS 게임 -> FPS 게임 -> 게임
***

결국 `객체지향`이라는 말의 의미는 이렇게 클래스들을 정의하고, 그 클래스를 사용하여 실제로 사용할 객체를 만들어냄으로써 현실 세계의 모든 것을 표현할 수 있다는 개념으로 출발하는 것이다. 그리고 실제로 거의 대부분의 개념은 이런 추상화 기법으로 어느 정도 정리할 수 있다.

### 추상화에 대해서 조금 더 깊이 생각해보자
방금 우리는 iPhone7부터 시작해서 상위 개념을 이끌어내는 간단한 추상화를 경험해보았다. 하지만 우리가 방금 저 예시를 진행할 때는 그렇게까지 깊은 고민이 없었을 것이다. 왜냐면 iPhone이나 스마트폰 같은 개념은 이미 우리에게 상당히 친숙한 개념이기 때문에 깊이 고민할 필요없이 이미 여러분의 머릿속에 어느 정도 추상화가 되어 정리된 상태였기 때문이다.

하지만 실제로 프로그램 설계에 OOP를 사용할 때에는 우리에게 친숙한 iPhone과 같은 개념을 사용하는 것이 아니라 개발자가 이 개념 자체부터 정의해야하는 경우가 많다. 이때 추상화가 어떤 것인지 정확히 이해하고 있지 않다면 자칫 이상한 방향으로 클래스를 설계할 수 있기 때문에 정확히 추상화가 무엇인지 짚고 넘어가도록 하겠다.

`추상`이라는 단어의 뜻부터 한번 생각해보자. `추상`은 어떠한 존재가 가지고 있는 여러가지의 속성 중에서 특정한 속성을 가려내어 포착하는 것을 의미한다. 대표적인 추상파 화가 중 한명인 피카소가 소를 점점 추상화하며 그려가는 과정을 한번 살펴보면 추상화가 어떤 것인지 조금 더 이해가 된다.

<center>
  {% asset_img picasso_bull.jpg 500 %}
  <small>피카소가 소를 추상화하는 과정</small>
  <br>
</center>

이렇듯, 추상화라는 것은 그 존재가 가지고 있는 가장 특징적인 속성들을 파악해나가는 것을 의미한다.

우리가 방금 전 iPhone7의 상위 개념인 iPhone을 떠올리게 되는 과정은 꽤나 직관적으로 진행되었지만 사실 추상화를 그렇게 직관적으로 접근하려고 하면 더 방향을 잡기가 힘들다. 원래대로라면 iPhone이라는 상위 개념을 만들고자 했을 때 iPhone7 뿐만이 아니라 다른 iPhone 시리즈들까지 모두 포함할 수 있는 iPhone들의 공통된 특성을 먼저 찾는 것이 올바른 순서이다. 이렇게 만들어진 올바른 상위 개념의 속성은 그 개념의 하위 개념들에게 공통적으로 적용할 수 있는 속성이 된다.

{% blockquote %}
**상위 개념**
iPhone: 애플에서 만든 iOS 기반의 스마트폰

**iPhone 기반의 하위 개념**
iPhoneX: 애플에서 만든 iOS 기반의 스마트폰이며, 홈 버튼이 없고 베젤리스 디자인이 적용된 아이폰
iPhone7: 애플에서 만든 iOS 기반의 스마트폰이며, 햅틱 엔진이 내장된 홈 버튼을 가지고 있는 아이폰.
iPhone SE: 애플에서 만든 iOS 기반의 스마트폰이며, 사이즈가 작아서 한 손에 잡을 수 있는 아이폰.
{% endblockquote %}

이 예시에서 볼 수 있듯이 하위 개념들은 상위 개념이 가지고 있는 모든 속성을 그대로 물려받는데, 그래서 이 과정을 `상속(Inheritance)`이라고 한다. 이 상속에 관해서는 밑에서 다시 자세하게 살펴보도록 하겠다.

## 객체 지향 프로그래밍의 요소들
방금까지 설명한 클래스, 객체, 추상화는 OOP를 이루는 근본적인 개념들이다. 필자는 여기서 좀 더 나아가서 OOP를 지원하는 언어들이 기본적으로 갖추고 있는 몇가지 개념을 더 설명하려고 한다. OOP는 그 특성 상 클래스와 객체를 기반으로 `조립`하는 형태로 프로그램을 설계하게 되는데 이때 이 조립을 더 원활하게 하기 위해서 나온 유용한 몇가지 개념들이 있다.

하지만 이 개념들은 JavaScript에는 구현되지 않은 개념도 있으므로 이번에는 `Java`를 사용해서 예제를 진행하도록 하겠다. 단편적인 문법만 보면 그렇게 이질감 느껴질 정도로 차이가 크지 않기 때문에 JavaScript만 하셨던 분들도 아마 금방 이해할 수 있을 것이다.

그럼 이제 객체 지향의 3대장이라고 불리는 `상속`과 `캡슐화`, 그리고 `다형성`에 대해서 간단하게 알아보도록 하자.

### 상속
`상속(Inheritance)`은 방금 전 추상화에 대한 설명을 진행하면서 한번 짚고 넘어갔더 개념이다. OOP를 제공하는 많은 프로그래밍 언어에서 상속은 `extends`라는 예약어로 표현하는데, 상위 개념 입장에서 보면 자신의 속성들이 하위 개념으로 넘어가면서 확장되는 것이므로 이 말도 맞다. 그럼 이제 상속이 어떻게 이루어지는지 코드로 살펴보도록 하자.

```java
class IPhone {
    String manufacturer = "apple";
    String os = "iOS";
}
  
class IPhone7 extends IPhone {
    int version = 7;
}
  
class Main {
    public static void main (String[] args) {
        IPhone7 myIPhone7 = new IPhone7();

        System.out.println(myIPhone7.manufacturer);
        System.out.println(myIPhone7.os);
        System.out.println(Integer.toString(myIPhone7.version));
    }
}
```
```text
apple
iOS
7
```

`IPhone7` 클래스를 생성할 때 `extends` 예약어를 사용하여 `IPhone` 클래스를 상속받았다. `IPhone7` 클래스에는 `manufacturer`와 `os` 속성이 없지만 부모 클래스인 `IPhone` 클래스의 속성을 그대로 물려받은 것을 볼 수 있다.

마찬가지로 이 상황에서 `IPhoneX` 클래스를 새로 만들어야 할때도 `IPhone` 클래스를 그대로 다시 사용할 수 있다.

```java
class IPhoneX extends IPhone {
    int version = 10;
}
```

즉, 추상화가 잘된 클래스를 하나만 만들어놓는다면 그와 비슷한 속성이 필요한 다른 클래스를 생성할 때 그대로 재사용할 수 있다는 말이다. 그리고 만약 iPhone 시리즈 전체에 걸친 변경사항이 생겼을 때도 `IPhone7`, `IPhoneX`와 같은 클래스는 건드릴 필요없이 `IPhone` 클래스 하나만 고치면 이 클래스를 상속받은 모든 하위 클래스에도 자동으로 적용되므로 개발 기간도 단축시킬 수 있고 휴먼 에러가 발생할 확률도 줄일 수 있다.

하지만 여기서 만약 요구사항이 변경되어서 Galaxy 시리즈를 만들어야한다면 어떻게 될까? 상황에 따라서 `IPhone` 클래스를 그대로 냅두고 그냥 `Galaxy` 클래스를 새로 만들 수도 있지만 여기서 `SmartPhone`이라는 한단계 더 상위 개념을 만드는 방향으로 가닥을 잡을 수도 있다.

```java
class SmartPhone {
    SmartPhone (String manufacturer, String os) {
        this.manufacturer = manufacturer;
        this.os = os;
    }
}

class IPhone extends SmartPhone {
    IPhone () {
        super("apple", "iOS");
    }
}
class Galaxy extends SmartPhone {
    Galaxy () {
        super("samsung", "android");
    }
}
  
class IPhone7 extends IPhone {
    int version = 7;
}
class GalaxyS10 extends Galaxy {
    String version = "s10";
}
```

위의 코드에서 `super` 메소드는 부모 클래스의 생성자를 호출하는 메소드이다. 부모 클래스를 `Super Class`, 자식 클래스를 `Sub Class`라고 부르기도 하기 때문에 부모와 관련된 키워드 역시 `super`를 사용하는 것이다.

그리고 이때 자식 클래스인 `IPhone7`이나 `GalaxyS10` 클래스가 부모 클래스의 `manufacturer`나 `os` 속성을 덮어쓰게 할 수도 있는데, 이러한 작업을 `오버라이딩(Overriding)`이라고 한다. 안드로이드 개발을 하다보면 밥먹듯이 쓰는 `@Override` 데코레이터도 부모 클래스의 메소드를 덮어쓰는 방식으로 세부 구현을 진행하는 것이다.

이러한 OOP의 클래스 의존관계는 클래스의 재사용성을 높혀주는 방법이기도 하지만, 너무 클래스의 상속 관계가 복잡해지게 되면 개발자가 전체 구조를 파악하기가 힘들다는 단점도 가지고 있으므로 개발자가 확실한 의도를 가지고 적당한 선에서 상속 관계를 설계하는 것이 중요하다.<small>(근데 이 기준이 사람마다 다 다르다)</small>

### 캡슐화
`캡슐화(Encapsulation)`는 어떠한 클래스를 사용할 때 내부 동작이 어떻게 되는 지 모르더라도 사용법만 알면 쓸 수 있도록 클래스 내부를 감추는 기법이다. 클래스를 캡슐화 함으로써 클래스를 사용하는 쪽에서는 머리 아프게 해당 클래스의 내부 로직을 파악할 필요도 없다. 또한 클래스 내에서 사용되는 변수나 메소드를 감출 수 있기 때문에 필요 이상의 변수나 메소드가 클래스 외부로 노출되는 것을 방어햐여 보안도 챙길 수 있다.

이렇게 클래스 내부의 데이터를 감추는 것을 `정보 은닉(Information Hiding)`이라고 하며, 보통 `public`, `private`, `protected` 같은 접근제한자를 사용하여 원하는 정보를 감추거나 노출시킬 수 있다.

```java Capsulation.java
class Person {
    public String name;
    private int age;
    protected String address;

    public Person (String name, int age, String address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }
}
```

자 이렇게 간단한 클래스를 하나 만들어보았다. `Person` 클래스는 생성자의 인자로 들어온 값들을 자신의 멤버 변수에 할당하는데, 이 멤버 변수들은 각각 `public`, `private`, `protected`의 접근제한자를 가지고 있는 친구들이다. 그럼 한번 객체를 생성해보고 이 친구들의 멤버 변수에 접근이 가능한지를 알아보자.

```java Capsulation.java
class CapsulationTest {
    public static void main (String[] args) {
        Person evan = new Person("Evan", 29, "Seoul");
        System.out.println(evan.name);
        System.out.println(evan.age);
        System.out.println(evan.address);
    }
}
```

자, 여기까지 직접 작성해보면 알겠지만 Java는 컴파일 언어이기 때문에 굳이 실행시켜보지 않더라도 IDE에서 이미 알아서 다 분석을 끝내고 빨간줄을 쫙쫙 그어주었을 것이다.

<center>
  {% asset_img private_error.png 500 %}
  <br>
</center>

에러가 난 부분은 `private` 접근제한자를 사용한 멤버변수인 `age`이다. 이처럼 `private` 접근제한자를 사용하여 선언된 멤버 변수나 메소드는 클래스 내부에서만 사용될 수 있고 외부로는 아예 노출 자체가 되지 않는다. `public`과 `protected`를 사용하여 선언한 멤버 변수인 `name`과 `address`는 정상적으로 접근이 가능한 상태이다.

`public` 같은 경우는 이름에서 바로 알 수 있듯이 클래스 외부에서 마음대로 접근할 수 있도록 열어주는 접근제한자인데, `protected`는 왜 외부에서 접근이 가능한 것일까? 이름만 보면 왠지 이 친구도 `private`처럼 접근이 막혀야할 것 같은데 지금은 접근이 가능한 상태다.

`protected` 접근제한자는 해당 클래스를 상속받은 클래스와 같은 패키지 안에 있는 클래스가 아니면 모두 접근을 막는 접근제한자인데, 위의 예시의 경우 필자는 `Person` 클래스와 `CapsulationTest` 클래스를 같은 파일에 선언했으므로 같은 패키지로 인식되어 접근이 가능했던 것이다.

그럼 `Person` 클래스를 다른 패키지로 분리해내면 어떻게 될까? 테스트 해보기 위해 먼저 `MyPacks`라는 디렉토리를 생성하고 그 안에 `Person.java` 파일을 따로 분리하여 별도의 패키지로 선언해주겠다.

```java MyPacks/Person.java
package MyPacks;

public class Person {
    public String name;
    private int age;
    protected String address;

    public Person (String name, int age, String address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }
}
```
```java Capsulation.java
import MyPacks.Person;

class CapsulationTest {
    public static void main (String[] args) {
        Person evan = new Person("Evan", 29, "Seoul");
        System.out.println(evan.name);
        System.out.println(evan.address);
    }
}
```

이렇게 `Person` 클래스를 별도의 패키지로 분리하면 이제 `evan.address`에도 빨간 줄이 쫙 그어진다.

<center>
  {% asset_img protected_error.png 500 %}
  <br>
</center>

이렇게 외부 패키지로 불러온 클래스 내부 내의 `protected` 멤버 변수나 메소드에는 바로 접근할 수 없다. 단, 해당 클래스를 상속한다면 그 자식 클래스 내에서는 그대로 접근이 가능하다.

```java Capsulation.java
import MyPacks.Person;

class CapsulationTest {
    public static void main (String[] args) {
        Evan evan = new Evan();
    }
}

class Evan extends Person {
    Evan () {
        super("Evan", 29, "Seoul");
        System.out.println(this.address);
        System.out.println(super.address);
    }
}
```
```text
Seoul
Seoul
```

접근제한자는 Java 뿐만 아니라 TypeScript, Ruby, C++ 등과 같이 OOP를 지원하는 많은 프로그래밍 언어들도 가지고 있는 기능이므로 이 개념을 잘 알아두면 클래스를 설계할 때 원하는 정보만 노출시키고 원하지 않는 정보는 감추는 방법을 사용하여 보안도 지킬 수 있고 클래스를 가져다 쓰는 사용자로 하여금 쓸데없는 고민을 안하게 해줄 수도 있다.

### 다형성
`다형성(Polymorphism)`은 어떤 하나의 변수명이나 함수명이 상황에 따라서 다르게 해석될 수 있는 것을 의미한다. 
