---
layout: about
title: About Evan Moon
date: 2019-06-20 01:34:33
widgets:
  - 
    type: category
    position: right
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
안녕하세요. 물리와 우주 덕후 프로그래머 문동욱입니다.
현재 서울에 거주하며 대한민국의 IT 회사를 돌아다니면서 프론트엔드 개발자로 일하고 있습니다 :)

{% raw %}
<div id="contact-buttons" class="buttons" style="width: 100%; display: flex;">
  <a class="button is-dark is-medium" href="https://github.com/evan-moon" style="flex-grow: 1;">
    <span class="icon"><i class="fab fa-github"></i></span>
    <span>Github</span>
  </a>
  <a class="button button is-link is-medium" href="https://www.linkedin.com/in/evan-moon/" style="flex-grow: 1;">
    <span class="icon"><i class="fab fa-linkedin"></i></span>
    <span>LinkedIn</span>
  </a>
  <a class="button button is-light is-medium" href="mailto:bboydart91@gmail.com" style="flex-grow: 1;">
    <span class="icon"><i class="far fa-envelope"></i></span>
    <span>Email</span>
  </a>
</div>
<style>
#contact-buttons {
  width: 100%;
  display: flex;
}
#contact-butons a.button {
  flex-grow: 1;
}
@media screen and (max-width: 720px) {
  #contact-buttons a.button {
    width: 100%;
    margin-right: 0;
  }
}
</style>
{% endraw %}

***

## Toy Project
필요해서 만든 김에 공유하고 싶거나, 재미 혹은 개인 만족을 위해서 만드는 프로젝트들.
잡다한 건 여러가지 있지만 지금 관심을 쏟고 애정을 부어주고 있는 프로젝트만 블로그에 공유합니다.

> 컨트리뷰팅은 언제나 환영합니다. 같이 놀아요.

#### 1. Solar System TS
[Github Repository](https://github.com/evan-moon/solarsystemts)
[Live Demo](https://solar-system-ts.herokuapp.com/)

`TypeScript`, `Vue.js`, `Three.js(WebGL)`을 사용해 제작한 실시간 태양계 시뮬레이터!
중력을 사용하여 구현하려고 했으나 천체의 질량 데이터가 미묘하게 맞지 않는건지 뭔지 궤도 제 멋대로 돌아서 일단 보류.
대신 `케플러 궤도 6요소`와 `케플러 방정식 + 레가르 다항식`을 사용하여 현재 날짜에 해당 행성이 어디에 있는지 위치를 추적하는 방향으로 변경함.

##### 해야 하는 것
- 3D 렌더링 최적화. 어디서 메모리 릭이 있는지 점점 느려짐.
- 행성의 대기 그래픽 구현. 데이터는 다 모아놨음!
- 행성을 클릭하면 행성의 정보가 표시되도록 하고 싶다. ThreeJS의 `Raycaster` 클래스를 사용하면 됨
- 현재는 카메라가 `태양계 전체 모습을 봄`, `행성을 따라다니게 함` 두 가지 기능만 가지고 있는 데 여기에 `지구의 위치에서 금성을 추적`과 같은 기능을 달고 싶다. 그럼 내행성의 [겉보기 역행 운동](https://ko.wikipedia.org/wiki/%EA%B2%89%EB%B3%B4%EA%B8%B0_%EC%97%AD%ED%96%89_%EC%9A%B4%EB%8F%99)도 재현되지 않을까?
- 중력 모드 추가! 다체 문제가 난제다 보니 계산은 $O(n^2)$으로 할 수 밖에 없지만 그래도 지금보다는 이게 더 리소스가 적게들 것 같은 느낌적인 느낌... 게다가 지금은 행성 위치 오차를 [뉴턴 랩슨 메소드](https://namu.wiki/w/%EB%89%B4%ED%84%B4-%EB%9E%A9%EC%8A%A8%20%EB%B0%A9%EB%B2%95)로 보정하고 있어서 시간 복잡도가 너무 높다.

##### 관련 포스팅
- {% post_link calculate-orbit-1 [JavaScript로 천체 구현하기] 케플러 6요소 알아보기 %}
- {% post_link calculate-orbit-2 [JavaScript로 천체 구현하기] 행성의 움직임을 구현해보자 %}
- {% post_link gravity-via-js-1 [JavaScript로 중력 구현하기] 1. 중력이란 무엇일까? %}
- {% post_link gravity-via-js-2 [JavaScript로 중력 구현하기] 2. 코딩하기 %}

#### 2. Simple ANN
[Github Repository](https://github.com/evan-moon/simple-ann)
[Live Demo](https://simple-ann.herokuapp.com/)

`TypeScript`와 `React`, `D3`, `ChartJS`를 사용해 제작한 간단한 인공 신경망. 원래는 회사 세미나 발표 용도로 간단하게 만들어서 생각보다 재밌어서 계속 건드는 중.
미리 설정해놓은 개수에 맞는 노드와 레이어를 생성하여 학습 과정에서 $y$값의 변화와 `Loss`의 변화를 시각화하는 기능을 가지고 있다.

##### 해야 하는 것
- 지금은 `config` 모듈에서 선언된 상수를 참조하여 노드와 레이어를 생성하는데, 이걸 사용자가 입력해서 자유롭게 네트워크를 생성할 수 있게 변경
- 학습 과정을 좀 더 잘 이해할 수 있는 다른 정보를 시각화 해줄 수는 없을까? 고민 중...
- Activation Function도 맘대로 선택할 수 있게 해주면 좋을 듯. 지금은 `Sigmoid Function`만 사용 가능하다.
- `CNN`도 한번 시각화 도전...? 근데 2차원을 어떻게 시각화 해줄 지 모르겠음.

##### 관련 포스팅
- {% post_link deep-learning-intro Deep Learning이란 무엇인가? - Intro %}
- {% post_link deep-learning-backpropagation Deep Learning이란 무엇인가? - Backpropagation %}
- {% post_link simple-ann TypeScript를 사용하여 간단한 인공 신경망 개발 삽질기 %}

#### 3. Weatherman
[Github Repository](https://github.com/evan-moon/weatherman)
[Live Demo](https://weatherman-evan.herokuapp.com/)

시계 + 날씨 + 미세먼지 정보 + 이쁜 사진 대시보드
집에 노트북이 남길래 하나를 대시보드 전용으로 쓰려고 만든 웹 어플리케이션. 크롬 익스텐션인 `Momentum`를 쓰고 있었지만 비염이 심한 본인을 위해 미세먼지 농도도 함께 보고 싶었는데 얘네가 해당 기능 제공을 안해줘서 하나 새로 만들어서 쓰는 중.
배경사진은 날씨에 따라 알맞은 사진으로 변경되어 사용자(나)가 굳이 구석에 있는 날씨 정보를 눈여겨 보지 않더라도 한 눈에 현재 날씨를 알아볼 수 있도록 함.

##### 해야 하는 것
- 지금 사진 데이터를 JSON으로 관리하고 있는데 원래 목표는 `Unsplash API`를 사용하는 것이었음. 근데 API를 쓰려면 앱이 심사를 통과해야해서 귀찮...
- Open Weather API에서 사용하는 전세계 도시 정보를 지금 JSON으로 관리하는 데, 이걸 `Firebase Realtime DB`에 올려야함
- 유튜브 API 써서 음악도 재생되게 하고 싶다


