---
title: TypeScript를 사용하여 간단한 인공 신경망 만들기
date: 2019-01-31 15:03:48
tags:
    - Machine Learning
    - Deep Learning
    - Computer Science
categories:
    - TypeScript
---

### 들어가며
***
이번 포스팅에서는 TypeScript를 사용하여 간단한 Artificial Neural Network를 만들어본 것을 간단하게 정리하려고 한다.
이 어플리케이션은 현 직장에서 진행하는 Tech Semina의 발표용으로 작성한 것이기 때문에 상당히 개발 시간이 촉박했다. 그래서 머릿속으로 생각해놓았던 기능을 전부 구현하지는 못했고 추후 기능을 더 붙혀볼 예정이다.
예전에 JavaScript를 사용하여 완전 하드코딩한 ANN을 작성해본 경험이 있었기 때문에 [그 코드](https://github.com/evan-moon/simple-ann/commit/82a1f3777de7b48a5cca1f777862620fc3159998)를 재활용해볼까 생각했었다.<small>(이젠 커밋 로그에서만 볼 수 있는 그 코드...)</small>
근데 막상 뜯어보니까 재활용할 수 있는 부분이 딱히 없어서<small>(완전 하드코딩이었음)</small> 그냥 처음부터 다시 짜기로 했다.

개발에 들어가기에 앞서서 그냥 추상적으로 생각했던 설계와 기능은 이러했다.

1. 하드코딩은 그만! 구조적인 설계를 하자.
2. 레이어 개수, 한 레이어당 노드 개수는 자유자재로 변할 수 있어야 한다.
3. Loss가 줄어드는 과정이나 weight들의 변화를 시각화해서 보면 좋을 것 같다!
4. 어플리케이션 인풋이나 초기 weight 값을 어플리케이션 내에서 직접 변경할 수 있도록 하자!

이중 4번은 세미나 PPT도 만들어야 하므로 결국 시간 부족으로 하지 못했고, 1~3번까지는 어떻게든 시간 내에 구현에 성공했다.

### 뉴런의 연결에 따라 달라지는 로스
***
일단 처음에는 ANN의 핵심 기능인 Weight를 업데이트하는 기능을 어떻게 구현할 것인가를 고민해야했다. 사실 Forward propagation을 진행할 때에 Back propagation 때 필요한 대부분의 값을 미리 계산해놓을 수 있다.

{% post_link deep-learning-backpropagation 저번 포스팅 %}에서 사용했던 예시를 가져와서 설명을 진행하려고 한다.
먼저, Back propagation에서 Weight를 업데이트하는 공식은 다음과 같다.

***
{% math %}
\begin{aligned}
\frac{\partial E}{\partial w} = \frac{\partial E}{\partial a} \frac{\partial a}{\partial z} \frac{\partial z}{\partial w} \\
\end{aligned}
{% endmath %}

1. {% math %}\frac{\partial E}{\partial a}{% endmath %}: 뉴런의 아웃풋({% math %}a{% endmath %})이 에러({% math %}E{% endmath %})에 영향을 끼친 기여도

2. {% math %}\frac{\partial a}{\partial z}{% endmath %}: 인풋 x Weight({% math %}z{% endmath %})가 뉴런의 아웃풋({% math %}a{% endmath %})에 영향을 끼친 기여도

3. {% math %}\frac{\partial z}{\partial w}{% endmath %}: Weight({% math %}w{% endmath %})가 인풋 x Weight({% math %}z{% endmath %})에 영향을 끼친 기여도
***

사실 어떤 뉴런의 Weight를 업데이트하든 2번과 3번은 변하지 않는다.
변하는 것은 1번 `뉴런의 아웃풋이 에러에 영향을 끼친 기여도` 뿐이다. 더 정확히 말하면 상황에 따라 기여도를 계산하는 방법만 바뀐다. 다음 2가지 케이스를 살펴보자.

#### 1. 뉴런의 아웃풋이 특정 에러에만 영향을 끼친 경우

<center>{% asset_img 'backprop2.png' '레이어' %}</center>

이 네트워크에서 최종 에러를 `MSE`로 구한다고 가정했을 때 에러는 다음과 같이 나타낼 수 있다.
***
{% math %}
\begin{aligned}
E_1 = (t_1 - a_{20})^2 \\
\\
E_2 = (t_2 -a_{21})^2 \\
\\
E = \frac{1}{2}(E_1 + E_2)
\end{aligned}
{% endmath %}
***
이 경우 {% math %}a_{20}{% endmath %}의 경우 {% math %}E_1{% endmath %}에는 영향을 끼칠 수 있지만 절대 {% math %}E_2{% endmath %}에는 영향을 끼칠 수 없다. 아예 식에 그 변수 자체가 없다. 이 경우 우리는 {% math %}\frac{\partial E}{\partial a_{20}}{% endmath %}을 계산할 때 아예 {% math %}E_1{% endmath %}을 제외한 나머지 에러를 모두 0으로 간주하고 계산할 수 있다.
***
{% math %}
\begin{aligned}
\frac{\partial E}{\partial a_{20}} = -(t_1 - a_{20})
\end{aligned}
{% endmath %}
***

#### 2. 뉴런의 아웃풋이 여러 에러에 영향을 끼친 경우

<center>{% asset_img 'backprop2.png' '레이어' %}</center>

다시 한번 레이어를 보자. 이번에는 좀 더 안쪽에 있는 {% math %}a_{10}{% endmath %}이 전체 에러 {% math %}E{% endmath %}에 얼마나 영향을 끼쳤는지 알아내야한다.
그냥 이어져 있는 선만 봐도 이 놈은 여기저기 다리를 뻗고 있다는 것을 알 수 있다. {% math %}a_{10}{% endmath %}를 인풋으로 사용한 뉴런은 물론이고 이 뉴런이 내보낸 아웃풋을 사용한 뉴런 등 많은 것들이 영향을 받았을 것이다. 그래서 이번에는 아까처럼 다른 변수를 무시하거나 하는 짓은 못한다. 다 계산해줘야한다.

***
{% math %}
\begin{aligned}
\frac{\partial E}{\partial a_{10}} = \frac{\partial E_1}{\partial a_{10}} + \frac{\partial E_2}{\partial a_{10}}
\end{aligned}
{% endmath %}
***

즉, 이 식이 의미하는 것은 업데이트하고자 하는 뉴런이 속한 레이어의 바로 뒤 레이어까지 전파된 에러를 의미한다.
그리고 이 에러를 구성하는 {% math %}\frac{\partial E_1}{\partial a_{10}}{% endmath %}와 {% math %}\frac{\partial E_2}{\partial a_{10}}{% endmath %} 등은 이렇게 구한다.

***
{% math %}
\begin{aligned}
\frac{\partial E_1}{\partial a_{10}} = \frac{\partial E_1}{\partial a_{20}} \frac{\partial a_{20}}{\partial z_{20}} \frac{\partial z_{20}}{\partial a_{10}} \\
\\
\frac{\partial E_2}{\partial a_{10}} = \frac{\partial E_2}{\partial a_{21}} \frac{\partial a_{21}}{\partial z_{21}} \frac{\partial z_{21}}{\partial a_{10}} \\
\end{aligned}
{% endmath %}
***

이 식에서 나타난 {% math %}\frac{\partial E_1}{\partial a_{20}}{% endmath %}과 {% math %}\frac{\partial E_2}{\partial a_{21}}{% endmath %}의 경우는 위에서 본 1번과 같은 케이스이므로 1번처럼 계산하면 될 것이다.

### asdsa


<!-- 

{% math %}w^0_{10}{% endmath %}는 업데이트할때 {% math %}w^0_{10}{% endmath %}가 전체 에러에 영향을 끼친 기여도를 구하는 식은 다음과 같다.

***
{% math %}
\begin{aligned}
\frac{\partial E_t}{\partial w^0_{10}} = (\frac{\partial E_1}{\partial a_{10}} + \frac{\partial E_2}{\partial a_{10}}) \frac{\partial a_{10}}{\partial z_{10}} \frac{\partial z_{10}}{\partial w^0_{10}}
\end{aligned}
{% endmath %}
***

이 식에서 변하지 않는 부분인
***
{% math %}
\begin{aligned}
\frac{\partial a_{10}}{\partial z_{10}} \frac{\partial z_{10}}{\partial w^0_{10}}
\end{aligned}
{% endmath %}
***
을 제거하면 나면 남는 식은
***
{% math %}
\begin{aligned}
(\frac{\partial E_1}{\partial a_{10}} + \frac{\partial E_2}{\partial a_{10}})
\end{aligned}
{% endmath %}
***
이다. 


여기서 주목해야할 것은 {% math %}\frac{\partial E_1}{\partial a_{10}}{% endmath %}나 {% math %}\frac{\partial E_2}{\partial a_{10}}{% endmath %}를 구하는 공식에도 {% math %}\frac{\partial E_1}{\partial a_{20}}{% endmath %}나 {% math %}\frac{\partial E_2}{\partial a_{21}}{% endmath %}처럼 같은 꼴의 식이 등장한다는 것이다. 그럼 {% math %}\frac{\partial E_1}{\partial a_{20}}{% endmath %}나 {% math %}\frac{\partial E_2}{\partial a_{21}}{% endmath %}는 어떻게 만들까? 당연히 식에 들어가는 변수만 변할 뿐 위에서 본 식과 완벽히 똑같다.





전에 머신러닝을 연구하는 형이 얘기해준 바로는 TensorFlow가 Forward propagation을 진행할 때 Back propagation에 필요한 값들을 미리 어느 정도 구해놓는다고 했다. 예를 들어 sigmoid를 보면
<center>시그모이드는 {% math %}\sigma = \frac{1}{1 + e^{-x}}{% endmath %}</center>
<center>시그모이드의 미분 꼴은 {% math %}{\frac{dx}{d}}\sigma = \sigma(1 - \sigma){% endmath %}</center>

```typescript
function sigmoid (x: number, deff = false): number {
  if (deff) {
    return sigmoid(x) * (1 - sigmoid(x));
  } else {
    return 1 / (1 + Math.exp(-x));
  }
}
```

이런 방식으로 Forward propagation 때 

그냥 이게 다인듯 싶었다. 그럼 어떻게든 비벼볼 수 있을 것 같다. 본격적으로 클래스 다이어그램을 그려볼까! 했지만 5초만에 귀찮아진 관계로 그냥 상상 설계를 하기로 했다. 필요한 놈들은 다음과 같다.

- 전체 네트워크를 관리할 `Network` 클래스
- 각 레이어내의 뉴런을 관리할 `Layer` 클래스
- 실질적으로 계산을 진행할 `Neuron` 클래스

결과부터 말하면 이렇게 대충 생각한 벌로 한 3일은 삽질했다. 역시 설계는 제대로 해야한다.
일단 시각화는 나중에 붙히면 되니까 먼저 제대로 작동하는 네트워크부터 만들어야했다.
대략적인 필자 뇌속의 흐름은 이랬다.

1. 메인 함수에서 `Network`를 생성. `constructor`에는 인풋이랑 타겟을 넘긴다.
2. 노드를 만든다.
3. for문으로 `learningLimit` 만큼 forward, backward를 반복 수행
4. forward 시 `Network`는 가지고 있는 `Layer`들을 순환하며 연산 수행 후 마지막 `Layer`에게서 로스를 뽑아낸다.
5. backward 시 `Network`의 `Layer` 배열을 반전시키고 연산 수행
6. profit!

그리고 바로 개발에 들어갔다. -->

<center>{% asset_img 'thumb.jpg' '엉망진창' %}</center>