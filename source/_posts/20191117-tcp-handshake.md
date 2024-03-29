---
title: 'TCP가 연결을 생성하고 종료하는 방법, 핸드쉐이크'
toc: true
widgets:
  - type: toc
    position: right
  - type: category
    position: right
sidebar:
  right:
    sticky: true
date: 2019-11-17 19:56:06
tags:
  - TCP
  - SYN
  - ACK
  - FIN
  - TCP Handshake
categories:
  - Programming
  - Network
thumbnail: /2019/11/17/tcp-handshake/thumbnail.png
---


저번에 작성했던 {% post_link header-of-tcp TCP의 헤더에는 어떤 정보들이 담겨있는걸까? %} 포스팅에 이어 이번에는 TCP의 핸드쉐이크 과정과 그 속에서 변화하는 TCP 상태에 대해서 한번 알아보려고 한다.

<!-- more -->

TCP는 신뢰성있는 연결을 추구하기 때문에 연결을 생성하고 종료하는 순간에도 나름의 신뢰성 확보를 위해 `핸드쉐이크(Handshake)`라고 하는 특별한 과정을 거치게 된다. TCP를 사용하여 통신을 하는 각 종단은 핸드쉐이크 과정을 통해 어떤 TCP 옵션들을 사용할 지, 패킷의 순서 번호 동기화와 같이 통신에 필요한 몇 가지 정보를 주고 받는다.

하지만 말로만 설명하면 재미가 없으니, C를 사용하여 직접 간단한 클라이언트와 서버를 작성해보고 이 친구들이 핸드쉐이크 과정에서 주고 받는 패킷을 몰래 엿본 결과물도 조금씩 첨부하려고 한다.

## 연결 지향의 의미에 대해서
핸드쉐이크를 이야기하기에 앞서, TCP가 생성하고 종료하는 `연결`에 대한 이야기를 먼저 하려고 한다. 아마 TCP에 대해서 공부해보신 분들은 TCP의 대표적인 특징 중 하나인 `연결 지향(Connection Oriented)`이라는 키워드에 대해서 들어보았을 것이다.

연결 지향은 말 그대로 연결되어 있는 상태를 지향한다는 의미이다. 사실 `연결`과 `비연결`은 네트워크를 공부하다보면 여러 번 마주치게 되는 단어인데, 필자는 개인적으로 이 단어들의 의미가 조금 헷갈렸었다.

상식적으로 두 기기가 통신을 하려면 케이블이든 뭐든 연결이 되어있어야 할텐데, 굳이 왜 `연결 지향`과 `비연결 지향`을 나누어 놓은 것인지 이해가 되지 않았기 때문이다.

이게 헷갈리는 이유는 `물리적인 연결`과 `논리적인 연결`의 차이 때문이다.

우리가 일반적으로 기기와 다른 기기를 연결했다고 할 때 떠올리는 생각은 컴퓨터와 모니터를 연결하거나, USB와 컴퓨터를 연결하는 등의 상황이다. 즉, 기기 간의 물리적인 연결이다.

<center>
  {% asset_img physical-connection.png 500 %}
  <small>케이블을 사용하여 두 개의 장치를 물리적으로 연결한다</small>
  <br>
</center>

반면, 연결 지향이라는 단어에서 사용하고 있는 연결의 의미는 `논리적인 연결(Logical Connection)`을 의미한다. 이때 당연히 여러 개의 기기가 서로 통신을 하기위해서는 물리적인 연결 또한 동반되어야한다.

<center>
  {% asset_img logical-connection.png 500 %}
  <br>
</center>

조금 더 쉽게 이야기해보자면, 두 기기가 서로 연결되어 있는 상태를 유지하는 것이다.

전화를 예로 들자면, 전화가 전화선에 연결되어있는 것이 물리적인 연결이고 실제로 다른 전화와 통화를 하고 있는 상황이 논리적인 연결, 즉 `연결되어 있는 상태`인 것이다.

그렇다면 왜 TCP는 이런 연결 상태를 유지하는 걸까? 그 이유는 간단하다. 바로 `연속적인 데이터 전송의 신뢰성`을 위해서이다.

기본적으로 TCP는 패킷 전송 방식을 사용하기 때문에 보내려고 하는 데이터를 여러 개의 패킷으로 쪼개서 보낸다. 이때 네트워크를 통해 모든 데이터를 한번에 팍! 보내는 것이 아니라 일정 단위로 묶어서 스트림처럼 상대방에게 흘려보내게 된다.

그럼 한번 데이터를 받는 수신자 입장에서 생각해보자. 패킷 전송 방식의 장점 중 하나는 회선을 점유하지 않고 적은 양의 회선으로도 동시에 통신을 할 수 있다는 점이다.

그렇다는 것은 각 종단이 동시다발적으로 여러 기기들과 패킷을 주고 받고 있다는 의미인데, 이때 `누가 보낸 몇 번째 패킷`이라는 정보가 없다면 수신 측은 굉장히 혼란스러울 것이다.

<center>
  {% asset_img pipes.png 500 %}
  <small>연결 상태가 없는 패킷을 구분한다는 것은 한 양동이에 담긴 물을 구분하고 싶다는 말과 같다</small>
  <br>
</center>

위 그림에서 파이프는 물리적인 연결, 각 파이프 끝의 구멍은 포트, 양동이는 패킷을 처리할 프로세스라고 생각해보자. 이때 연결 상태에 대한 구분을 하지 않고 패킷을 구분하고 싶다는 것은 마치 한 양동이에 담긴 물 중에서 어떤 한 파이프 구멍에서 나온 물을 구분해내고 싶다는 말과 비슷하다.

그렇기 때문에 TCP는 `A와 B의 연결 상태`, `A와 C의 연결 상태` 등 각 기기간의 연결 상태를 따로 구분하고 있는 것이다. 이때 TCP는 상대방과 연결 상태를 만들거나 해제하기 위해 특별한 과정을 거치는데, 이 과정을 `핸드쉐이크(Handshake)`라고 한다.

## 3 Way Handshake
먼저, 연결을 만드는 과정부터 살펴보도록 하자. 연결을 생성할 때 거치는 핸드쉐이크 과정을 `3 Way Handshake`라고 하는데, 3 Way라는 말 그대로 총 3번의 통신 과정을 거친다.

이 과정을 거치면서 통신을 하는 양 종단은 내가 누구랑 통신하고 있는지, 내가 받아야할 데이터의 시퀀스 번호가 몇 번인지와 같은 정보를 주고 받으면서 연결 상태를 생성하게 된다.

<center>
  {% asset_img 3way-handshake.png 400 %}
  <br>
</center>

이때 `요청자(Initiator)`는 연결 생성 요청을 먼저 보낸 쪽, `수신자(Receiver)`는 연결 생성 요청을 받은 쪽을 의미한다. 이렇게 표현하는 이유는 일반적으로 우리가 생각하는 클라이언트와 서버, 둘 중에 어느 쪽이든 자유롭게 먼저 연결 생성 요청을 보낼 수 있기 때문이다.

그럼 한 번 각각의 상태가 어떤 것을 의미하는지, 두 기기가 서로 주고 받고 있는 `SYN`과 `ACK`는 무엇을 의미하는지 살펴보도록 하자.

### CLOSED

<center>
  {% asset_img 3way-closed.png 400 %}
  <br>
</center>

아직 연결 요청을 시작하지 않았기 때문에 아무런 연결도 없는 상태이다.

### LISTEN

<center>
  {% asset_img 3way-listen.png 400 %}
  <br>
</center>

수신자가 요청자의 연결 요청을 기다리고 있는 상태이다.

이후 요청자가 연결 요청을 보내기 전까지 수신자는 계속 이 상태로 대기하게 된다. 즉, 적극적으로 상대방에게 대시하지 않는다는 것인데, 그래서 이 상태를 `수동 개방(Passive Open)`이라 하고, 수신자를 `Passive Opener`라고도 한다.

소켓 프로그래밍을 할 때, 소켓 바인딩을 한 후 `listen` 함수를 호출하게 되면 수신자가 LISTEN 상태로 들어가게 된다.

```c
if ((listen(sockfd, 5)) != 0) {
  printf("Listen failed...\n");
  exit(0);
}
else
  printf("Server listening..\n");
}
```

이후 수신자는 요청자의 연결 요청이 확인되면 `accept` 함수를 호출하여 다음 단계로 넘어가게 된다.

### SYN_SENT

<center>
  {% asset_img 3way-synsent.png 400 %}
  <br>
</center>

요청자가 수신자에게 연결 요청을 하면서 랜덤한 숫자인 `시퀀스 번호`를 생성해서 SYN 패킷에 담아 보낸 상태이다. 이제 요청자와 수신자는 이 시퀀스 번호를 사용하여 계속 새로운 값을 만들고 서로 확인하며 연결 상태와 패킷의 순서를 확인하게 된다.

```
localhost.initiator > localhost.receiver: Flags [S], seq 3414207244, win 65535
```

TCP 세그먼트를 캡쳐할 수 있는 `tcpdump` 유틸리티로 이 과정을 확인해보면 요청자가 패킷의 플래그를 SYN 패킷을 의미하는 `S`로 설정하고 시퀀스 번호로 `3414207244`라는 값을 생성해서 수신자에게 보내고 있음을 알 수 있다.

이 경우는 요청자가 수신자에게 연결을 생성하자고 적극적으로 대시하는 상황이므로 이 상태를 `능동 개방(Active Open)`이라고 하고, 요청자를 `Active Opener`라고도 한다.

### SYN_RECV

<center>
  {% asset_img 3way-synrecv.png 400 %}
  <br>
</center>

`SYN_RECV`는 요청자가 보낸 SYN 패킷을 수신자가 제대로 받은 상태를 의미한다.

이후 수신자는 제대로 된 시퀀스 번호를 받았다는 확인의 의미인 `승인 번호(Acknowledgement)` 값을 만들어서 다시 요청자에게 돌려줘야한다. 이때 승인 번호는 처음 `요청자가 보낸 시퀀스 번호 + 1`이 된다.

이 승인 번호 만드는 과정은 어렵게 생각할 필요가 없는게, 저번 포스팅에서 이야기했듯이 TCP를 사용하여 실제로 데이터를 주고 받을 때에는 `상대방이 보낸 시퀀스 번호 + 상대방이 보낸 데이터의 byte`를 합쳐서 승인 번호를 만들어낸다. 즉, 내가 여기까지 받았으니, 다음에는 여기부터 보내달라는 일종의 마킹인 것이다.

그러나 이런 핸드쉐이크 과정에서는 아직 데이터를 주고 받지 않기 때문에 시퀀스 번호에 더할게 없다. 그렇다고해서 시퀀스 번호를 같은 번호로 주고 받자니 패킷의 순서를 구분할 수 없지 않은가? 그래서 그냥 1을 더하는 것이다.

방금 전과 마찬가지로 tcpdump 유틸리티를 사용하여 이 과정을 확인해볼 수 있다.

```
localhost.receiver > localhost.initiator: Flags [S.], seq 435597555, ack 3414207245, win 65535
```

수신자가 요청자에게 보내는 패킷을 캡처해보았더니 패킷의 플래그가 `S.`로 설정되어있다. 이때 `.`가 의미하는 것은 헤더의 `ACK` 플래그 필드가 1이라는 것이므로 이 패킷에는 유효한 승인 번호가 담겨있음을 알 수 있다.

수신자는 이번 통신을 통해 요청자에게 `3414207245` 이라는 승인 번호를 전달하고 있는데, 이 값은 방금 전 요청자가 보냈던 시퀀스 번호인 `3414207244`에 1을 더한 값이다.

또한 랜덤한 수로 자신의 시퀀스 번호인 `435597555`를 다시 생성하여 함께 요청자에게 보내주고 있는 것을 확인할 수 있다.

### ESTABLISHED(요청자)

<center>
  {% asset_img 3way-established-client.png 400 %}
  <br>
</center>

요청자는 자신이 맨 처음에 보냈던 시퀀스 번호와 수신자가 응답으로 보내준 승인 번호, 즉 `내 시퀀스 번호 + 1`를 사용하여 연결이 제대로 성립되었는지 확인할 수 있다. 자신이 보냈던 시퀀스 번호와 이번에 받은 승인 번호의 차가 1이라면 제대로 연결이 되었다고 판단하는 것이다.

이후 요청자는 연결이 성립되었다고 판단하고 `ESTABLISHED` 상태로 들어가면서, 이번에는 수신자가 새롭게 만들어서 보내줬던 시퀀스 번호에 1을 더한 값을 다시 승인 번호로 사용하여 다시 수신자에게 보내준다.

즉, 마지막으로 수신자가 보내줬던 시퀀스 번호인 `435597555`에 1을 더한 값인 `435597556`이 요청자의 승인 번호가 될 것이다...만 tcpdump의 동작은 필자의 예상과 달랐다.

```
localhost.initiator > localhost.receiver: Flags [.], ack 1, win 6379
```

<center>
  {% asset_img why.jpg 500 %}
  <small>왜 1이 거기서 나와...?</small>
  <br>
</center>

원래대로라면 `435597556`이 되어야할 요청자의 마지막 승인 번호가 뜬금없이 `1`이 되었다. <small>(처음엔 진심 당황했다)</small>

사실 이건 TCP의 자체 동작은 아니고 tcpdump가 제공하는 기능이다. tcpdump가 패킷들의 시퀀스 번호를 알아보기 쉽게끔 `상대적인 위치`로 알려주기 때문이다. 이후 이 두 종단이 주고 받는 데이터를 tcpdump로 캡처해보면 이게 무슨 말인지 조금 더 쉽게 알 수 있다.

```
localhost.initiator > localhost.receiver: Flags [P.], seq 1:81, ack 1, win 6379, length 80: HTTP
```

원래대로라면 요청자가 마지막으로 보내는 승인 번호는 `435597556`이 될 것이기 때문에 첫 번째로 전송하는 데이터의 시퀀스 번호의 범위 또한 `435597556:435597637`로 출력되어야한다.

그러나 인간이 이렇게 큰 숫자를 계속 보면서 분석하기는 쉽지 않기 때문에 승인 번호를 `1`로 보여주고, 이후 주고받는 첫 번째 시퀀스 번호를 1부터 시작해서 알아보기 쉽게 만들어주는 것이다. 확실히 `435597556:435597637`보다는 `1:81`이 알아보기 쉽다.

하지만 이건 인간이 알아보기 쉽게 tcpdump가 친절함을 베푼 것일뿐 실제로 값이 1로 변경된 것은 아니기 때문에 tcpdump의 `-S` 옵션을 사용하여 이 기능을 비활성화하면 원래 승인 번호와 시퀀스 번호를 그대로 출력할 수도 있다.

```bash
$ sudo tcpdump -S
localhost.initiator > localhost.receiver: Flags [.], ack 435597556, win 6379
```

### ESTABLISHED(수신자)

<center>
  {% asset_img 3way-established-server.png 400 %}
  <br>
</center>

요청자와 마찬가지로 수신자 또한 자신이 보냈던 시퀀스 번호와 이번에 받은 승인 번호의 차가 1이라면 제대로 연결이 되었다고 판단하고 `ESTABLISHED` 상태로 들어가게된다. 여기까지 오면 요청자와 수신자는 안전하고 신뢰성있는 연결이 생성되었다고 판단하고 본격적인 통신을 시작할 수 있다.

## 4 Way Handshake
연결을 생성할 때와 마찬가지로, 연결을 종료할 때도 특정한 과정을 거쳐서 연결을 종료해야한다.

그냥 연결을 끊어버리면 안되냐고 할 수도 있지만, 한 쪽에서 일방적으로 연결을 끊어버리면 다른 한 쪽은 연결이 끊어졌는지 지속되고 있는지 알 방법이 없다.

또한 연결을 종료하기 전에 아직 다 처리하지 못한 데이터가 있을 수도 있기 때문에 양 쪽이 다 정상적으로 연결을 종료할 준비가 되었는 지를 확인하는 과정이 필요한 것이다.

이때 요청자와 수신자가 총 4번의 통신 과정을 거치기 때문에, 이 과정을 `4 Way Handshake`라고 부른다.

<center>
  {% asset_img 4way-handshake.png 400 %}
  <br>
</center>

이번에도 `요청자(Initiator)`와 `수신자(Receiver)`라는 용어를 사용하고 있는데, 3 Way Handshake와 마찬가지로 클라이언트와 서버, 둘 중에 어느 쪽이든 연결 종료 요청을 시작할 수 있기 때문에 이런 용어를 사용하는 것이다.

먼저 연결 생성 요청을 했던 쪽이 먼저 연결 종료 요청을 보낼 수도 있고, 반대로 처음에는 연결 생성 요청을 당했던 쪽이 이번에는 먼저 연결 종료 요청을 보낼 수도 있다.

사실 개발자들은 3 Way Handshake보다 연결을 종료하는 과정인 4 Way Handshake에 더 예민하게 반응할 수 밖에 없는데, 연결을 생성하는 과정에서 문제가 발생하여 연결이 생성되지 않는다면 다시 시도하면 그만이지만, 이미 생성된 연결을 종료하는 과정인 4 Way Handshake에서 문제가 발생하면 그대로 연결이 남아있기 때문이다.

게다가 4 Way Handshake는 3 Way Handshake처럼 순차적으로 주고받는 방식이 아니라 상대방이 응답을 줄 때까지 대기하는 과정이 포함되어있기 때문에 중간에 뭐 하나 엇나가면 서로 계속 대기만 하고 있는 `데드락(Deadlock)` 상황이 연출될 수도 있다.

물론 조건에 따라 일정 시간이 지나면 타임아웃이 되며 연결을 강제로 종료하거나 다음 단계로 넘어갈 수도 있지만 그래도 그 시간 동안 프로세스가 메모리와 포트를 점유하고 있으므로 트래픽이 많은 서버라면 이로 인해 병목이 발생할 가능성은 늘 있다.

### FIN_WAIT_1

<center>
  {% asset_img 4way-finwait1.png 400 %}
  <br>
</center>

먼저 연결을 종료하고자 하는 요청자가 FIN 패킷을 상대방에게 보내면서 `FIN_WAIT1` 상태로 들어서게 된다.

이때 FIN 패킷에도 시퀀스 번호가 포함되어있긴한데, 이번에는 랜덤한 값으로 생성해서 보내는 것이 아니다. 3 Way Handshake는 시퀀스 번호가 없는 상황에서 새로 만들어야하는 상황이라 랜덤한 값으로 초기화했지만, 이번에는 시퀀스 번호를 새롭게 생성할 필요가 없으므로 그냥 자신이 이번에 보내야할 순서에 맞는 시퀀스 번호를 사용하면 되는 것이다.

{% blockquote %}
- 요청자 ---**SEQ: 1**---> 수신자
- 요청자 <---**ACK: 2**--- 수신자
- 요청자 ---**FIN: 2**---> 수신자
{% endblockquote %}

즉, FIN 플래그만 1로 변경해서 보낸다고 생각하는 게 편하다. 이 플래그의 의미를 쉽게 얘기해보자면 "나 더 이상 할 말 없음" 정도이다.

이때 요청자가 먼저 적극적으로 연결 종료 요청을 보내는 것이기 때문에 요청자를 `Active Closer`, 이 상태를 `능동 폐쇄(Active Close)`라고 한다.

```
localhost.initiator > localhost.receiver: Flags [F.], seq 701384376, ack 4101704148, win 6378
```

하지만 요청자가 수신자에게 보낸 연결 종료 요청 패킷을 캡처해보니 `F` 플래그가 아니라 `FIN+ACK`를 의미하는 `F.` 플래그가 설정되어있다. tcpdump를 사용하여 패킷을 캡처한 다른 블로그를 봐도 대부분 필자와 같은 상황을 겪고 있음을 알 수 있었다.

분명 이론적으로는 FIN 패킷을 보내야하는데 왜 승인 번호를 함께 묶어서 FIN+ACK로 보내고 있는 것일까?

#### Half-Close 기법

요청자가 FIN+ACK 패킷을 보내는 이유는 바로 `Half-Close`라는 기법을 사용하고 있기 때문이다. Half-Close 기법은 말 그대로 연결을 종료하려고 할 때 완전히 종료하는 것이 아니라 반만 종료하는 것이다.

`Half-Close`를 사용하면 요청자가 처음 보내는 FIN 패킷에 승인 번호를 함께 담아서 보내게 되는데, 이때 이 승인 번호의 의미는 "일단 연결은 종료할 건데 귀는 열어둔다. 이 승인 번호까지 처리했으니까 마저 보낼 거 있으면 보내"라는 의미가 된다.

즉, 반만 닫겠다는 말의 의미는 연결을 종료할 때 전송 스트림과 수신 스트림 중 하나만 우선 닫겠다는 것을 의미하는 것이다.

이후 수신자는 미처 못 보낸 데이터가 있다면 열심히 보낼 것이고, 이에 요청자는 아직 살아있는 수신 스트림을 사용하여 데이터를 처리한 후 `ACK` 패킷을 응답으로 보낼 수 있다. 이후 수신자가 모든 데이터를 처리하고나면 다시 요청자에게 FIN 패킷을 보냄으로써 모든 데이터가 처리되었다는 신호를 보내준다.

그럼 요청자는 그때 나머지 반을 닫으면서 조금 더 안전하게 연결을 종료할 수 있는 것이다.

소켓 프로그래밍을 할 때 연결 종료 함수로 `close()`와 `shutdown()`을 사용할 수 있는데, 이때 `shutdown()` 함수를 사용하면 Half-Close를 사용할 수 있다.

```c
shutdown(sockfd, SHUT_WR);
```

만약 요청자가  `close()` 함수를 사용하면 호출 즉시 OS에게 소켓의 리소스를 반환하며 모든 스트림이 파기되므로 FIN 패킷을 받은 수신자가 미처 못 보낸 데이터를 뒤늦게 전송하더라도 더 이상 처리할 수 없는 상황이 된다.

위의 예제에서는 `SHUT_WR` 값을 두 번째 인자로 사용함으로써 전송 스트림만 우선 닫겠다고 선언한 것이다.

이와 관련된 더 자세한 정보는 구글에 `Half-Close`나 `우아한 종료` 등의 키워드로 검색하면 많은 자료가 나오니 한번 살펴보도록 하자.

### CLOSE_WAIT

<center>
  {% asset_img 4way-closewait.png 400 %}
  <br>
</center>

요청자으로부터 FIN 패킷을 받은 수신자는 `요청자가 보낸 시퀀스 번호 + 1`로 승인 번호를 만들어서 다시 요청자에게 응답해주면서 `CLOSE_WAIT` 상태로 들어간다.

```bash
localhost.receiver > localhost.initiator: Flags [.], ack 701384377, win 6378
```

아까 요청자가 FIN 패킷의 시퀀스 번호로 `701384376`을 보냈으니 이번에 수신자가 응답해줄 승인 번호는 `701384377`이 되는 것이다.

이후 수신자는 자신이 전송할 데이터가 남아있다면 이어서 계속 전송한 후, 모든 전송이 끝났다면 명시적으로 `close()`나 `shutdown()`과 같은 함수를 호출하여 다음 단계로 넘어갈 것이다.

즉, 요청자는 언제 수신자의 데이터 처리가 끝날지 모르는 상태이기 때문에 수신자가 작업을 마치고 다시 연결 종료 승인을 의미하는 FIN 패킷을 보내줄 때까지 대기해야한다는 말이 된다.

만약 이 단계에서 수신자의 데이터 처리가 끝나도 연결 종료 함수가 명시적으로 호출되지 않으면 다음 상태로 넘어갈 수 없기 때문에 데드락이 발생할 가능성이 있다.

<center>
  {% asset_img deadlock.png 500 %}
  <small>구글의 자동 완성 검색어가 개발자들의 심정을 대변해주고 있다</small>
  <br>
</center>

이때 수신자는 상대방으로부터 연결 종료 요청을 받은 후에야 수동적으로 연결을 종료할 준비를 하기 때문에 수신자를 `Passive Closer`, 이 상태를 `수동 폐쇄(Passive Close)`라고 한다.

### FIN_WAIT_2

<center>
  {% asset_img 4way-finwait2.png 400 %}
  <br>
</center>

요청자는 수신자로부터 승인 번호를 받고 자신이 보냈던 시퀀스 번호와 승인 번호의 차가 1이 맞는지 확인한다. 하지만 아직 수신자의 데이터 전송이 전부 끝나지 않았을 수도 있기에 `FIN_WAIT2` 상태로 들어가서 수신자가 연결 종료를 허락하는 `FIN` 패킷을 보내줄 때까지 기다린다.

방금 CLOSE_WAIT 섹션에서 설명했듯이 여기서부터는 수신자가 다시 FIN 패킷을 보내줄 때까지 요청자는 계속 대기하는 시간이다.

하지만 CLOSE_WAIT와 다르게 무한정 대기만 하는 것은 아니고 커널 파라미터로 타임아웃이 정해져있는 경우, 일정 시간이 경과하면 자동으로 다음 단계로 넘어갈 수 있다.

### LAST_ACK

<center>
  {% asset_img 4way-lastack.png 400 %}
  <br>
</center>

수신자는 자신이 처리할 데이터가 더 이상 없다면 연결을 종료하는 함수를 명시적으로 호출하고, 아까 요청자가 보냈던 연결 종료 요청에 합의한다는 의미로 요청자에게 다시 `FIN` 패킷을 보낸다.

이때 수신자가 보내는 FIN 패킷에 담기는 시퀀스 넘버는 자신이 이번에 전송해야 하는 데이터의 시퀀스 번호를 그대로 사용하며, 승인 번호는 마지막으로 자신이 응답했던 승인 번호를 그대로 사용한다.

이후 수신자는 `LAST_ACK` 상태로 들어가며 요청자가 다시 승인 번호를 보내줄 때까지 대기한다.

### TIME_WAIT

<center>
  {% asset_img 4way-timewait.png 400 %}
  <br>
</center>

수신자가 보낸 FIN 패킷을 받은 요청자는 다시 `수신자가 보낸 시퀀스 번호 + 1`로 승인 번호를 생성하여 수신자에게 ACK 패킷으로 응답한다. 이후 요청자는 `TIME_WAIT` 상태로 들어가며, 실질적인 연결 종료 과정에 들어가게 된다. 이때 TIME_WAIT의 역할은 의도하지 않은 에러로 인해 연결이 데드락에 빠지는 것을 방지하는 것이다.

TIME_WAIT에서 대기하는 시간은 `2 MSL(Maximum Segement Lifetime)`으로 정의되어 있으며, 정확한 MSL의 시간 값은 커널 파라미터로 정의되어있다.

```bash
$ sysctl net.inet.tcp | grep msl
net.inet.tcp.msl: 15000
```

필자의 컴퓨터인 OSX의 MSL은 15초로 설정되어있다. 즉, 필자의 컴퓨터는 TIME_WAIT 상태에서 30초 정도 대기한다는 것이다. 참고로 이 값은 변경할 수 없기 때문에 TIME_WAIT에서 소비되는 시간은 변경할 수 없다.

보통 TCP 타임아웃 파라미터로 많이 언급되는 `net.ipv4.tcp_fin_timeout`은 FIN_WAIT2의 타임아웃을 조절할 수 있는 값이라 TIME_WAIT 상태에는 해당 사항이 없다.

하지만 CLOSE_WAIT와 마찬가지로 여기서도 데드락이 발생할 수 있다. 그런 이유로 많은 네트워크 엔지니어들이 여기서 소비되는 시간을 줄이거나 운 나쁘게 발생한 데드락을 없애기 위해 `tcp_tw_reuse` 커널 파라미터를 변경하는 등 여러가지 방법을 사용하고 있다. <small>(데드락 피하자고 만든 상태인데 데드락이 발생하는 현실)</small>

하지만 역시 그냥 가만 냅두는 게 제일 좋다고들 한다.

### CLOSED(수신자)

<center>
  {% asset_img 4way-closed-server.png 400 %}
  <br>
</center>

요청자가 보낸 ACK 패킷을 받은 수신자는 `CLOSED` 상태로 들어가며 연결을 완전히 종료한다.

### CLOSED(요청자)

<center>
  {% asset_img 4way-closed-client.png 400 %}
  <br>
</center>

`TIME_WAIT` 상태에서 2 MSL만큼 시간이 지나면 요청자도 `CLOSED` 상태로 변경된다. 위에서 설명했듯이 이 시간은 커널 파라미터에 고정되어 있고, 필자가 사용하고 있는 OSX의 경우 30초 정도이다.

## 마치며
이렇게 두 번째 TCP 주제인 핸드쉐이크에 대한 포스팅을 마쳤다. TCP에 대해서 학교에서 배우긴 했지만 이렇게 각 상태에 대해서 자세히 공부하진 않았기 때문에 나름 새로운 경험이었다.

이 포스팅을 작성하면서 TCP가 단순히 연결을 생성하고 종료하는데만 해도 신뢰성을 확보하기 위해 얼마나 많은 작업을 하는지 알 수 있었다. <small>(더불어 구글이 왜 HTTP/3에 UDP를 사용했는지 알 것 같았다...)</small>

처음에는 필자 블로그 로컬 서버와 브라우저의 핸드쉐이크를 캡처해보려고 했는데, 이 친구들은 단순한 몇 개의 메세지를 주고 받는 수준이 아니라 대량의 데이터를 주고 받는 사이다보니 필자가 원하는 부분을 추적하기가 쉽지 않았다.

그래서 오랜만에 간단한 소켓 프로그래밍을 하게 되었는데, 음... 하도 오랜만에 C를 사용하다보니 손에 안 익어서 꽤나 고생하긴 했지만 나름 재미있었다. C는 역시 가끔 해야 재밌는 것 같다.

혹시 필자가 예제로 사용한 어플리케이션을 직접 실행해보고 싶으신 분은 필자의 [깃허브 레파지토리](https://github.com/evan-moon/simple-tcp-example)에서 클론 받을 수 있다. 간단한 메세지만 서로 주고 받는 어플리케이션이니 `tcpdump`를 사용해서 패킷을 들여다보기도 한결 편할 것이다.

이상으로 TCP가 연결을 생성하고 종료하는 방법, 핸드쉐이크 포스팅을 마친다.
