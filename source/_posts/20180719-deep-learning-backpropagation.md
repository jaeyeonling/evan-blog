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


### Forward-propagation
이제 직접 `Backpropagation`이 어떻게 이루어지는 지 한번 계산해보자.
그 전에 먼저 `Forward Propagation`을 진행해야한다. 초기화한 {% math %}w{% endmath %}값과 input인 {% math %}x{% endmath %}을 가지고 계산을 진행한 뒤 우리가 원하는 값이 나오는 지, 나오지 않았다면 얼마나 차이가 나는지를 먼저 구해야한다.
필자가 이번 계산에 사용할 모델은 아래와 같다.

<center>{% asset_img 'model.png' %}</center>

이 모델은 2개의 input, 2개의 output을 가지고 2개의 Hidden Layer를 가진 `2-Layer NN` 모델이다.
이제 각 변수에 값을 할당해보자.

<center>{% asset_img 'add_var.png' %}</center>

먼저 필자가 output으로 원하는 {% math %}y_1{% endmath %}의 값은 `0.2`, {% math %}y_2{% endmath %}의 값은 `0.7`이다.
그리고 input으로는 {% math %}x_1{% endmath %}에 `0.2`, {% math %}x_2{% endmath %}에 `0.5`를 넣어주었고, 각각의 {% math %}w{% endmath %}값은 그냥 느낌가는 대로 넣어놓았다.

필자는 이 계산에서 `Activation Function`으로 `Sigmoid`함수를 사용하고, `Error Function`은 `Mean Squared Error`함수를 사용하려고 한다.

먼저 Layer0에서 받을 값부터 계산해보자. 보통 행렬로 계산한다.

{% math %}
\begin{aligned}
z_{10} = \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} \times  \begin{bmatrix} w^0_{10} & w^0_{20} \end{bmatrix} \\
\\
z_{11} = \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} \times  \begin{bmatrix} w^0_{11} & w^0_{21} \end{bmatrix} \\
\end{aligned}
{% endmath %}

저 행렬 곱을 풀어보면 다음과 같이 되고 결국 {% math %}wx{% endmath %}들의 합의 형태로 나타난다.

{% math %}
\begin{aligned}
z_{10} = x_1w^0_{10} + x_2w^0_{20} = (0.2\times0.1) + (0.5\times0.3) = 0.02 + 0.15 = 0.17 \\
\\
z_{11} = x_1w^0_{11} + x_2w^0_{21} = (0.2\times0.2) + (0.5\times0.1) = 0.04 + 0.05 = 0.09 \\
\end{aligned}
{% endmath %}

{% math %}z_{10}{% endmath %}와 {% math %}z_{11}{% endmath %}의 값을 구했으면 이제 `Activation Function`을 사용하여 {% math %}a_{10}{% endmath %}와 {% math %}a_{11}{% endmath %}값을 구해보자.
필자가 사용할 `Activation Function`인 `Sigmoid`의 수식은 다음과 같다.

<center>{% math %}\sigma = \frac{1}{1 + e^{-x}}{% endmath %}</center>

이걸 매번 손으로 계산하면 너무 번거롭기 때문에 JavaScript를 사용해 다음과 같이 함수를 하나 만들어 놓고 사용했다.

```js
function sigmoid (x) {
	return 1 / (1 + Math.exp(-x));
}
```
{% math %}
\begin{aligned}
a_{10} = \sigma(z_{10}) = 0.54 \\
\\
a_{11} = \sigma(z_{11}) = 0.52 \\
\end{aligned}
{% endmath %}

다음 레이어도 같은 방식으로 값을 계속 구해보면 다음과 같은 값들을 구할 수 있다.

{% math %}
\begin{aligned}
z_{10} = 0.17 \\
a_{10} = 0.54 \\
\\
z_{11} = 0.09 \\
a_{11} = 0.52 \\
\\
z_{20} = 0.27 \\
a_{20} = 0.57 \\
\\
z_{21} = 0.43 \\
a_{21} = 0.61 \\
\end{aligned}
{% endmath %}

결국 {% math %}y_1{% endmath %}와 {% math %}y_2{% endmath %}는 각각 {% math %}a_{20}{% endmath %}과 {% math %}a_{21}{% endmath %}과 같으므로, 우리는 최종 output값을 구하게 되었다.
근데 우리가 처음에 원했던 {% math %}y_1{% endmath %}과 {% math %}y_2{% endmath %}는 `0.2`와 `0.7`이었는데, 우리가 구한 output은 `0.57`과 `0.61`으로 거리가 있다.
이제 `Mean Squared Error`함수를 사용하여 에러 {% math %}E{% endmath %}를 구할 차례이다.
결과값으로 얻기를 바라는 값을 {% math %}t{% endmath %}로, 실제 나온 값을 {% math %}y{% endmath %}라고 할 때 에러 {% math %}E{% endmath %}는 다음과 같다.

<center>{% math %}E = \frac{1}{2}\sum(t_i - y_i)^2{% endmath %}</center>

필자같은 수포자를 위해 쉽게 설명하자면, 그냥 마지막 Output Layer에서 뱉어낸 {% math %}y{% endmath %}들과 하나하나 레이블링했던 {% math %}\hat{y}{% endmath%}가 얼마나 차이나는 지 구한 다음에 그 값들의 평균을 내는 것이다.
결국 `ANN`을 학습시킨다는 것은 이렇게 구한 에러 {% math %}E{% endmath %}의 값을 0에 근사시킨다고 볼 수 있다.
여기서 나온 {% math %}E{% endmath %}값을 이제 `Backpropagation`하면 되는 것이다.

이것도 매번 손으로 계산하기 귀찮으니까 그냥 함수를 하나 만들자.

```js
function MSE (targets, values) {
	if (values instanceof Array === false) {
		return false;
	}

	let result = 0;
	targets.forEach((target, i) => {
		result += (0.5 * ((target - values[i]) ** 2));
	});

	return result;
}

MSE([0.2, 0.7], [0.57, 0.61]); // 0.072
```

이제 여기서 구한 에러 {% math %}E{% endmath %}값을 사용하여 `Backpropagation`을 진행해보자.



### Backpropagation
`Frontend Propagation`을 통해서 구해진 값을 다시 그림으로 살펴보면 다음과 같다.
<center>{% asset_img 'backprop1.png' %}</center>
필자는 이 중 현재 `0.4`로 할당되어 있는 {% math %}w^1_{10}{% endmath %}값을 업데이트 하려고 한다.
그러려면 {% math %}w^1_{10}{% endmath %}이 전체 에러인 {% math %}E{% endmath %}에 얼마나 영향을 미쳤는지, 즉 기여도를 구해야한다. 이때 위에서 설명한 `Chain Rule`이 사용된다.

{% math %}E{% endmath %}에 대한 {% math %}w^1_{10}{% endmath %}의 기여도를 식으로 풀어보면 다음과 같다.

{% math %}
\begin{aligned}
\frac{\partial E}{\partial w^1_{10}} = \frac{\partial E}{\partial a_{20}} \frac{\partial a_{20}}{\partial z_{20}} \frac{\partial z_{20}}{\partial w^1_{10}} \\
\end{aligned}
{% endmath %}

먼저 {% math %}\frac{\partial E}{\partial a_{20}}{% endmath %}부터 차례대로 풀어보자. 원래 우리가 구한 {% math %}E{% endmath %}는 아래와 같은 식이였다.

<center>{% math %}E = \frac{1}{2}((t_1 - a_{20})^2 + (t_2 -a_{21})^2){% endmath %}</center>

여기서 {% math %}a_{20} = y_1, a_{21} = y_2{% endmath %}이기 때문에 치환해주었다. 하지만 {% math %}\frac{\partial E}{\partial a_{20}}{% endmath %}는 편미분식이기 때문에 지금 구하려는 값과 상관없는 {% math %}a_{21}{% endmath %}는 그냥 `0`으로 생각하고 풀면된다.

{% math %}
\begin{aligned}
\frac{\partial E}{\partial a_{20}} = (t_1 - a_{20}) * -1 + 0 = (0.2 - 0.57) \times -1 = 0.37 \\
\end{aligned}
{% endmath %}

이 계산 결과가 의미하는 것은 전체 에러 {% math %}E{% endmath %}에 대하여 {% math %}a_{20}{% endmath %}, 즉 {% math %}y_1{% endmath %}가 `0.37`만큼 기여했다는 것을 의미한다.
이런 식으로 계속 계산해보자.

{% math %}
\begin{aligned}
\frac{\partial a_{20}}{\partial z_{20}} = \sigma(z_{20}) \times (1 - \sigma(z_{20}) = 0.57 \times (1 - 0.57) = 0.14 \\
\end{aligned}
{% endmath %}
{% math %}
\begin{aligned}
\frac{\partial z_{20}}{\partial w^1_{10}} = a_{10} + 0 = 0.54 \\
\end{aligned}
{% endmath %}

{% math %}
\begin{aligned}
\frac{\partial E}{\partial w^1_{10}} = 0.37 \times 0.14 \times 0.54 = 0.028 \\
\end{aligned}
{% endmath %}

최종적으로 {% math %}E{% endmath %}에 {% math %}w^1_{10}{% endmath %}가 기여한 값은 `0.028`이라는 값을 계산했다.
이제 이 값을 학습식에 넣으면 {% math %}w^1_{10}{% endmath %}값을 업데이트 할 수 있다.
이때 값을 얼마나 건너뛸 것이냐 또는 얼마나 빨리 학습시킬 것이냐 등을 정하는 `Learning Rate`라는 값이 필요한데, 이건 그냥 사람이 정하는 상수이고 보통 `0.1`보다 낮은 값으로 설정하나 필자는 `0.3`으로 잡았다.

{% math %}
\begin{aligned}
w^{1+}_{10} = w^1_{10} - (L * \frac{\partial E}{\partial w^1_{10}}) = 0.4 - (0.3 * 0.028) = 0.3916
\end{aligned}
{% endmath %}

이렇게 해서 필자는 새로운 {% math %}w^1_{10}{% endmath %}값인 `0.3916`을 얻었다. 이런 식으로 다른 {% math %}w{% endmath %}값을 계속 업데이트 해보자.
