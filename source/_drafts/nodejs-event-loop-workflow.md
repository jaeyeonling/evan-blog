---
title: Node.js event loop workflow & lifecycle in low level [번역]
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

A year back while describing the differences between [setImmediate & process.nextTick](http://voidcanvas.com/setimmediate-vs-nexttick-vs-settimeout/), I wrote a bit on the low level architecture of node’s event-loop. 

<!-- more -->

Surprisingly, the readers of that post became more interested about the event-loop part, than the rest of the parts and I have received a lot of responses and queries on the same. 
That’s why I’ve decided to come up with a big picture of the low level work flow of node.js event loop.

> I recommend you to read the entire article and not just bullet points as there are some great infos inside the paragraphs!

## Why am I writing this?
Well, if I google about `node.js event loop`, majority of the articles out there does not describe the big picture (they try to describe with a very high level abstraction).

<center>
  {% asset_img node-js-wrong-event-loop_wdvpem.png 500 %}
  <br>
</center>

This is a screenshot of google image search with `nodejs event loop`. And majority of the image results here are either wrong or having a very high level view on the actual event loop. 
Due to these kind of descriptions, developers often found with some misconceptions and wrong understandings. Below are some of the very common misconceptions.

## Few common misconceptions
### Event loop is inside JS Engine
One of the very common misconceptions is that, the event loop is a part of JavaScript engine (v8, spiderMonkey etc). In reality event-loop is the master which uses the JavaScript engines to execute JavaScript code.

### There is a single stack or queue
First of all there is no stack. Secondly, the process is complicated and have multiple queues (some queue like data-structure) involved. But majority of the developers know that all callbacks are pushed in a single queue, which is completely wrong.

### Event loop runs in a separate thread
Due to the wrong diagram of the event-loop of node.js, some of us (I was one of them in my early JavaScript days) feel that there are two threads; one executing JavaScript and another which runs the event loop. In reality everything is in a single thread.

### Some async OS api involved in setTimeout
Another great misconception is that the callback of setTimeout is pushed in a queue by someone else (may be OS or kernel) when the delay given is completed. Well, there is no someone else; we will discuss the mechanism soon.

### setImmediate places the callback at 0th position
As the common event-loop description has only one queue; thus some developers think `setImmediate()` places the callback at the front of the job queue. This is completely false and every job-queue in JavaScript is FIFO (first in first out).

## Architecture of the event loop
Before we start describing the workflow of event loop, it’s important to know the architecture of the same. 
As I have already told, that little picture with a queue and a spinning wheel doesn’t describe it properly. Below is a phase wise image of the event loop.

<center>
  {% asset_img nodejs-event-loop-phase.png 500 %}
  <br>
</center>

Each boxes in the image above indicates a phase which is dedicated to perform some specific work. Each phase has a queue (I said queue so that you can understand better; the actual data structure may not be a queue) attached to it and JavaScript execution can be done in any of those phases (except idle & prepare). 
You can also see a `nextTickQueue` and another `microTaskQueue` in the picture, which are not really part of the loop and the callbacks inside them can be executed in any phase. They get highest priorities to get executed.

As you now know that the event loop is actually a combination of different phases with different queues; here is a description of each phase.

### Timer phase
This is the starting phase in event loop. This queue, attached in this phase holds the timer (like setTimeout, setInterval) callbacks. 
Though in real it doesn’t actually pushes the callback in the queue, but maintains the timer in a min-heap and executes the callbacks whose timer is elapsed.

### Pending i/o callback phase
This phase executes callbacks which are there in the `pending_queue` of event loop. These kind of callbacks are pushed from previous operations. For an example when you try to write something in a TCP handler and the work is done, then the callback is pushed in this queue. Error callbacks can also be found here.

### Idle, Prepare phase
Though the name is idle, but this phase runs on each tick. Prepare also runs before each time the polling is started. Anyway, these are two phases for internal operations of node; so we are not discussing here. 
We won’t discuss them today.

### Poll phase
Probably the most important phase of the entire event loop is poll phase. This phase accepts new incoming connections (new socket establishment etc) and data (file read etc). We can divide the work of poll in few different parts.

- If there is something in the `watch_queue`, (the queue attached to the poll phase), they will be executed synchronously one after another, till the time the queue is empty or the system specific max limit is reached.
- Once the queue is empty, node will try to wait for new connections etc. The time to wait or sleep is calculated depending on various factors, which we will discuss.

### Check phase
The next phase to poll is `check phase`, which is a phase dedicated for the `setImmediate()` callbacks. The general question arise with this is, why a separate queue for setImmediate callbacks. Well, that’s also something because of the behavior of the poll phase, which we will discuss in the workflow section. Till then just remember check phase is dedicated for the callbacks of setImmediate() api.

### Close callbacks
Close type of callbacks (socket.on(‘close’, ()=>{})) are handled here. More like a cleanup phase it is.

### nextTickQueue & microTaskQueue
Tasks in nextTickQueue holds the callbacks invoked by using the api `process.nextTick()` and microTaskQueue holds those by resolved promises. 
These two are not really part of the event loop, i.e. not developed inside libUV library, but in node.js. They are called as soon as possible, whenever the boundary between C/C++ and JavaScript is crossed. So they are supposed to be called right after the currently running operation (not necessarily the currently executing JS function callback).

## Event loop workflow
When you run `node my-script.js` in your console, node sets up the event-loop and then runs your main module (my-script.js) outside the event loop. Once the main module is executed, node will check if the loop is alive; i.e. if there is something to do in event loop. If no, then it will simply try to exit after executing the exit callbacks. i.e. `process.on('exit', foo)` callbacks. 
But if the loop is alive, node will enter the loop from the timer phase.

<center>
  {% asset_img nodejs-event-loop-workflow.png 600 %}
  <br>
</center>

### Timer phase workflow
So event loop enters the timer phase and checks if anything is there in the timer queue to be executed. Well, the statement may sound very simple, but event-loop actually has to perform few steps to find the appropriate callbacks. 
Actually the timer scripts are stored in a heap memory in ascending order. So it will first take the timer and calculate if `now - registeredTime == delta`. If yes, it will execute the callback of that timer and will check for the next timer. Whenever a timer is not found whose time is not elapsed, it will stop checking others (as timers are sorted in ascending order) and move to the next phase.

Suppose you have called setTimeout 4 times which has created 4 timers (A, B, C and D) with time threshold of `100`, `200`, `300` and `400` milliseconds at (nearly) time `t`.

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
