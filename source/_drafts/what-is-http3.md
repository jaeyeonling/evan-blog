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

학교에서 네트워크를 배울 때 필자는 TCP는 높은 신뢰성을 보장하는 프로토콜, UDP는 속도는 빠른 대신에 신뢰성이 보장되지 않는 프로토콜이라고 배웠다. 그래서 HTTP/3에서 UDP를 사용한다는 이야기를 들었을 때 `중간에 패킷이 손실되면 어떻게 처리하는 거지?`라는 궁금증이 생기게 되었고, HTTP/3의 원리를 조사하던 과정에서 알아낸 것들을 공유하고 싶은 마음에 이 포스팅을 작성하게 되었다.

## HTTP/3에 대한 간단한 소개

## TCP / UDP 차이

## QUIC

## HTTP/2와의 차이점

