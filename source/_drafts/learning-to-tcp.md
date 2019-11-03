---
title: TCP 자세히 파헤쳐보기(가제)
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

이번 포스팅에서는 TCP에 대해서 한번 최대한 깊게 파보려고 한다. 저번에 {% post_link what-is-http3 HTTP/3는 왜 UDP를 선택한 것일까? %} 포스팅을 진행하며 TCP에 대해 간단한 언급을 했었지만, 해당 포스팅에서는 기존에 HTTP에서 사용하던 TCP에 어떤 문제가 있었는지에 집중해서 이야기했었지만 이번에는 TCP 자체에 조금 더 집중해서 이야기해보려고 한다.

<!-- more -->

## TCP, Transmission Control Protocol
`TCP(Transmission Control Protocol)`는 OSI 7계층 중 전송 계층에서 사용되고 있는 프로토콜로, 장비들 간의 통신 과정에서 정보를 안정적으로, 순서대로, 에러없이 교환할 수 있도록 하는 것에 목적을 둔 프로토콜이다.

필자는 학교에서 TCP라는 개념을 처음 배웠었는데, 당시 필자가 배웠던 TCP의 특징은 다음과 같았다.

{% blockquote %}
- 연결 지향 방식이다
- 패킷의 전송 순서를 보장
- 신뢰성은 높으나 전송 속도가 느리다
{% endblockquote %}

### 연결 지향 방식이다
자, 그럼 먼저 `연결 지향(Connection Oriented)`이란 무엇일까? 상식적으로 두 기기가 통신을 하려면 케이블이든 뭐든 연결이 되어있어야 할텐데, 굳이 왜 `연결 지향`과 `비연결 지향`을 나누어 놓은 것일까?

여기서 헷갈리는 이유는 `물리적인 연결`과 `논리적인 연결`의 차이 때문이다. 물리적인 연결이라는 것은 일반적으로 우리가 컴퓨터와 모니터를 연결하거나, 랜선을 컴퓨터에 연결한다거나 할 때 사용하는 말이다. 즉, 컴퓨터와 외부 장치 간의 `물리적인` 연결이다.

<center>
  {% asset_img physical-connection.png 500 %}
  <small>케이블을 사용하여 두 개의 장치를 물리적으로 연결한다</small>
  <br>
</center>

반면, `연결 지향`이라는 단어에서 사용하고 있는 연결의 의미는 `논리적인 연결(Logical Connection)`을 의미한다. 당연히 여러 개의 기기가 서로 통신을 하기위해서는 물리적으로 연결이 되어있어야 한다. 

<center>
  {% asset_img logical-connection.png 500 %}
  <small>물리적인 연결이 아닌, 논리적인 연결은 이런 느낌이다</small>
  <br>
</center>

실제로 각 노드들은 케이블로 물리적인 연결이 되어있고, 

TCP라고 하면 주로 생각나는 핸드쉐이크 과정이 바로 이 연결을 생성하거나 끊을 때 겪는 과정이다. 

### 패킷의 전송 순서를 보장

### 신뢰성은 높으나 전송 속도가 느리다


## 헤더 구조

<center>
  {% asset_img tcp-header.png %}
  <br>
</center>

## 3 Way Handshake

**LISTEN**
**SYN_SENT**
**SYN_RECV**
**ESTABLISHED**

## 4 Way Handshake

**FIN_WAIT1**
**CLOSE_WAIT**
**FIN_WAIT2**
**TIME_WAIT**
**LAST_WAIT**
**CLOSED**