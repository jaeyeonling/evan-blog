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

Suppose event loop entered the timer phase at time `t+250`. It will first find timer A and will see its time of expiration was `t+100`. But now the time is already `t+250`. Thus it will execute the callback attached to timer A. Then it will check B timer and find it was also elapsed at `t+200`, so will do the same with this as well. Now it will go and check C and will find that the time to elapse is `t+300`, and thus will leave it as is. Event loop will not check D because the timer were sorted in ascending order; so D’s threshold is bound to be bigger than C. 
However the phase also has a system dependent hard limit, so even if there are elapsed un-executed timers, but that system dependent max limit is touched, it will move to the next phase.

### Pending i/o phase workflow
After timer phase, event loop will enter the pending i/o phase to check if some callbacks from previous tasks are pending or not in the `pending_queue`. If pending then it will execute one after another till the time the queue is empty or system specific max limit is hit. 
After this, event loop will move to idle handler phase, followed by prepare phase to do some internal operations and then eventually move to probably the most important phase which is `poll phase`.

### Poll phase workflow
As the name suggest, it’s a phase to watch. To watch if new incoming requests or connections are made. 
When event loop enters the poll phase, it execute the scripts in the `watcher_queue`, which includes file read response, new socket or http connection requests till the time either the entire queue is exhausted or like other phases, a system dependent max limit. 
In case there are no more callbacks to execute, poll will try to wait a bit, but with certain conditions. 
If there is any task pending in check queue, pending queue or closing callbacks queue (idle handlers queue as well), it will wait for zero milliseconds. However it will then execute the first timer (if available) from timer heap to decide the waiting time. If first timer threshold is elapsed, then obviously it won’t wait at all.

### Check phase workflow
After poll phase event loop will immediately come down to check phase where in the queue there could be callbacks invoked by the api `setImmediate()`. It will start executing one after another synchronously just like the other phases, till the time either the queue is exhausted or the max limit which is system dependent is hit.

### Close callback workflow
After completing the tasks in check phase, event loop’s next destination is `close callback` which handles close or destroy type of callbacks. 
After event loop is done with close callback executions, it will check again if the loop is alive. If not, then it will simply exit. But if there are things, then it will go for the next iteration; thus, in the timer phase. 
If you consider our previous example of timer (A & B) expiration, then now in the timer phase it will check if timer C is elapsed or not.

### nextTickQueue & microTaskQueue
So, when do the callbacks of these two queues run? They run as soon as possible and definitely before going to the next phase from the current one. Unlike other phases these two don’t have any system dependent max limit and node executes them till the time they are completely empty. However, nextTickQueue gets more priority over microTaskQueue.

### Thread-pool
A very common word i hear from JavaScript developers is `ThreadPool`. And a very common misconception is, node.js has a thread-pool which is used to handle all async operations. 
But the fact is thread-pool is something in libUV library (used by node for third party asynchronous handling). 
I haven’t displayed this in the event loop diagram, because it’s not a part of the event loop mechanism. We may describe it in a separate post about libUV. 
For the time being, I would just like to tell you that every async tasks is not handled by the thread-pool. LibUV is smart enough to use operating system’s async apis to keep the environment event driven. However, where it can not do so, like, file reading, dns lookup etc., are handled by the thread-pool, which uses only 4 threads by default. You can increase the thread size by setting `uv_threadpool_size` environment variable till 128.

## Workflow with examples
Hope you got an idea of how things are working. How a synchronous semi infinite while loop in `C language` is helping JavaScript to become asynchronous in nature. At a time, it is executing just one thing but still anything is hardly blocking. 
Anyway, no matter how good we describe the theories, I believe we best understand things with examples. So let us understand the scenarios with some code snippets.

### Snippet 1 – basic understanding

```js
setTimeout(() => {
    console.log('setTimeout');
}, 0);
setImmediate(() => {
  console.log('setImmediate');
});
```

Can you guess the output of the above? Well, you may think `setTimeout` will be printed first, but it’s not something guaranteed. Why? That’s because after executing the main module when it will enter the timer phase, it may or may not find your timer exhausted. Again, why? Because, a timer script is registered with a system time and the delta time you provide. Now the moment setTimeout is called and the moment the timer script is written in the memory, may be a slight delay depending on your machine’s performance and the other operations (not node) running in it. Another point is, node sets a variable `now` just before entering the timer phase (on each iteration) and considers `now` as current time. Thus the exact calculation is a little bit buggy you can say. And that’s the reason of this uncertainty. Similar thing is expected if you try to execute the same code within a callback of a timer api (eg: setTimeout).

However, if you move this code in i/o cycle, it will give you a guarantee of setImmediate callback running ahead of setTimeout.

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
