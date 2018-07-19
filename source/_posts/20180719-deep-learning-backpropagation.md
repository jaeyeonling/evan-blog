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
한국말로 직역하면 `역전파`라는 뜻인데, 내가 뽑고자 하는 `target`값과 실제 모델이 계산한 `output`이 얼마나 차이가 나는지 구한 후 그 오차값을 다시 뒤로 전파해가면서 각 노드가 가지고 있는 변수들을 갱신하는 알고리즘인 것이다.
다행히 여기까지는 직관적으로 이해가 되지만 필자는 다음 2가지의 원리가 궁금했다.

***
1. 각 노드가 가지고 있는 `weight`이나 `bias`같은 변수들을 `어떻게` 업데이트할 것인가?
2. `Multi Layer Network`에서 각 노드나 레이어가 가지고 있는 변수들은 다 제 각각인데 그 값들을 `얼만큼` 변경하는 지 어떻게 알 수 있는가?
***

다행히 이 문제들은 `Chain Rule`이라는 법칙을 사용해 해결할 수 있다고 한다. 한번 차근차근 살펴보자.


### Chain Rule이란?
`Chain Rule`, 미분의 연쇄법칙이라고도 불리는 법칙이다. 이건 고딩때는 안배우고 대학수학에서 배우기 때문에, 대학 때 이산수학만 배웠던 필자는 이해가 잘되지않아서 고생했다. 먼저 정의부터 보자.

***

함수 {% math %}f, g{% endmath %}가 있을 때
{% math %}f{% endmath %}와 {% math %}g{% endmath %}가 모두 미분 가능하고
{% math %}F = f(g(x)) = f \circ g{% endmath %}로 정의된 함성 함수이면 {% math %}F{% endmath %}는 미분 가능하다.
이때 {% math %}F'(x) = f'(g(x)) \centerdot g'(x) {% endmath %}이다.
{% math %}t = g(x){% endmath %}라고 한다면,
{% math %}\frac{dy}{dx} = \frac{dt}{dx} \frac{dy}{dt}{% endmath %}가 성립한다.

***

정의를 보면 뭔 말인가 싶을 수 있는데, 먼저 `합성함수`는 그냥 어떤 함수의 인자로 다른 함수가 주어진 함수이다. 대충 이런 식이랄까?

```js
function f (g) {
    return g * 3;
}
function g (x) {
    return x + 1;
}

const x = 3;
let F = f(g(x));
// F = 12
```

그럼 `미분 가능하다`라는 말이 의미하는 것은 뭘까? 보통 `미분 = x와 x'간의 기울기를 구한다` 정도로 이해하고 있다면 합성함수 어쩌고에서 기울기를 왜 구하지? 라고 생각할 수 있다.
하지만 `기울기를 구한다`라는 말은 `변화량을 구한다`라고도 할 수 있다.
위의 코드를 보자. 그냥 직관적으로 딱 봐도 변수 `F`를 선언할 때 `g`에 주는 값을 변경한다면 최종적으로 `F`값이 바뀐다는 것을 알 수 있을 것이다.

```js
F = f(g(4));
// F = 15
F = f(g(2));
// F = 9
```

즉 `Chain Rule`이란 쉽게 얘기하자면 `1. x가 변화했을 때 함수 g가 얼마나 변하는 지`와 그로인해 `2. 함수 g의 변화로 인해 함수 f가 얼마나 변하는 지`를 알 수 있고 `3. 함수 f의 인자가 함수 g이면` 최종 값 `F`의 변화량에 기여하는 각 함수 `f`와 `g`의 기여도를 알 수 있다는 것이다.
방금 전 위에서 예시로 든 합성함수 `F`의 식에 들어가는 변수는 `x` 하나였다. 그럼 변수가 여러 개면 어떻게 되는 걸까?

***

이변수함수 {% math %}z = f(x, y){% endmath %}에서 {% math %}x = h(s,t), y = g(s,t){% endmath %}일 때
{% math %}f(x,y), g(s,t), h(s,t){% endmath %}가 모두 미분 가능하면

{% math %}
\begin{aligned}
\frac{\partial z}{\partial s} = \frac{\partial z}{\partial x}\frac{\partial x}{\partial s} + \frac{\partial z}{\partial y}\frac{\partial y}{\partial s} \\
\\
\frac{\partial z}{\partial t} = \frac{\partial z}{\partial x}\frac{\partial x}{\partial t} + \frac{\partial z}{\partial y}\frac{\partial y}{\partial t} \\
\end{aligned}
{% endmath %}

로 나타내어질 수 있다.

***

이 말인 즉슨 {% math %}s{% endmath %}나 {% math %}t{% endmath %}가 얼만큼인지는 모르지만 어쨌든 변했을 때, 함수 {% math %}z{% endmath %}의 변화량을 저런 식으로 구할 수 있다는 것이다.
그리고 {% math %}\partial{% endmath %}는 `편미분`을 뜻하는 기호인데, 메인이 되는 변수 하나를 남겨두고 나머지 변수는 그냥 개무시하는 미분법이다. 그래서 {% math %}s{% endmath %}와 {% math %}z{% endmath %}의 관계를 구하는 식에서는 아예 {% math %}t{% endmath %}가 없는 것을 알 수 있다.
여기까지 이해가 되었다면 이제 본격적으로 `Backpropagation`이 어떻게 진행되는 지 살펴보도록 하자.


### BackPropagation의 과정
먼저 모델에 대한 간단한 정의부터 해보자.

***
1. 모델은 1개의 input Layer, 1개의 Hidden Layer, 1개의 Output Layer로 구성된 `2-Layer NN`모델이다.
2. 초기 weight값은 랜덤으로 주어진다.
2. `Activation Function`은 `Sigmoid`를 사용한다.
***

먼저 `Backpropagation`을 사용하려면 전파할 뭔가가 있어야한다. 그렇기 때문에 일단 에러 {% math %}E{% endmath %}를 `Mean Squared Error`함수를 사용해 구해보도록 한다. 결과값으로 얻기를 바라는 값을 {% math %}t{% endmath %}로, 실제 나온 값을 {% math %}y{% endmath %}라고 할 때 에러 {% math %}E{% endmath %}는 다음과 같다.

<center>{% math %}E = \sum\limits_{i=1}^m\frac{1}{2}(t_i - y_i)^2{% endmath %}</center>

필자같은 수포자를 위해 쉽게 설명하자면, 그냥 마지막 Output Layer에서 뱉어낸 {% math %}y{% endmath %}과 하나하나 레이블링했던 {% math %}\hat{y}{% endmath%}가 얼마나 차이나는 지 구한 다음에 그 값들의 평균을 내는 것이다.
결국 `ANN`을 학습시킨다는 것은 이렇게 구한 에러 {% math %}E{% endmath %}의 값을 0에 근사시킨다고 볼 수 있다.
여기서 나온 {% math %}E{% endmath %}값을 이제 `역전파`하면 되는 것이다.