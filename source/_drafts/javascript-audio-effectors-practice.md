---
title: JavaScript로 오디오 이펙터를 만들어보자 - 나만의 소리 만들기
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
  - JavaScript
  - Audio
  - 오디오 이펙터
  - JavaScript Audio API
categories:
  - JavaScript
thumbnail:
---

이번 포스팅에서는 {% post_link javascript-audio-effectors-gain 저번 포스팅 %}에 이어 HTML5 Audio API를 사용하여 실제로 오디오 이펙터를 만드는 과정에 대해서 포스팅 하려고 한다. 저번 포스팅에서 이미 이야기 했듯이 Audio API는 여러 개의 노드를 연결하여 오디오의 흐름을 만들어 내는 것을 기본 개념을 하며, 이펙터를 만들기 위해 필요한 몇 개의 노드를 기본적으로 제공해주기 때문에 그렇게 어려울 건 없다.
<!-- more -->

우리는 단지 우리가 만드려고 하는 이펙터들이 각각 어떤 역할을 하며, 어떤 원리를 가지고 있고, 어떤 용도로 사용되는지만 알고 있으면 된다. 오디오에 사용하는 이펙터는 그 종류가 굉장히 많기 때문에 모든 이펙터를 만들어 볼 수는 없고, 필자가 생각했을 때 가장 대표적으로 많이 사용되는 기본적인 이펙터 5개 정도를 구현해볼 생각이다.

기본적으로 오디오를 로드하여 `소스 노드(Source Node)`를 생성하는 과정은 이미 저번 포스팅에서 설명했기 때문에 따로 설명하지 않겠다. 이번 포스팅에서는 바로 이펙터를 구현하는 내용부터 설명한다. 모든 이펙터는 먼저 해당 이펙터가 하는 일과 원리에 대해서 간략하게 설명하고 이후 묻지도 따지지도 않고 바로 구현 들어가도록 하겠다.

자, 그럼 하나하나 뜯어보도록 하자.

## Compressor
<center>
  {% asset_img compressor.png 500 %}
  <br>
</center>

`컴프레서(Compressor)`는 소리가 일정 크기 이상으로 커질 경우에 이를 꾹꾹 눌러서 다시 작은 소리로 만드는 일종의 압축기 역할을 하는 이펙터이다. 이렇게 소리의 크기를 조절하는 이펙터를 `다이나믹 이펙터`라고 한다.

기본적으로 오디오 소스를 사용할 때 기본적으로 컴프레서를 걸어놓고 믹싱을 시작하는 경우가 많은데, 이는 오디오 신호가 일정 크기 이상으로 갑자기 커졌을 때 발생하는 `클리핑(Clipping)` 현상을 방어하기 위해서이기도 하다. 그럼 여기서 한가지 의문이 들 수 있는데,

> 아니 단순히 클리핑을 막는 거면 그냥 Gain을 줄이면 해결되는 거 아니야?

맞다. 사실 게인을 줄여도 어느 정도 클리핑을 방어할 수는 있다. 하지만 일반적으로 음악이란 셈여림이 존재하기 때문에 또 무작정 게인을 낮출 수는 없다.

예를 들어 여러분이 노래방에 갔을 때를 생각해보자. 일반적으로 발라드를 부른다면 노래의 도입부에서는 잔잔한 느낌으로 조용히 부르다가 후렴에서는 고음을 내기위해 성대를 통과하는 공기의 압력이 올라가며 음량이 커진다. 이때 무작정 게인을 낮춰서 녹음하는 방향으로 접근한다면 필연적으로 가장 큰 소리인 후렴의 빵빵 지르는 소리의 크기에 게인을 맞출 수 밖에 없고, 그러면 도입부의 잔잔한 부분은 거의 들리지도 않을 것이다.

<center>
  {% asset_img buzz.jpg 500 %}
  <small>창법에 따라 조금씩 다르지만 이 음량 차이는 생각보다 크다.</small>
  <br>
</center>

이때 컴프레서로 입력 게인을 적당한 수준으로 높혀주고 너무 큰 소리는 압축하여 노래 도입부의 작은 소리와 후렴부의 큰 소리의 격차를 좁혀 전체적인 소리의 크기를 맞추기 위해서 사용하는 것이다.

<center>
  {% asset_img audio-compression.png 500 %}
  <small>Threshold를 넘어선 세기의 신호를 압축해서 Threshold 밑으로 들어가도록 만든다</small>
  <br>
</center>

소리를 압축한다고 하면 뭔가 이해가 잘 안갈 수 있는데, 우리가 일반적인 음원에서 듣고 있는 `퍽!`, `탁!` 하는 깔끔한 드럼소리가 바로 압축된 소리이다. 일반적으로 드럼을 녹음하면 드럼 특유의 통이 울리는 잔향이 남는데, 이 소리를 컴프레서로 압축하면 우리가 일반적으로 듣는 깔끔한 드럼소리로 만들 수 있다.

그 외에도 베이스에 컴프레서를 사용하여 단단한 느낌을 부여하거나 멀리 있는 소리를 가까이로 끌어오거나 그 반대 역할도 할 수 있는 등, 컴프레서만 잘 사용해도 소리에 굉장히 많은 느낌을 부여할 수 있다. 그래서 필자에게 사운드 엔지니어닝을 알려주셨던 선생님도 컴프레서의 중요성을 굉장히 강조하셨던 기억이 난다.

컴프레서는 몇가지 값들을 사용하여 신호를 언제부터 압축할 것인지, 어느 정도의 속도로 압축할 것인지와 같은 세팅을 할 수 있도록 설계되었다. HTML5 Audio API에서 제공하는 `DynamicsCompressorNode`도 이 값들을 동일하게 제공하고 있으므로 우리는 이 값들이 어떤 것을 의미하는지 알아야 올바른 방법으로 이 노드를 사용할 수 있다.

**Threshold**
`Threshold`는 소리를 어느 크기부터 압축할 것인지를 정하는 임계점을 의미한다. 단위는 `DB(데시벨)`을 사용한다.

**Ratio**
`Ratio`는 Threshold를 넘은 소리가 어느 정도의 비율로 줄어들 것인지를 정하는 값이다. 이 값은 `입력:출력`의 비를 의미하기 때문에 일반적으로는 `2:1`, `5:1`와 같은 비율로 이야기한다.

<center>
  {% asset_img ratio.png 300 %}
  <br>
</center>

하지만 HTML5 Audio API의 속성에서는 단위가 조금 다르다. 공식 문서에는 `출력 값의 1db를 변경하기 위해 필요한 db값`이라고 적혀있는데 그냥 이 속성에 `12`를 할당하면 압축 비율이 `12:1`인거라고 생각하면 된다.<small>(공돌이들 특징인 어렵게 말하기가 발동했다)</small>

보통 컴프레서를 `적당히 걸었다`라고 하면 `4:1` 정도의 비율을 말하기 때문에 해당 속성의 기본 값인 `12:1`은 굉장히 하드한 압축 비율이다.

**Attack**
`Attack`은 소리를 어느 정도의 빠르기로 압축할 것인지를 정하는 값이다. Threshold를 넘은 값을 얼마나 빠르게 뚜까 팰까를 정하면 된다고 생각하자. 많은 분들이 여기서 정해주는 어택 타임이 `Attack이 시작되는 시간`으로 잘못 알고 있는 데, Threshold를 넘으면 Attack 자체는 바로 시작된다. 우리가 정해주는 어택 타임은 정해진 `Ratio까지 도달하는 데 걸리는 시간`이다.

단위는 보통 `밀리초(ms)`를 사용하지만 Audio API에서는 `초(seconds)`를 사용한다.

**Release**
Attack이 소리를 누르는 빠르기였다면 `Release`는 압축한 소리를 어느 정도의 빠르기로 다시 풀어줄 것인가를 정하는 값이다. 이때 풀어주는 값은 소리의 원래 크기가 아니라 표준 음량인 10db에 도달하는 시간을 목표로 한다.

`Release`도 Attack과 마찬가지로 단위는 보통 `밀리초(ms)`를 사용하지만 Audio API에서는 `초(seconds)`를 사용한다.

**Knee**
`Knee`는 사실 대부분의 하드웨어 컴프레서에는 없는 기능이지만 소프트웨어 컴프레서에서는 꽤 자주 볼 수 있는 기능이다. 이 값은 컴프레서가 얼마나 `자연스럽게` 적용될 것인지를 결정한다.

<center>
  {% asset_img hard-soft-compression.gif 500 %}
  <br>
</center>

위 그림의 그래프의 꺾이는 정도가 컴프레서가 얼마나 서서히 적용되는지를 보여주고 있다. 이때 빠르게 팍! 적용하는 컴프레션을 `Hard`하다고 하고 천천히 적용하는 컴프레션을 `Soft`하다고 한다.

### Compressror 구현해보기
사실 위에서 이야기 했듯이 HTML5 Audio API는 자체적으로 `DynamicsCompressorNode`를 제공하기 때문에 우리가 소리를 압축하는 알고리즘을 직접 구현할 필요가 없다. 단지 노드를 생성한 후 연결해주기만 하면 될 뿐이다.

이번에는 사용자가 업로드한 오디오 파일에서 오디오 버퍼를 추출하여 소스 노드를 생성하는 것이 아니라 `<audio>` 태그에서 추출하여 소스 노드를 생성하는 방식으로 진행하도록 하겠다.<small>(이렇게 하면 코드가 훨씬 간단해진다)</small>

```js
const audioContext = new (Audiocontext || webkitAudioContext)();
const audioDOM = document.getElementById('my-audio');
const sourceNode = audioContext.createMediaElementSource(audioDOM);

const compressorNode = audioContext.createDynamicsCompressor();
compressorNode.threshold.setValueAtTime(-24, audioContext.currentTime);
compressorNode.attack.setValueAtTime(0.003, audioContext.currentTime);
compressorNode.release.setValueAtTime(0.250, audioContext.currentTime);
compressorNode.ratio.setValueAtTime(12, audioContext.currentTime);
compressorNode.knee.setValueAtTime(30, audioContext.currentTime);

const inputGainNode = audioContext.createGain();
const outputGainNode = audioContext.createGain();

sourceNode.connect(inputGainNode);
inputGainNode.connect(compressorNode);
compressorNode.connect(outputGainNode);
outputGainNode.connect(audioContext.destination);
```

필자는 `소스 -> 게인 -> 컴프레서 -> 게인`의 순서로 오디오 소스의 흐름을 생성했는데, 사실 이건 개인의 취향이다. 하지만 일반적으로 대부분의 컴프레서는 `인풋 게인`과 `아웃풋 게인`을 모두 가지고 있으므로 필자도 이와 동일하게 구현했다.

## Reverb
<center>
  {% asset_img reverb.jpg 500 %}
  <br>
</center>

`리버브(Reverb)`는 소리에 울림을 통해 공간감을 부여하는 `공간계 이펙터`이다. 소리에 울림을 통해 공간감을 부여한다는 게 어떤 의미일까?

사실 우리는 소리를 듣고 현재 있는 공간이 넓은지 좁은지, 이 공간이 거친 벽면으로 이루어져 있는지, 아니면 유리같은 맨들맨들한 공간으로 이루어져 있는지를 대략적으로 파악할 수 있다. 그 차이가 워낙 미세해서 훈련되지 않은 사람이라면 알아채기 힘들 뿐이다.

어떻게 이런 일이 가능할까? 바로 소리의 반사에 의한 `잔향` 때문이다. 먼저, 소리를 듣고 공간의 크기를 감지하는 원리는 간단하다. 필자가 어떤 방 안에서 소리를 `왁!`하고 지른 뒤 얼마 후에 첫번째 반사음이 들리는지를 감지하면 된다. 하지만 이 첫번째 반사음은 `ms` 단위의 굉장히 빠른 속도로 다시 필자에게 돌아오기 때문에 1초, 2초 이렇게 세는 것이 아니라 그냥 느껴야하는 것이다.

이때 이 반사음을 `초기 반사음(Early Reflection)`이라고 한다. 하지만 여기서 끝이 아니다. 소리가 한번 반사되어 여러분의 귀로 전달된 뒤에도 반사는 계속 될 것이다. 이때 이 잔향들은 공간의 사방팔방으로 부딫히고 반사되어 여러분의 귀로 다시 돌아올 것이다.

<center>
  {% asset_img reflection.gif 500 %}
  <small>초록색 선이 초기 반사음, 사방팔방 부딫히는 파란색 선이 바로 잔향이다</small>
  <br>
</center>

이때 이 잔향이 얼마나 오래 들리는가, 얼마나 선명하게 들리는가와 같은 특성이 방의 재질을 결정한다. 이야기만 들으면 이렇게 소리를 듣고 공간을 판별한다는 것이 불가능한 것 같지만 여러분이 이미 평소에 듣고 음악에는 모두 이 원리를 적용한 공간적 설계가 함께 담겨있다.

이렇게 리버브는 말 그대로 잔향을 만들어내기만 하면 되기 때문에 하드웨어 리버브 중에서는 스프링이나 철판 등의 재료를 장비 내부에 넣어놓고 오디오를 재생하여 재료가 떨리며 발생한 잔향을 증폭하는 방식을 사용하는 것도 있다. 즉, 뜯어보면 장비 내부에 스프링이나 철판 하나 딸랑 들어있다는 것이다.<small>(이런 단순한 구조로 좋은 소리를 뽑는 다는 게 더 무섭...)</small>

그러나 리버브를 소프트웨어로 구현할 때는 이야기가 조금 다르다. 컴퓨터는 스프링이나 철판의 떨림과 같은 자연적인 아날로그 신호를 생성할 수 없으므로 직접 계산을 통해 구현해야한다. 이때 소프트웨어 리버브는 크게 두 가지 종류로 나누어지는데 바로 `Convolution Reverb`와 `Algorithm Reverb`이다.

하지만 이 포스팅에서 두 리버브를 모두 구현하기에는 글이 너무 길어질 것 같으므로 아쉬운대로 컨볼루션 리버브에 초점을 맞춰 진행하겠다.<small>(알고리즘 리버브만 해도 포스팅 하나 분량이다.)</small>

### Convolution Reverb
`컨볼루션 리버브(Convolution Reverb)`는 실제 공간의 잔향을 녹음한 후에 잔향 오디오 소스와 원본 오디오 소스를 실제 공간의 울림을 원본 오디오 소스에 합성하는 방법이다.

이때 실제 공간의 잔향을 녹음하는 대표적인 방법을 간단하게 설명하자면, 녹음하고자 하는 공간에 `순수한 사인파(Sine Wave)`의 소리를 낮은 주파수부터 높은 주파수까지 쭈우우욱 이어서 틀고 그때 발생하는 잔향을 녹음하는 것이다.

<center>
  {% asset_img ir-recording.jpg 500 %}
  <small>공간의 IR을 녹음하는 모습 - [Alan JS Han 블로그](http://www.alanjshan.com/impulse-response-capture/)</small>
  <br>
</center>

이때 이 잔향 신호를 `Impulse Response(IR)`이라고 부르기 때문에 컨볼루션 리버브는 `IR 리버브`라는 이름으로도 불린다. 이렇게 녹음한 잔향 소스는 원본 소스에 `컨볼루션(Convolution)`, 또는 합성곱이라고 불리우는 연산을 통해 합쳐지게 된다.

이 컨볼루션이라는 개념을 수학적으로 접근하면 직관적으로 이해하기 힘들테니 간단하게 정의해보자면, 그냥 서로 다른 정보들을 섞는 것이라고 표현할 수 있다. 이 포스팅을 읽는 분들은 아마 개발자 분들이 많을 테니 우리에게 좀 더 친숙한 머신러닝을 사용하여 컨볼루션을 설명하자면 학습 알고리즘 중 하나인 `CNN(Convolution Neural Network)`을 예로 들어볼 수 있겠다.

CNN에서도 첫번째 레이어의 이미지를 두번째 레이어로 보낼 때 행렬로 구현한 커널<small>(또는 필터)</small>와 이미지를 섞어서 피처맵을 생성한 후 다음 레이어로 보내게된다. 이때 첫번째 레이어의 이미지와 커널의 정보가 섞인 것이라고 생각할 수 있다.

<center>
  {% asset_img convolution.png 500 %}
  <small>원본 이미지와 커널을 섞어서 새로운 정보인 피처맵을 만들어낸다</small>
  <br>
</center>

오디오에서의 컨볼루션 리버브도 이와 마찬가지다. 이 경우에는 섞어야하는 정보가 원본 소스와 잔향 소스가 된 것 뿐이다.

<center>
  {% asset_img signal-convolution.png 500 %}
  <small>원본 신호와 녹음한 IR 신호를 컨볼루션 연산한 모습</small>
  <br>
</center>

사실 HTML5 Audio API는 컨볼루션 연산을 대신 수행해주는 `Convolver Node`를 제공하기 때문에 컨볼루션이 무엇인지 몰라도 컨볼루션 리버브를 만드는 데는 아무 문제가 없다.

그러나 적어도 이 이펙터가 2개의 신호 정보를 곱해서 새로운 신호를 만들어내는 원리를 가지고 있다는 것을 알아야 필자가 왜 이런 코드를 작성하는지도 알 수 있기 때문에 대략적인 설명을 하는 것이다.<small>(그리고 사실 필자도 컨볼루션 연산이 정확히 어떤 계산을 통해서 값을 뽑아내는지는 잘 모른다.)</small>

어쨌든 컨볼루션 리버브의 대략적인 원리를 파악했다면 이제 만들어보도록 하자!

### Convolution Reverb 구현해보기
먼저 HTML5 Audio API는 `Reverb Node` 같은 건 제공하지 않는다. 하지만 위에서 설명했듯이 컨볼루션 연산을 지원하는 `Convolver Node`를 제공해주고 있기 때문에 우리는 잔향 소스인 `IR(Impulse Response)`만 직접 만들어주면 된다.

그리고 일반적으로 리버브는 `wet`과 `dry`라는 수치로 원본 소스와 잔향 소스를 비율에 맞게 섞을 수 있도록 제작되므로 필자도 동일하게 코드를 작성하겠다.

```js
const mix = 0.5;
const earlyReflectionTime = 0.01;
const decay = 0.01;

const audioContext = new (Audiocontext || webkitAudioContext)();
const audioDOM = document.getElementById('my-audio');
const sourceNode = audioContext.createMediaElementSource(audioDOM);
```

자, 소스 노드까지 뚝딱 만들었다. 소스 노드를 생성하기 위한 코드 위에 선언한 3개의 변수를 설명하자면 `mix`는 wet/dry의 비율을 의미하고, `earlyReflectionTime`은 위에서 설명했던 초기 반사음, `decay`는 나머지 잔향들이 감소하는 빠르기를 의미한다.

그럼 이제 이 값들을 사용하여 직접 `IR`을 생성해보자.

```js
function generateImpulseResponse () {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * earlyReflectionTime;
  const impulse = audioContext.createBuffer(2, length, sampleRate);

  const leftImpulse = impulse.getChannelData(0);
  const rightImpulse = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    leftImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, deacy);
    rightImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, deacy);
  }

  return impulse;
}
```





## Delay
## Filter
## EQ