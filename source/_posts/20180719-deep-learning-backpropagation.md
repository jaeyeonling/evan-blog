---
title: Deep Learning이란 무엇인가? - Backpropagation
date: 2018-07-19 00:27:18
tags:
    - Machine Learning
    - Deep Learning
categories:
    - Machine Learning
---

#### - 들어가며
이번 포스팅에서는 {% post_link deep-learning-intro 저번 포스팅 %}에 이어 `Backpropagation`에 대해서 알아보려고 한다.
전 포스팅에서도 설명했듯, 이 알고리즘으로 인해 `Multi Layer Network`에서의 학습이 가능하다는 것이 알려져, 암흑기에 있던 `Neural Network` 학계가 다시 관심을 받게 되었다.

### Backpropagation이란?
`Backpropagation`은 오늘 날 `Artificial Neural Network`를 학습시키기 위한 일반적인 알고리즘 중 하나이다.
한국말로 직역하면 `역전파`라는 뜻인데, 에러가 output과 가까운 곳 부터 전파된다 해서 붙혀진 이름이다.

### 수식 유도
먼저 모델에 대한 간단한 정의부터 해보자.

***
1. 모델은 1개의 input Layer, 1개의 Hidden Layer, 1개의 Output Layer로 구성된 `2-Layer NN`모델이다.
2. 초기 weight값은 랜덤으로 주어진다.
2. `Activation Function`은 `Sigmoid`를 사용한다.
***

먼저 `Backpropagation`을 사용하려면 전파할 뭔가가 있어야한다. 그렇기 때문에 일단 에러 {% math %}E{% endmath %}를 먼저 구해보도록 한다. 결과값으로 얻기를 바라는 값을 {% math %}\hat{y}{% endmath %}로, 실제 나온 값을 {% math %}y{% endmath %}라고 할 때 에러 {% math %}E{% endmath %}는 다음과 같다.

<center>{% math %}E = \sum\limits_{i=1}^m\frac{1}{2}(\hat{y_i} - y_i)^2{% endmath %}</center>

필자같은 수포자를 위해 쉽게 설명하자면, 그냥 마지막 Output Layer에서 뱉어낸 {% math %}y{% endmath %}과 하나하나 레이블링했던 {% math %}\hat{y}{% endmath%}가 얼마나 차이나는 지 구한 다음에 그걸 다 더한다는 것이다. 결국 `ANN`을 학습시킨다는 것은 이렇게 구한 에러 {% math %}E{% endmath %}의 값을 0에 근사시킨다고 볼 수 있다.
