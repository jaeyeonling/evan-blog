---
title: HTTP/3에 대해 알아보자(가제)
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
  - Network
thumbnail:
---

HTTP/3는 `HTTP(Hypertext Transfer Protocol)`의 세 번째 메이저 버전으로, 기존의 HTTP/1, HTTP/2와는 다르게 UDP 기반의 프로토콜인 `QUIC`를 사용하여 통신하는 프로토콜이다. HTTP/3와 기존 HTTP 들과 가장 큰 차이점이라면 TCP가 아닌 UDP 기반의 통신을 한다는 것이다.

<!-- more -->

필자는 최근에 다른 분들이 공유해주시는 포스팅을 보고 나서 HTTP/3가 나왔다는 것을 처음 알게 되었다. 그 포스팅은 [HTTP/3: the past, the present, and the future](https://blog.cloudflare.com/http3-the-past-present-and-future/)라는 포스팅이었는데, 솔직히 처음 딱 제목만 보고나서 이런 생각을 했었다.

> 아니, HTTP/2가 공개된지 4년 정도 밖에 안 지났는데 무슨 HTTP/3가 벌써 나와? 그냥 설계하고 있다는 거 아니야?

그런데 포스팅을 읽어 보니 이미 메이저 브라우저에서 카나리 빌드도 배포되어 사용까지 해볼 수 있는 단계에 와있다는 사실을 알게 되어 놀랐다. HTTP/1에서 HTTP/2로 가는 데만 해도 대략 15년 정도의 시간이 걸렸는데, 고작 4년 만에 바로 사용해볼 수 있는 정도의 완성도인 다음 메이저 버전이 배포되었다는 것이다.

프로그래밍 언어나 프레임워크같은 친구들은 배포하는 쪽에서 업데이트를 쫙 해버리고 유저들이 업데이트를 하면 그만이지만, 프로토콜은 일종의 규약이기 때문에 소프트웨어 제조사 간 합을 맞추는 기간이 필요하므로 이렇게 단기간 안에 급격한 변화가 자주 발생하지 않을 것이라고 생각했다. 아무리 요즘 기술의 변화가 빠르다지만, HTTP는 나름 웹의 근간이 되는 프로토콜인데 꼴랑 4년 만에 이런 급격한 변화가 일어났다는 게 믿기 어려웠다.<small>(몇 달 전에 HTTP/2를 처음 도입해본 웹 개발자는 웁니다)</small>

그리고 또 한가지 놀랐던 점은 HTTP/3는 `TCP`가 아닌 `UDP`를 사용한다는 것이었다. 뭐 딱히 웹 프로토콜이 무조건 TCP만 사용해야 한다는 법이 있는 건 아니긴 하지만, 학교에서 배울 때도 그렇고 실무에서도 실제로 사용할 때도 그렇고 `HTTP는 TCP 위에서 정의된 프로토콜`이라는 사실이 너무 당연하게 인식되어 있었기 때문에 `UDP`를 사용한다는 점이 신기하기도 했고 `왜 멀쩡히 잘 돌아가는 TCP를 냅두고 UDP를 사용하는거지?`라는 의문도 들었다.

사실 HTTP/3는 정식으로 배포된 프로토콜이라기보다 아직 테스트를 거치고 있는 단계라고 보는 게 맞다. 하지만 위에서 이야기 했듯이 Google Chrome과 Mozila Firefox와 같은 메이저 브라우저들이 이미 HTTP/3를 지원하는 카나리 빌드를 배포한 상태이고, curl 커맨드 라인 에서도 HTTP/3를 실험적 기능으로 제공하고 있는 만큼, 가까운 미래 안에 HTTP/3가 상용화될 가능성이 높은 것도 사실이다.

만약 Google Chrome에서 HTTP/3 프로토콜을 사용해보고 싶다면 터미널에서 `--enable-quic`과 `--quic-version=h3-23` 인자를 사용하여 실행하면 된다.

```bash
$ open -a Google\ Chrome --args --enable-quic --quic-version=h3-23
```

<center>
  {% asset_img http3-demo.png 500 %}
  <small>`http/2+quic/46`이라고 되어있는 녀석들이 HTTP/3 프로토콜을 사용한 연결이다</small>
  <br>
</center>

그런 이유로 미리 HTTP/3에 대한 공부를 조금 해보기로 했다. 매도 먼저 맞는 것이 덜 아픈 법이니까. 그래서 이번 포스팅에서는 필자가 여기저기 쑤셔보면서 알아본 HTTP/3에 대한 내용을 정리해볼까 한다.


## HTTP/3에 대한 간단한 소개
사실 HTTP/2가 정식으로 발표된 것은 2015년이기 때문에 사실 얼마 되지도 않았고, 보급률도 그렇게 높은 편이 아니다. 유명한 사이트들은 이미 HTTP/2를 많이 사용하고 있긴 하지만 전체 보급률로 본다면 40%가 조금 넘는 정도이기 때문이다.

<center>
  {% asset_img ce-http2.png 500 %}
  <small>W3Techs.com에서 조사한 2019년 8월 HTTP/2 사용률</small>
  <br>
</center>

그럼에도 불구하고 이렇게 짧은 기간만에 HTTP/3라는 메이저 버전이 발표된 이유는 무엇일까?

## TCP / UDP 차이


### TCP의 한계

## QUIC

## HTTP/2와의 차이점

