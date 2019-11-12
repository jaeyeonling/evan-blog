---
title: 패킷의 흐름을 제어하는 TCP
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
thumbnail:
---

`TCP(Transmission Control Protocol)`은 이름 그대로 전송을 제어하는 프로토콜로써, 전송을 제어하기 위한 흐름 제어와 혼잡 제어 등의 기능을 프로토콜 자체에 포함하고 있다.

## TCP의 흐름 제어
송신 측과 수신 측이 서로 데이터를 주고 받을 때, 여러가지 요인에 따라 이 두 친구들의 처리 속도가 달라질 수 있다. 이때 데이터를 받는 수신 측의 처리 속도가 송신 측보다 빠른 경우는 사실 별 문제가 없다.

주는 족족 빠르게 처리해주니 딱히 문제될 것이 없는 것이다. 그러나 수신 측의 처리 속도보다 송신 측이 더 빠른 경우 문제가 생긴다.

송신 측과 수신 측은 모두 데이터를 저장할 수 있는 버퍼를 가지고 있다. 이때 수신 측이 자신의 버퍼 안에 있는 데이터를 처리하는 속도보다 송신 측이 데이터를 전송하는 속도가 더 빠르다면, 당연히 수신 측의 버퍼는 언젠가 꽉 차버릴 것이기 때문이다.

수신 측의 버퍼가 꽉 찬 상태에서 도착한 패킷은 더 이상 담아둘 공간이 없기 때문에 폐기 처분된다. 물론 이런 상황에서는 송신 측이 다시 패킷을 보내주기는 하겠지만, 패킷을 재전송하는 과정이 다시 동반되어야하기 때문에 사실 상 리소스 낭비라고 볼 수 있다.

그래서 송신 측은 수신 측의 데이터 처리 속도를 파악하고 자신이 얼마나 빠르게, 많은 데이터를 전송할 지 결정해야한다. 이것이 바로 TCP의 흐름 제어인 것이다.

### Stop and Wait

### Sliding Window

## TCP의 오류 제어

### ARQ

#### Stop and Wait

#### Go Back N

#### Selective Repeat

## TCP의 혼잡 제어

### AIMD

### Slow Start

### Congestion Avoidance

### Fast Recovery

### TCP Reno

### TCP Tahoe

