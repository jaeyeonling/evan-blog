---
title: V8 엔진과 함께 자바스크립트 최적화하기
date: 2019-06-28 15:58:28
tags:
  - V8
  - JavaScript
categories:
  - JavaScript
thumbnail: /2019/06/28/js-optimize-with-v8/thumbnail.png
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

이번 포스팅에서는 구글의 **V8** 엔진이 어떤 방식으로 자바스크립트를 해석하는 지 살펴보고, 이를 이용한 몇가지 자바스크립트 최적화 기법에 대해서 포스팅하려고 한다. 필자의 메인 언어는 `C++`이 아니기도 하고 워낙 소스가 방대하기 때문에 자세한 분석은 어렵겠지만 그래도 최대한 웹 상에 있는 정보들과 필자가 분석한 `V8` 엔진의 소스코드를 비교해가면서 살펴보려고 한다.
<!-- more -->

## V8 엔진이란?
`V8` 엔진은 구글이 주도하여 `C++`로 작성된 고성능의 자바스크립트 & 웹 어셈블리 엔진이다.
현재 `Google Chrome`과 `NodeJS`에서 사용하고 있으며 `ECMAScript`와 `Web Assembly`를 표준에 맞게 구현하였다.

[Kangax Table](https://kangax.github.io/compat-table/es2016plus/)에서 확인해보면, `V8` 엔진을 사용하고 있는 `CH(Google Chrome)`과 `Node`는 거의 대부분의 ES2016+(ES7+)의 기능을 구현해놓은 반면 MicroSoft의 `Chakra`나 Mozila의 `SpiderMonkey`의 경우 붉은 색으로 표시된 부분이 꽤 존재한다는 것을 볼 수 있다.

{% blockquote ChakraCore team https://github.com/Microsoft/ChakraCore/issues/5865 ChakraCore Github Issue %}
To be compatible with the rest of the platform and reduce interoperability risks, Microsoft Edge will use the V8 engine as part of this change. There is much to build and learn, but we’re excited to take part in the V8 community and start contributing to the project.
{% endblockquote %}

하지만 `Chakra` 엔진을 사용하던 `Microsoft Edge`의 경우, 이제 Chromium 오픈소스 프로젝트에 동참하면서 `V8`엔진을 사용할 예정이라고 한다. 음... 좋은 건지 나쁜 건지 아직은 잘 모르겠다.

## V8 엔진의 작동원리를 간단히 살펴보자.
일단 `V8` 엔진은 오픈 소스이기 때문에 [V8 엔진 깃허브 레파지토리](https://github.com/v8/v8)에서 클론받을 수 있다.
물론 일반적으로 우리가 자바스크립트를 사용할 때 엔진의 작동 원리와 같은 로우 레벨(Low Level)의 내용까지 깊게 신경쓸 필요는 없다. 사실 개발자들이 그런 것까지 일일히 신경쓰지 말라고 엔진을 사용하는 것이기 때문이다.
그러나 정말 자바스크립트로 뽑아낼 수 있는 최적의 성능을 사용하고 싶다면 내 코드가 어떤 식으로 실행되는 지에 대한 이해는 어느 정도 있어야한다.

그리고 자바스크립트를 사랑하는 한명의 개발자로써 내가 사용하는 언어의 작동원리가 궁금한 것은 자연스러운 현상인 것 같다.

그럼 이제 `V8` 엔진이 자바스크립트를 어떤 식으로 파싱하고 실행시키는 지 간략하게 한번 알아보자.

### Parsing, 파싱하기
`파싱(Parsing)`이란, 소스코드를 불러온 후 `AST(Abstract Syntax Tree), 추상 구문 트리`로 변환하는 과정이다.
`AST`는 컴파일러에서 널리 사용되는 자료 구조인데, 우리가 일반적으로 작성한 소스 코드를 컴퓨터가 알아먹기 쉽게 `구조화`한다고 생각하면 된다.

예를 들어, 자바스크립트로 자바스크립트를 파싱한다고 하면 이런 식이다.

```js
const a = 'Hello, World!';

// 위 코드는 대략 이렇게 구조화 할 수 있다.

{
  type: 'String',
  caller: 'a',
  value: 'Hello, World!'
}
```

이렇게 놓고 보니 생각보다 심플하다. 다만 이것은 예시 중 하나일 뿐 컴파일러는 `for`, `if`, `a = 1 + 2`, `function () {}`과 같은 문법도 모두 해석하여 파싱해야 하다보니 `파서(Parser)`의 내부는 생각보다 거대하다. 당장 `V8`의 `parser.cc` 파일도 3000줄이 넘는다.

어쨌든 파싱이라는 개념 자체는 컴퓨터가 분석하기 쉬운 형태인 `추상 구문 트리`로 변경하는 작업이라는 것만 기억하자. `V8` 엔진은 `const a = 'Hello, World!'`라는 소스코드를 `C++` 객체로 파싱할 뿐이다.

그럼 `V8` 엔진의 파싱 코드 중 `1 + 2`와 같이 `리터럴로 선언된 수식`을 담당하는 메소드를 한번 살펴보자.

```cpp v8/src/parsing/parser.cc
bool Parser::ShortcutNumericLiteralBinaryExpression(Expression** x, Expression* y, Token::Value op, int pos) {
  if ((*x)->IsNumberLiteral() && y->IsNumberLiteral()) {
    double x_val = (*x)->AsLiteral()->AsNumber();
    double y_val = y->AsLiteral()->AsNumber();
    switch (op) {
      case Token::ADD:
        *x = factory()->NewNumberLiteral(x_val + y_val, pos);
        return true;
      case Token::SUB:
        *x = factory()->NewNumberLiteral(x_val - y_val, pos);
        return true;
      // ...
      default:
        break;
    }
  }
  return false;
}
```

이 코드는 `V8` 엔진의 `parser.cc`에 선언된 `Parser` 클래스의 `ShortcutNumericLiteralBinaryExpression`<small>(이름이 더럽게 길다...)</small> 스태틱 메소드이다.

인자를 한번 살펴보면 `Expression` 클래스의 객체인 `x`와 `y`는 `표현식`을 의미한다. `op`는 실제 구문 내용과 그 타입을 의미하고 `pos`는 전체 소스 코드 중 현재 파싱하는 소스 코드의 위치를 의미한다.

이 메소드는 위에서 설명했듯이 `1 + 2`와 같은 소스 코드를 만났을 경우 호출되며, 인자로 받은 표현을 `Token::ADD`나 `Token::SUB`와 같은 조건으로 검사하여 조건에 맞게 파싱하고 있는 모습을 볼 수 있다.

```cpp
Literal* AstNodeFactory::NewNumberLiteral(double number, int pos) {
  int int_value;
  if (DoubleToSmiInteger(number, &int_value)) {
    return NewSmiLiteral(int_value, pos);
  }
  return new (zone_) Literal(number, pos);
}
```

이후 알맞게 계산되어 나온 값을 `AstNodeFactory` 클래스의 `NewNumberLiteral` 스태틱 메소드를 사용하여 `추상 구문 트리`의 객체로 만드는 모습을 볼 수 있다.

`V8`은 이 과정에서 이 구문이 `변수`, `함수`, `조건문`과 같은 코드의 의미를 파악하며, 변수 선언 시 `스코프` 또한 이 과정에서 설정된다.
이 중 변수 선언에 관한 자세한 내용은 {% post_link javascript-let-const JavaScript의 let과 const, 그리고 TDZ %}을 참고하자.

## 바이트 코드(Byte Code) 생성하기
`바이트 코드(Byte Code)`는 고오급 언어로 작성된 소스 코드를 가상머신 한결 편하게 이해할 수 있도록 중간 코드로 한번 컴파일 한 것을 의미한다. 대표적인 가상머신은 `JVM(Java Virtual Machine)`이 있다.

위에서 설명한 파싱이 끝나고 `AST`가 완성되면 `V8` 엔진은 `BytecodeGenerator`에 이 AST를 넘겨준다. 
<!-- d8 컴파일 해놓기 -->


