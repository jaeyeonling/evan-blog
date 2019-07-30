---
title: 로우 레벨에서 Node.js 이벤트 루프의 워크 플로우와 라이프 사이클 [번역]
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
  - 번역
  - JavaScript
  - NodeJS
  - Event Loop
categories:
  - JavaScript
thumbnail:
---

> 이 포스팅은 2018년 2월 19일에 Paul Shan이 작성한 [Node.js event loop workflow & lifecycle in low level](http://voidcanvas.com/nodejs-event-loop/)를 번역한 글입니다.

1년 전, 필자는 [setImmediate & process.nextTick](http://voidcanvas.com/setimmediate-vs-nexttick-vs-settimeout/)의 차이점에 대해 설명하면서 Node.js의 이벤트 루프 구조에 대해 살짝 언급한 적이 있었다. 놀랍게도 독자 분들은 원래 설명하려고 했던 부분보다 이벤트 루프 부분에 대해서 더 많이 관심을 주었고, 필자는 그 부분에 대해서 많은 질문을 받았었다. 그래서 이번에는 Node.js의 이벤트 루프를 구성하는 Low Level의 큰 그림을 한번 설명해보려고한다.

> 포스팅의 중간 중간에 몇가지 꿀팁들이 있기 때문에 부분만 읽는 것이 아니라 전체를 한번 쫙 읽어보는 것을 추천한다!

## 왜 이 포스팅을 작성하게 되었나?
만약에 여러분이 구글에서 `node.js event loop`를 검색하면 나오는 대부분의 아티클들은 큰 그림을 말해주지 않는다. (그들은 매우 High Level의 추상화로만 이 과정을 묘사하려고 한다.)

> **역주**: 여기서 저자가 말하는 큰 그림은 이벤트 루프와 연관된 모든 것을 한번에 같이 봐야한다는 것이다. 대부분의 포스팅은 이벤트 루프에서 중요한 일부분만을 설명하고 넘어가는데, 이러면 이벤트 루프가 진짜 어떻게 동작하는지는 알기 힘들고 잘못된 오해를 할 수도 있다는 것을 강조하고 있다.

<center>
  {% asset_img node-js-wrong-event-loop_wdvpem.png 500 %}
  <br>
</center>

위 그림은 구글에서 `nodejs event loop`를 검색했을 때 나오는 이미지들을 캡쳐한 것이다. 그리고 대다수의 이미지 결과들은 잘못 되었거나 실제 이벤트 루프가 High Level에서 어떻게 작동하는 지만 설명하고 있다. 이런 방식의 설명들 때문에 개발자들은 종종 이벤트 루프에 대한 잘못된 이해를 하게 된다. 아래 설명할 몇가지 개념은 개발자들이 잘못 알고 있는 몇가지 개념들이다.

## 대표적인 잘못된 개념들
### 이벤트 루프는 JS 엔진 내부에 있다
대표적인 잘못된 개념들 중 하나는 바로 이벤트 루프가 자바스크립트 엔진<small>(V8, Spider Monkey 등)</small>의 일부라는 것이다. 하지만 이벤트 루프는 단지 자바스크립트 코드를 실행하기위해 자바스크립트 엔진을 이용하기만 할 뿐이다.<small>(역주: 실제로 V8 엔진에는 이벤트 루프를 관리하는 코드가 없다. Node.js나 브라우저가 이벤트 루프를 담당하는 것)</small>

### 이벤트 루프는 하나의 스택 또는 하나의 큐로만 작동한다
일단 첫 번째로, 이벤트 루프에서 스택은 존재하지 않는다. 두 번째, 프로세스는 여러 개의 큐<small>(자료구조에서의 그 큐 맞다.)</small>를 사용하는 복잡한 존재이다. 그러나 대부분의 개발자들은 자바스크립트의 모든 콜백이 단 하나의 큐에서만 대기한다고 알고 있는데, 이것은 완전히 잘못된 생각이다.

### 이벤트 루프는 여러 개의 스레드에서 실행된다
Node.js 이벤트 루프의 잘못된 다이어그램으로 인해 우리는 한 개의 스레드가 자바스크립트의 실행을 담당하고 다른 한 개는 이벤트 루프를 담당하는, 총 두 개의 스레드가 있다고 생각하게 되었다.<small>(필자도 자바스크립트 뉴비 시절에 그렇게 생각했다.)</small>

그러나 실제로는 단 한 개의 스레드로 이 모든 것을 처리한다.

### setTimeout은 일부 비동기 OS API와 관련있다.
또 다른 큰 오해는 `setTimeout`의 딜레이가 끝났을 경우 콜백이 외부의 요인으로 인해<small>(OS나 커널 같은)</small> 의해 큐에 들어가게 된다는 것이다. 음, 사실 외부의 요인 같은 건 없다. 우리는 밑에서 이 메커니즘에 대해서 좀 더 자세히 알아볼 것이다.

### setImmediate의 콜백은 콜백 대기열의 첫번째에 위치한다
보통 일반적인 이벤트 루프에 대한 설명들은 하나의 큐만 가지고 설명을 진행하기 때문에, 몇몇 개발자들은 `setImmediate()`가 콜백을 작업 큐의 가장 앞쪽에 배치한다고 생각하게 된다. 하지만 이것은 완전히 틀린 내용이며, 모든 작업 큐들은 `FIFO(First In First Out)`로만 작동한다.<small>(역주: 큐에 들어있는 작업의 포지션을 변경하지 않는다는 것이다)</small>

## 이벤트 루프의 구조
일단 이벤트 루프의 구조를 이해하기 위해서는 이벤트 루프의 워크 플로우에 대해서 알고 있어야 한다. 이미 한번 언급했듯이, 작은 그림인 하나의 큐만 보는 것은 이것을 이해하는 데 별로 도움이 되지 않는다. 밑의 그림은 이벤트 루프를 제대로 설명한 그림이다.

<center>
  {% asset_img nodejs-event-loop-phase.png 500 %}
  <br>
</center>

이 그림에 표기된 각각의 상자는 특정 작업을 수행하기 위한 페이즈들을 의미한다. 각각의 페이즈는 큐를 가지고 있으며, 자바스크립트의 실행은 이 페이즈들 중 `Idle, prepare` 페이즈를 제외한 어느 단계에서나 할 수 있다.<small>(이해를 돕기 위해 큐라고 설명했지만 사실 실제 자료구조는 큐가 아닐 수도 있다.)</small>

그리고 위 그림에서 `nextTickQueue`과 `microTaskQueue`를 볼 수 있는데, 이 친구들은 이벤트 루프의 일부가 아니며 이 친구들의 콜백 또한 어떤 페이즈에서든 실행될 수 있다. 또한 이 친구들의 콜백은 가장 높은 우선 순위를 가지고 실행된다.

이제 우리는 이벤트 루프가 각자 다른 여러 개의 페이즈와 그들의 큐의 조합으로 이루어진다는 것을 알게 되었다. 이제 각각의 페이즈의 대한 설명을 진행하겠다.

### Timer phase
`Timer phase`는 이벤트 루프의 시작을 알리는 페이즈이다. 이 페이즈가 가지고 있는 큐에는 `setTimeout`이나 `setInterval` 같은 타이머들의 콜백을 저장하게 된다. 이때 실제로 콜백을 큐에 밀어 넣지는 않지만, 타이머들을 `min-heap`으로 유지하고 실행할 때가 된 타이머들을 실행한다.

### Pending i/o callback phase
이 페이즈에서는 이벤트 루프의 `pending_queue`에 들어있는 콜백들을 실행한다. 이 콜백들은 이전 명령에서 큐에 들어와있던 것들이다. 예를 들면 여러분이 TCP 핸들러에서 파일에 뭔가를 쓰려고 하고 그 작업이 끝났을 때, 그 핸들러의 콜백이 이 큐에 들어오는 것이다.<small>(파일 쓰기는 보통 비동기로 이루어진다.)</small> 또한 그 핸들러의 에러 콜백도 이 큐에서 찾아볼 수 있다.

### Idle, Prepare phase
이름은 `Idle phase`이지만 이 페이즈는 매 Tick마다 실행된다. `Prepare phase` 또한 매 폴링(Polling)때마다 실행된다. 어쨌든 이 두개의 페이즈는 이벤트 루프와 직접적인 관련이 있다기보다는 Node.js의 내부적인 관리를 위한 것이기 때문에 이 포스팅에서는 설명하지 않겠다.

### Poll phase
필자가 생각하기에 전체 이벤트 루프 중 가장 중요한 페이즈는 바로 이 `Poll phase`라고 생각한다. 이 페이즈에서는 새로운 수신 커넥션<small>(새로운 소켓 설정 등)</small>과 데이터<small>(파일 읽기 등)</small>를 허용한다. 우리는 여기서 일어나는 일을 크게 두 가지로 나눠볼 수 있다.

- 만약 `watch_queue`<small>(Poll phase가 가지고 있는 큐)</small>에 무언가가 들어있다면, 큐가 비거나 시스템의 최대 한도에 다다를 때까지 동기적으로 실행된다.
- 일단 큐가 비어있다면, Node.js는 새로운 연결 같은 것들을 기다리고 있을 것이다. Node.js가 기다리는 시간은 여러 가지 요인에 따라 계산되는데, 이 부분은 밑에서 따로 설명하도록 하겠다.

### Check phase
`Poll phase`의 다음 페이즈는 바로 `setImmediate`의 콜백 만을 위한 페이즈인 `Check phase`이다. 이렇게 얘기하면 보통 하시는 질문은, `왜 setImmediate의 콜백만을 위한 큐인가요?`이다. 음, 그건 밑에서 필자가 워크 플로우 섹션에서 다시 얘기할 `Poll phase`에서 수행하는 행동들 때문이기도 하다. 일단 지금은 `Check phase`가 `setImmediate`의 콜백 전용 단계라는 사실만 기억하고 있자.

### Close callbacks
`socket.on('close', () => {})`과 같은 `close` 이벤트 타입의 핸들러들은 여기서 처리된다.

### nextTickQueue & microTaskQueue
`nextTickQueue`는 `process.nextTick()` API를 사용하여 호출된 콜백을 가지고 있으며, `microTaskQueue`는 Resolve된 프로미스의 콜백을 가지고 있다.

These two are not really part of the event loop, i.e. not developed inside libUV library, but in node.js. They are called as soon as possible, whenever the boundary between C/C++ and JavaScript is crossed. So they are supposed to be called right after the currently running operation (not necessarily the currently executing JS function callback).

이 둘은 실제로는 이벤트 루프의 일부가 아니다. 즉, `libUV` 라이브러리에 포함된 것이 아니라 `Node.js`에 포함된 친구들이라는 것이다.<small>(역주: libUV는 Node.js에서 사용하는 비동기 I/O 라이브러리이다. C로 작성됨.)</small> 이 친구들이 가지고 있는 작업들은 현재 실행되고 있는 작업이 끝나자마자 호출되어야한다.

## 이벤트 루프의 작업 흐름
우리가 `node my-script.js`를 콘솔에서 실행시켰을 때, Node.js는 이벤트 루프를 설정한다음 이 이벤트 루프 밖에서 메인 모듈인 `my-script.js`를 실행한다. 한번 메인 모듈이 실행되고나면 Node.js는 이벤트 루프가 활성 상태인지, 즉 이벤트 루프 안에서 해야할 작업이 있는 지 확인한다. 만약 그렇지 않다면 Node.js는 `process.on('exit, () => {})`를 실행하고 이벤트 루프를 종료하려고 할 것이다.

그러나 만약 이벤트 루프가 활성화되어있다면 Node.js는 이벤트 루프의 `Timer phase`를 실행한다.

<center>
  {% asset_img nodejs-event-loop-workflow.png 600 %}
  <br>
</center>

### Timer phase
이벤트 루프가 `Timer phase`에 들어가게 되면 실행할 타이머 큐에 뭐가 있는 지 확인부터 시작한다. 그냥 확인이라고 하면 간단해보이지만 사실 이벤트 루프는 적절한 콜백들을 찾기 위해 몇 가지 단계를 수행하게된다.
실제로 타이머 스크립트는 오름차순으로 힙에 저장된다. 그래서 제일 먼저 저장된 타이머들을 하니씩 까서 `now - registeredTime == delta`를 검사하게 된다.<small>(역주: `delta`는 `setTimeout(() => {}, 10)`에서의 `10`)</small> 

만약 조건에 해당된다면 이 타이머의 콜백을 실행하고 다음 타이머를 확인한다. 만약 조건에 해당하지 않는 타이머를 만난다면, 탐색을 바로 종료하고 다음 페이즈로 이동한다. 타이머는 힙 내부에 오름차순으로 정렬되어있기 때문에 그 이후로는 탐색을 해도 의미가 없기 때문이다.

예를 들어 딜레이 값이 `100`, `200`, `300`, `400`인 4개의 타이머(A, B, C, D)를 어떤 특정 시간 `t`에 한번에 불러왔다고 생각해보자.

<center>
  {% asset_img Screen-Shot-2018-02-18-at-12.50.48-PM.png 500 %}
  <br>
</center>

자, 이제 이벤트 루프가 `t+250`에 Timer phase에 진입했다고 가정해보자. 가장 먼저 타이머 A를 찾아낸 후 만료 기간이 `t+100`이라는 것을 알게 될 것이다. 그러나 지금은 이미 `t+250`이다. 그러므로 타이머 A의 콜백은 실행될 것이다. 그리고 타이머 B를 찾아내어 만료 기간이 `t+200`임을 체크하게되고, 타이머 B 역시 실행된다. 이제 타이머 C를 체크하게 되는데 이 타이머의 딜레이는 `t+300`이기 때문에 페이즈가 종료된다. 이벤트 루프는 타이머 D는 체크하지 않는데, 위에서 설명했듯이 타이머들은 만료 기간 순으로 오름차순 정렬되어있기 때문에 타이머 C의 뒤쪽에는 어차피 타이머 C보다 만료 기간이 긴 타이머들만 있기 때문이다.

참고로 페이즈는 시스템의 실행 한도에도 영향을 받고 있으므로, 실행 되어야하는 타이머가 아직 남아 있다고 하더라도 시스템 실행 한도에 도달한다면 바로 다음 페이즈로 넘어가게된다.

### Pending i/o phase
타임 페이즈가 종료된 후 이벤트 루프는 Pending i/o 페이즈에 진입하여 이전 작업에서 발생한 일부 콜백이 보류 중인지 체크하게 된다. 만약 펜딩 중이라면 `pending_queue`가 비거나 시스템의 실행 한도 초과에 도달할 때까지 계속 해서 콜백들을 실행한다.
이 과정이 종료되면 이벤트 루프는 `Idle Handler Phase`로 이동하게 된 후 내부 처리를 위한 `Prepare phase`를 거쳐 최종적으로 가장 중요한 단계인 `Poll Phase`에 도달하게 된다.

### Poll phase
이름에서 알 수 있듯이 이 페이즈는 Watching하는 단계이다. 새로운 수신 요청이나 연결이 생성되는 지의 여부를 감시하고 있다는 것이다.
이벤트 루프가 `Poll phase`에 들어왔을 때, 이벤트 루프는 파일 읽기나 새로운 소켓 연결 요청, 새로운 HTTP 연결 요청과 같은 `watcher_queue` 내부의 스크립트들을 실행하게 된다. 이 과정 또한 `watcher_queue`가 비거나 시스템의 실행 한도 초과에 다다를 때까지 계속 된다. 

만약 더 이상 콜백들을 실행할 수 없는 상태가 된다면 이 폴링 작업은 특정한 조건에 의해 조금 더 대기할 수 있다.
만약 `check_queue`, `pending_queue`, `closing_callbacks_queue`에 펜딩 중인 작업이 있다면 이 작업은 0ms 만큼 대기한다. 이때 타이머 힙에서 첫번째 타이머를 꺼냈을 때 만약 해당 타이머가 실행 가능한 상태라면 그 타이머를 사용하여 대기 시간을 결정한다. 만약 첫번째 타이머가 만료 기간이 지나서 사용할 수 없는 상태라면, 전혀 기다리지 않고 바로 다음 페이즈로 넘어가게 된다.

### Check phase
`Poll phase`가 지나면 이벤트 루프는 바로 `setImmediate()` API의 콜백과 관련이 있는 `Check phase`에 들어서게 된다. 이 페이즈에서는 다른 페이즈와 마찬가지로 큐가 비거나 시스템 실행 한도 초과에 도달할 때까지 계속 해서 `setImmediate`의 콜백들을 실행한다.

### Close callback
`Check Phase`가 종료된 후에, 이벤트 루프의 다음 목적지는 `close`나 `destory` 콜백 타입들을 관리하는 `Close callback`이다.
이벤트 루프가 `Close callback`들과 함께 종료되고나면 이벤트 루프는 다음에 돌아야할 루프가 있는지 다시 체크 하게 된다. 만약 아니라면 그대로 이벤트 루프는 종료된다. 하지만 만약 더 수행해야할 작업들이 남아 있다면 이벤트 루프는 다음 이터레이션을 향해 나아가기 시작하고 다시 `Timer Phase`부터 시작하게 된다.
만약 여러분이 `Timer Phase`에서의 예시를 기억하고 있다면 이제 다음 루프의 `Timer Phase`에서는 타이머 C의 만료 시간이 경과했는지부터 확인을 시작할 것이다.

### nextTickQueue & microTaskQueue
그래서 결국 이 두 큐에 들어있는 콜백들은 언제 실행되는 걸까? 이 두 큐의 콜백들은 현재 페이즈에서 다음 페이즈로 넘어가기 전에 자신이 가지고 있는 콜백들을 최대한 빨리 실행해야하는 역할을 맡고 있다. 다른 페이즈들과는 다르게 이 두 큐는 시스템 실행 한도 초과에 영향을 받지 않기 때문에 Node.js는 이 큐가 완전히 비워질 때까지 콜백들을 실행한다. 또한 `nextTickQueue`는 `microTaskQueue`보다는 높은 우선 순위를 가지고 있다.

### Thread-pool
필자가 자바스크립트 개발자에게 가장 많이 들은 단어는 바로 `스레드풀(ThreadPoll)`이다. 그리고 이와 관련된 가장 큰 오해는 바로 Node.js가 모든 비동기 명령을 처리하는 데 사용하는 스레드풀을 가지고 있다는 것이다.
그러나 팩트는 다음과 같다. 스레드 풀은 libUV<small>(Node.js 내에서 사용되는 비동기 처리를 위한 서드파티 라이브러리)</small>에 포함된 무언가라는 것이다.
필자가 이벤트 루프의 다이어그램에 스레드풀을 별도로 표시하지 않은 이유는 스레드풀 자체가 이벤트 루프 매커니즘의 일부가 아니기 떄문이다. `libUV`는 운영체제의 비동기 API만을 사용하여 이벤트 드리븐을 유도할 수 있을 만큼 충분히 훌륭하다. 그러나 파일 읽기, DNS Lookup 등 libUV 자체적으로 처리할 수 없는 경우에는 스레드풀을 사용하게 되는데, 이때 기본 값으로 4개의 스레드를 사용하도록 설정되어있다. `uv_threadpool` 환경 변수를 사용하면 최대 128개까지 스레드 개수를 늘릴 수도 있다.

## Workflow with examples
이제 자바스크립트를 비동기식으로 작동하게 하기 위해 만들어진 이 동기적인 루프 안에서 C언어가 얼마나 큰 역할을 하고 있는 지 이해되기 바란다. 이 구조는 한번에 단 한개의 작업만 실행하고 있지만 그 어떤 것도 블로킹하지 않는다.
어쨌든 백문이불여일견이니, 코드 스니펫으로 이것들을 이해해보는 시간을 가져보도록 하자.

### Snippet 1 – basic understanding

```js
setTimeout(() => {
    console.log('setTimeout');
}, 0);
setImmediate(() => {
  console.log('setImmediate');
});
```

Thus the exact calculation is a little bit buggy you can say. And that’s the reason of this uncertainty. Similar thing is expected if you try to execute the same code within a callback of a timer api (eg: setTimeout).

위 결과를 예측할 수 있겠는가? 음, 아마도 여러분은 `setTimeout`이 먼저 출력된다고 생각하겠지만, 사실 장담할 수 없다. 왜냐? 메인 모듈이 실행되고 `Timer phase`에 진입할 때 여러분의 타이머를 찾을 수도 있고 못찾을 수도 있기 때문이다. 왜냐면 타이머 스크립트는 시스템의 시간과 사용자가 제공한 시간을 사용하여 등록되기 때문이다. 이제 `setTimeout`이 호출된 순간 타이머는 메모리에 타이머 스크립트를 저장하게되는데, 그 순간 컴퓨터의 성능이나 Node.js가 아닌 외부 작업 때문에 약간의 딜레이가 발생할 수 있기 때문이다. 또 다른 포인트는 Node.js가 `Timer phase`에 진입하기 전에 변수 `now`를 선언하고 그 변수 `now`를 현재 시간으로 간주한다는 점이다. 그러므로 정확한 계산이라고 하기에는 약간의 노이즈가 껴있다는 것이고, 이게 바로 `setTimeout`이 반드시 먼저 실행될 것이라고 확신할 수 없는 불확실성의 이유가 된다.

그러나 만약 여러분이 이 코드를 I/O 사이클의 내부로 옮긴다면, 반드시 `setTimeout`보다 `setImmediate`가 먼저 실행되는 것을 보증할 수 있게된다.

```js
fs.readFile('my-file-path.txt', () => {
  setTimeout(() => {
    console.log('setTimeout');
  }, 0);
  setImmediate(() => {
    console.log('setImmediate');
  });
});
```

### Snippet 2 – understanding timers better

```js
var i = 0;
var start = new Date();
function foo () {
    i++;
    if (i < 1000) {
        setImmediate(foo);
    } else {
        var end = new Date();
        console.log("Execution time: ", (end - start));
    }
}
foo();
```

The example above is very simple. A function foo is being invoked using `setImmediate()` recursively till a limit of 1000. In my macbook pro with node version 8.9.1 it is taking `6 to 8 ms` to get executed. 
Now let’s change the above snippet with the following where I just changed the `setImmediate(foo)` with `setTimeout(foo, 0)`.

```js
var i = 0;
var start = new Date();
function foo () {
    i++;
    if (i < 1000) {
        setTimeout(foo, 0);
    } else {
        var end = new Date();
        console.log("Execution time: ", (end - start));
    }
}
foo();
```

Now if I run this in my computer it takes `1400+ ms` to get executed. 
Why it is so? They should be very much same as there are no i/o events. In both the cases the waiting time in poll will be zero. Still why taking this much time? 
Because comparing time and finding out the deviation is a CPU intensive task and takes a longer time. Registering timer scripts also does take time. At each point the timer phase has to go through some operations to determine whether a timer is elapsed and the callback should be executed or not. The longer time in execution may cause more ticks as well. However in case of setImmediate, there are no checks. It’s like if callback is there in the queue, then execute it.

### Snippet 3 – understanding nextTick() & timer execution

```js
var i = 0;
function foo(){
  i++;
  if(i>20){
    return;
  }
  console.log("foo");
  setTimeout(()=>{
    console.log("setTimeout");
  },0);
  process.nextTick(foo);
}   
setTimeout(foo, 2);
```

What do you think the output of the function above should be? Yes, it will first print all the `foo`s, then print `setTimeout`s. Cause after 2ms, the first foo will be printed which will invoke `foo()` again in nextTickQueue recursively. When all nextTickQueue callbacks are executed, then it will take care of others, i.e. setTimeout callbacks.

So is it like nextTickQueue is getting checked after each callback execution? Let’s modify the code a bit and see.

```js
var i = 0;
function foo(){
  i++;
  if(i>20){
    return;
  }
  console.log("foo", i);
  setTimeout(()=>{
    console.log("setTimeout", i);
  },0);
  process.nextTick(foo);
}

setTimeout(foo, 2);
setTimeout(()=>{
  console.log("Other setTimeout");
},2);
```

I’ve just added another setTimeout to print `Other setTimeout` with same delay time as the starting setTimeout. Though it’s not guaranteed, but chances are after one foo print, what you will find in the console is `Other setTimeout`. That is because the similar timers are somehow grouped and nextTickeQueue check will be done only after the ongoing group of callback execution.

## Few common questions
### Where does the javascript get executed?
As many of us had an understanding of event-loop being spinning in a separate thread and pushing callbacks in a queue and from that queue one by one callbacks are executed; people when first read this post may get confused where exactly the JavaScript gets executed. 
Well, as I said earlier as well, there is only one single thread and the javascript executions are also done from the event loop itself using the v8 (or other) engine. The execution is completely synchronous and event-loops will not propagate if the current JavaScript execution is not completed.

### Why do we need setImmediate, we have setTimeout(fn, 0)?
First of all this is not zero. It is 1. Whenever you set a timer with any value lesser than 1 or grater than 2147483647ms, it is automatically set to 1. So whenever you try to set SetTimeout with zero, it become 1.

setImmediate reduces the headache of extra checking as we already discussed. So setImmediate will make things faster. It is also placed right after poll phase, so any setImmediate callback invoked from a new incoming request will be executed soon.

### Why setImmediate is called immediate?
Well, both setImmediate and process.nextTick has been named wrongly. Actually setImmediate phase is touched only once in a tick or iteration and nextTick is called as soon as possible. So functionally setImmediate is nextTick and nextTick is immediate. 😛

### Can JavaScript be blocked?
As we already have seen, nextTickQueue doesn’t have any limit of callback execution. So if you recursively call `process.nextTick()`, your program will never come out of it, irrespective of what all you have in other phases.

### What if I call setTimeout in exit callback phase?
It may initiate the timer but the callback will never be called. Cause if node is in exit callbacks, then it has already came out of the event loop. Thus no question of going back and execute.

## Few short takeaways
- Event-loop doesn’t have any job stack.
- JavaScript execution is done from the event-loop itself; it’s not like event loop is running in a separate thread and JS execution is being done somewhere else by popping callbacks from a queue.
- setImmediate doesn’t pushes the callback at the front of job queue, we have a dedicated phase and queue for that.
- setImmediate executes in next tick and nextTick is actually immediate.
- nextTickQueue can block your node if called recursively, be careful.

## Credits
Well, I am not in the core node.js development team. All my knowledge regarding this article is earned from different talks and articles and experiments. 
Thanks to [node.js doc](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/) from where I first came to know about this. 
Secondly thanks to Saúl Ibarra Corretgé for his [talk on libUV](https://www.youtube.com/watch?v=sGTRmPiXD4Y). 
Third and most important, thanks to VoidCanvas readers who created many healthy discussions and experiments/examples to understand things and make life simpler 🙂

## Related posts:
