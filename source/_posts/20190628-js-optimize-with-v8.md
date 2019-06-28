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
물론 일반적으로 우리가 자바스크립트를 사용할 때 엔진의 작동원리같은 로우 레벨(Low Level)의 내용까지 신경쓸 필요는 없다. 사실 개발자들이 그런 것까지 일일히 신경쓰지 말라고 엔진을 사용하는 것이기 때문이다.

그러나 자바스크립트를 사랑하는 한명의 개발자로써 내가 사용하는 언어의 작동원리가 궁금한 것은 자연스러운 현상인 것 같다.
그럼 이제 `V8` 엔진이 자바스크립트를 어떤 식으로 파싱하고 실행시키는 지 간략하게 한번 알아보자.



