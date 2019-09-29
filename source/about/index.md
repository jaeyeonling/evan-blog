---
layout: about
title: About Evan Moon
date: 2019-09-29 13:34:33
widgets:
  - 
    type: recent_posts
    position: right
share:
---

<center>
  {% img '/img/me.jpg' 300 %}
  <br>
</center>

## Intro.
안녕하세요. 물리와 우주 덕후 프로그래머 문동욱입니다. 현재 서울에 거주하며 대한민국의 IT 회사를 돌아다니면서 프론트엔드 개발자로 일하고 있습니다 :)

메인 포지션은 웹 프론트엔드이기는 하지만, 딱히 지식을 가려먹는 타입은 아니라서 폭 넓고 보편적인 지식을 쌓으려고 하고 있습니다. 딱히 프로그래밍과 관련된 것이 아니라도 필요하다 싶으면 그냥 공부하는 편입니다.

글쓰기를 좋아하기 때문에 이 블로그를 운영하고 있긴 한데, 딱히 기술적인 것이 아니라도 그냥 쓰고 싶은 주제가 있으면 아무거나 쓰기 때문에 기술 블로그와 에세이 블로그의 혼종 느낌으로 운영하고 있습니다.

{% raw %}
<div id="contact-buttons" class="buttons">
  <a class="button is-dark is-medium" href="https://github.com/evan-moon">
    <span class="icon"><i class="fab fa-github"></i></span>
    <span>Github</span>
  </a>
  <a class="button is-linkedin is-medium" href="https://www.linkedin.com/in/evan-moon/">
    <span class="icon"><i class="fab fa-linkedin"></i></span>
    <span>LinkedIn</span>
  </a>
  <a class="button is-light is-medium" href="mailto:bboydart91@gmail.com">
    <span class="icon"><i class="far fa-envelope"></i></span>
    <span>Email</span>
  </a>
</div>
{% endraw %}

***

## 저서
### 커피 한 잔 마시며 끝내는 VueJS
<center>
  {% img /img/vue_with_coffee.jpeg 300 %}
</center>

{% raw %}
  <div class="project-links buttons">
    <a class="button is-dark is-medium" href="https://github.com/CanDoVueJS">
      <span class="icon"><i class="fab fa-github"></i></span>
      <span>Github</span>
    </a>
    <a class="button is-primary is-medium" href="http://yes24.com/Product/Goods/76639545">
      <span class="icon"><i class="fas fa-shopping-cart"></i></span>
      <span>구매하기</span>
    </a>
  </div>
{% endraw %}

이 책에서는 `VueJS`에 대한 API뿐만 아니라 어떻게 활용하면 되는지에 대해 효과적으로 설명한다. 이러한 활용 예제는 실전 애플리케이션을 구축해나가는 과정을 통해 쉽고 효과적으로 학습한다. 어플리케이션은 실무와 동일하게 REST API를 제공하는 백엔드와 통신을 통해 데이터를 받아온 후 클라이언트에서 상태 관리를 하는 과정으로 진행되며, 이때 필요한 REST API는 Github을 통해 프로젝트를 클론받는 방식으로 제공하고 있다.

그뿐만 아니라 실전 애플리케이션을 구축해나가는 과정에서 겪을 수 있는 트러블 슈팅과 필자의 실무 경험을 바탕으로 하는 조언도 함께 학습한다.

#### 관련 포스팅
- {% post_link vuejs-book-retrospective 흔한 개발랭이의 작가 입문기 %}

***

## Toy Project
필요해서 만든 김에 공유하고 싶거나, 재미 혹은 개인 만족을 위해서 만드는 프로젝트들. 딱히 완성이라고 할만한 프로젝트는 없으며, 기능은 시간 날 때마다 꾸준히 추가 중이다.

### Solar System TS
<center>
  {% img /img/solar_system.png %}
</center>

{% raw %}
  <div class="project-links">
    <a class="button is-large is-white" href="https://github.com/evan-moon/solarsystemts">
      <span class="icon"><i class="fab fa-github"></i></span>
    </a>
    <a class="button is-large is-white" href="https://solar-system-ts.herokuapp.com/">
      <span class="icon"><i class="fas fa-play"></i></span>
    </a>
  </div>
{% endraw %}

`TypeScript`, `Vue.js`, `Three.js(WebGL)`을 사용해 제작한 실시간 태양계 시뮬레이터. 중력을 사용하여 구현하려고 했으나 천체의 질량 데이터가 미묘하게 맞지 않는건지 뭔지 궤도가 제 멋대로 돌아서 일단 보류. 대신 `케플러 궤도 6요소`와 `케플러 방정식 + 레가르 다항식`을 사용하여 현재 날짜에 해당 행성이 어디에 있는지 위치를 추적하는 방향으로 구현.

#### 관련 포스팅
- {% post_link calculate-orbit-1 [JavaScript로 천체 구현하기] 케플러 6요소 알아보기 %}
- {% post_link calculate-orbit-2 [JavaScript로 천체 구현하기] 행성의 움직임을 구현해보자 %}
- {% post_link gravity-via-js-1 [JavaScript로 중력 구현하기] 1. 중력이란 무엇일까? %}
- {% post_link gravity-via-js-2 [JavaScript로 중력 구현하기] 2. 코딩하기 %}

***

### Simple ANN
<center>
  {% img /img/simple-ann.png %}
</center>

{% raw %}
  <div class="project-links">
    <a class="button is-large is-white" href="https://github.com/evan-moon/simple-ann">
      <span class="icon"><i class="fab fa-github"></i></span>
    </a>
    <a class="button is-large is-white" href="https://simple-ann.herokuapp.com/">
      <span class="icon"><i class="fas fa-play"></i></span>
    </a>
  </div>
{% endraw %}

`TypeScript`와 `React`, `D3`, `ChartJS`를 사용해 제작한 간단한 인공 신경망. 원래는 회사 세미나 발표 용도로 간단하게 만들었는데 생각보다 재밌어서 계속 건드는 중. 레이어의 개수와 노드의 개수, 학습 횟수 등을 설정하고 학습 과정에서 $y$값의 변화와 `Loss`의 변화를 시각화하였다. 추후 여러 개의 Activation Function을 선택할 수 있는 기능과 레이어마다 노드의 개수를 다르게 하는 등 네트워크 커스터마이징을 좀 더 다채롭게 할 수 있는 기능을 추가할 예정.

#### 관련 포스팅
- {% post_link deep-learning-intro Deep Learning이란 무엇인가? - Intro %}
- {% post_link deep-learning-backpropagation Deep Learning이란 무엇인가? - Backpropagation %}
- {% post_link simple-ann TypeScript를 사용하여 간단한 인공 신경망 개발 삽질기 %}

***

### Simple Waveform Visualizer
<center>
  {% img /img/simple-waveform.png %}
</center>

{% raw %}
  <div class="project-links">
    <a class="button is-large is-white" href="https://github.com/evan-moon/simple-waveform-visualizer">
      <span class="icon"><i class="fab fa-github"></i></span>
    </a>
    <a class="button is-large is-white" href="https://simple-audio-waveform.herokuapp.com/">
      <span class="icon"><i class="fas fa-play"></i></span>
    </a>
  </div>
{% endraw %}

오디오 파일을 업로드해서 여러가지 오디오 이펙터를 걸어볼 수 있는 어플리케이션. 현재 개발된 이펙터는 `Compressor`, 
`Reverb`, `Delay`, `Filter (LPF, HPF)`, `EQ`, `Distortion`, `Tremolo` 정도. 다음 단계는 오실레이터를 사용하여 신디사이저를 만들거나, 트랙을 나누어서 동시에 여러 오디오 소스를 재생하며 이펙터를 사용할 수 있도록 변경할 예정.

#### 관련 포스팅
- {% post_link javascript-audio-waveform 컴퓨터는 어떻게 소리를 들을까? %}
- {% post_link javascript-audio-effectors-gain [JavaScript로 오디오 이펙터를 만들어보자] 소리의 흐름을 파악하자 %}
- {% post_link javascript-audio-effectors-practice [JavaScript로 오디오 이펙터를 만들어보자] 나만의 소리 만들기 %}

***

### Weatherman
<center>
  {% img /img/weatherman.png %}
</center>

{% raw %}
  <div class="project-links">
    <a class="button is-large is-white" href="https://github.com/evan-moon/weatherman">
      <span class="icon"><i class="fab fa-github"></i></span>
    </a>
    <a class="button is-large is-white" href="https://weatherman-evan.herokuapp.com/">
      <span class="icon"><i class="fas fa-play"></i></span>
    </a>
  </div>
{% endraw %}

시계 + 날씨 + 미세먼지 정보 + 이쁜 사진 대시보드.

집에 노트북이 남길래 하나를 대시보드 전용으로 쓰려고 만든 웹 어플리케이션. 크롬 익스텐션인 `Momentum`를 쓰고 있었지만 비염이 심한 본인을 위해 미세먼지 농도도 함께 보고 싶었는데 얘네가 해당 기능 제공을 안해줘서 하나 새로 만들어서 쓰는 중.
배경사진은 날씨에 따라 알맞은 사진으로 변경되어 사용자가 굳이 구석에 있는 날씨 정보를 눈여겨 보지 않더라도 한 눈에 현재 날씨를 알아볼 수 있도록 함.

{% raw %}
<style>
.buttons {
  width: 100%;
  display: flex;
}
.buttons a.button {
  flex-grow: 1;
}
a.button.is-linkedin {
  background-color: #0077B5;
  border-color: #0077B5;
  color: #FFF;
}
@media screen and (max-width: 720px) {
  .buttons a.button {
    width: 100%;
    margin-right: 0;
  }
}
.project-links {
  margin-bottom: 16px;
}
</style>
{% endraw %}