---
title: Deep Learning이란 무엇인가? - Intro
date: 2018-07-17 23:33:01
tags:
  - 머신러닝
  - Machine Learning
  - Deep Learning
categories:
  - Machine Learning
thumbnail: /2018/07/17/deep-learning-intro/thumbnail.jpeg
toc: true
widgets:
  - 
    type: toc
    position: right
  - 
    type: category
    position: right
sidebar:
  right:
    sticky: true
---

이번 포스팅에서는 딥러닝이 무엇인지, 기존의 뉴럴네트워크와 다른 점이 무엇인지에 대해서 포스팅하려고 한다.
<!-- more -->

## Artificial Neural Network란?
인류는 과거부터 생각하는 기계를 만드려는 노력을 해왔다.
그 과정에서 다양한 시도들이 있었고, 결국 고안해낸 방법은 **인간의 뇌를 프로그래밍**
해보자는 것이였다. 이런 발상이 가능했던 것은 현대에 이르러 인간의 뇌의 구조를 어느 정도 알 수 있었기 때문이기도 하고 이 구조가 생각보다 단순하다는 점도 있었다.

<center>{% asset_img 'neural.png' %}</center>

인간의 뇌는 이 `뉴런`이라고 불리는 세포들의 집합체이다. 이 `뉴런`들은 그냥 어떠한 신호를 받은 후에 변조한 다음 다시 전달하는 세포인데, 뇌는 결국 이 뉴런들이 그물망처럼 연결되어있는 구조인 것이다.
결론적으로 인간의 뇌의 구조는 굉장히 복잡하게 `연결`되어있지만 그 `연결체`인 뉴런 자체는 놀랍도록 단순한 구조로 되어있었다는 것이 된다.

이 `뉴런`들은 `수상돌기`에서 input신호를 받아 `축색돌기`로 output신호를 전송하는 구조인데 이때 다음 `뉴런`으로 신호가 전달되기 위해서는 일정 기준, 즉 `threshold` 이상의 전기 신호를 넘겨야한다. 좀 더 자세히 알아보자면 대략 다음 순서를 따른다고 한다.

***
1. 뉴런에 연결되어 있는 여러 개의 시냅스로 부터 신호를 받는다.
이때 신호는 분비된 화학물질의 양({% math %}x{% endmath %})과 분비되는 시간({% math %}w{% endmath %})의 곱으로 나타내어 질 수 있다.

2. 여러 개의 시냅스로부터 받은 여러 개의 신호를 합친다.

3. 다음 시냅스로 전달하기 전에 특정한 값({% math %}b{% endmath %})이 더해진다.

4. 이 값이 특정 임계점을 넘어가면 신호가 다음 시냅스로 전달된다.
***

그냥 순서만 보면 꽤 간단해 보인다. 그럼 이걸 기계로도 만들 수 있지 않을까? 라는데서 출발한 것이 `Artificial Neural Network`인 것이다. 이 뉴런의 작동방식은 다음과 같이 도식화 될 수 있다.

<center>{% asset_img 'artificial-neural-network.jpg' 500 %}</center>

수식으로 나타내면 다음과 같다.

$$f(\sum\limits_{i=1}^n x_i w_i + b)$$

이때 이 함수 $f$를 `Activation Funcntion`이라고 하고 이 함수는 함수 내부의 값이 `threshold`를 넘어가면 `1`을 리턴하고 아니면 `0`을 리턴하는 함수이다.
이것이 하나의 `뉴런`이라고 생각하면 이 `뉴런`을 여러 개 모아본다면 대략 아래와 같은 구조가 될 것이다.

<center>{% asset_img 'single-layer-network.jpg' 500 %}</center>

그리고 이런 형태의 기계는 이미 1950년대에 개발되어 `AND`나 `OR`문제 같은 선형방정식은 풀 수 있을 정도였다.


## 암흑기의 도래
자 그럼 여기서 한가지 의문이 생긴다.

> *아니 지금은 21세기하고도 18년이나 지난 2018년인데, 1950년대에 이미 저기까지 개발이 됐으면 지금은 로봇이 나 대신 일도 해주고 어? 빨래도 해주고 어? 해야하는 거 아니냐!*

하는 생각이 들 수도 있다. 우선 아까 말한 `AND`와 `OR`를 다시 보자.

<center>{% asset_img 'or.png' %}{% asset_img 'and.png' %}</center>

`AND`와 `OR`는 선형방정식이기 때문에 1950년대에 개발한 `Single Layer Network`를 적용한 기계로도 이런 문제를 푸는 건 별로 어렵지 않았다.
여기까지 성공한 사람들은 **대박이다. 이제 금방 기계가 걷고 뛰고 말도 할 수 있겠구나!** 라고 생각했지만.. `XOR`가 등장하면 어떨까?

<center>{% asset_img 'xor.png' %}</center>

와 이건 어떻게 선을 그어도 도저히 답이 없다. `XOR`는 두개의 인풋이 `같지 않으면 true`인 논리식이다. 굉장히 단순해보였지만 `XOR`는 선형방정식이 아니기 때문에 직선으로는 50%의 정확도밖에 낼 수 없었다. 여기까지 직면한 사람들은 좌절하게 된다.

{% blockquote Perceptrons(1969), Marvin Minsky %}
We need to use MLP, Multi Layer Perceptrons.
No one on earth had found a viable way to train MLPs good enough to learn such simple functions.
{% endblockquote %}

결국 1969년 **Marvin Minsky** 가 `Single Layer Network`로는 `XOR`문제를 풀 수 없다는 것을 수학적으로 증명한다. `Multi Layer Network`로는 가능한데 아무도 학습시킬 수 없다고 했단다.
이 이유에 대해서 좀 더 알아보고 싶어서 `Perceptrons`의 구문을 찾아보니

{% blockquote Perceptrons(1969), Marvin Minsky %}
it ought to be possible to devise a training alhorithm to optimize the weights in thie using, say, the magnitude of a reinforcement signal to communicate to the net the cost of an error. We have not investigated this.
{% endblockquote%}

라고 한다. 구글링 하다보니까 `Perceptrons`라는 책은 `XOR`가 `Single Layer Network`로 왜 학습이 안되는 지에 대해서 집중적으로 설명하고나서

> 어...음 Multi Layer Network로 학습시키면 되는 건 알겠는데 어떻게 해야하는 지는 아직 잘 모르겠다.

정도로 쓴 책이라는 의견도 있었다.
어찌됐던 이 책으로 인해 많은 사람들이 실망을 하게 되고 이로 인해 `Neural Network`라는 학문 자체가 암흑기에 빠지게 된다.


## 다시 재기의 시간
1974년 **Paul Werbos** 는 자신의 박사학위 논문에 `Backpropagation`이라는 알고리즘을 게재하게 된다.
그러나 슬프게도 아무도 관심을 가지지 않았고 심지어 `Perceptrons`의 저자인 **Marvin Minsky** 마저도 관심을 안가져줬다고 한다. 심지어 1982년도에 다시 논문을 발표하게 됐는데 이때도 그냥 묻혔다고 한다...
그러다가 1986년, **Geoffrey Hinton** 이 독자적으로 이 알고리즘을 다시 발견하고 발표하게 되면서 주목을 받게된다. 어쨋든 이 알고리즘으로 인해 `Multi Layer Network`의 학습이 가능하다는 사실이 알려지고 다시 `Neural Network` 학문은 활기를 띄게 된다.
`Backpropagation`이라는 알고리즘의 구조는 간단하다. 그냥 말 그대로 에러를 output에서 가까운 쪽부터 뒤로(Back) 전파(Propagation)하는 것이다. 그래서 `역전파알고리즘`이라고도 불린다.
이 `Backpropagation`에 대해서는 {% post_link deep-learning-backpropagation 다음 포스팅 %}에서 다시 다루도록 하겠다.

이상으로 Deep Learning 첫번째 포스팅을 마친다.
