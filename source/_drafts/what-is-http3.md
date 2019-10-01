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

필자는 이 사실을 알고나서 `왜 멀쩡히 잘 돌아가는 TCP를 냅두고 UDP를 사용하는거지?`라는 의문이 들었다. 뭐 딱히 웹 프로토콜이 무조건 TCP만 사용해야 한다는 법이 있는 건 아니지만 지금까지의 HTTP는 모두 TCP 위에서 작동하는 프로토콜이었기 때문에 이런 변화에 대해 의문이 든 것이다.

사실 HTTP/3는 정식으로 배포된 프로토콜이라기보다 아직 테스트를 거치고 있는 단계이다. 그러나 Google Chrome과 Mozila Firefox와 같은 메이저 브라우저들이 이미 HTTP/3를 지원하는 카나리 빌드를 배포한 상태이고, curl 커맨드 라인 에서도 HTTP/3를 실험적 기능으로 제공하고 있는 만큼, 가까운 미래 안에 HTTP/3가 상용화될 가능성이 높은 것도 사실이다.

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

