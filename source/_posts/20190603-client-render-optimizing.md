---
title: 클라이언트 사이드 렌더링 최적화 
date: 2019-06-03 17:22:26
tags:
  - SEO
  - 렌더 최적화
  - Render Optimizing
  - JavaScript
categories:
  - Programming
  - Web
thumbnail: /2019/06/03/client-render-optimizing/result_before.png
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

이번 포스팅에서는 필자의 현직장에서 진행했던 클라이언트 사이드 렌더링 최적화에 대해서 적어보려고 한다. 크롬 브라우저의 Audits 탭에서 현재 페이지의 퍼포먼스나 SEO 점수와 같은 지표를 확인해볼 수 있다.
<!-- more -->

이 지표는 Google Chrome 팀에서 제공하는  Lighthouse라는 툴을 사용하여 측정된다. 또한 측정된 지표를 JSON 포맷으로 Export하여 저장하고 Lighthouse의 Report Viewer 페이지에서 다시 확인해볼수도 있다. 아래 링크들을 살펴보면 Lighthouse에 대해서 더 잘 알 수 있을 것이다.

***
[Lighthouse Github 레파지토리](https://github.com/GoogleChrome/lighthouse)
[Google Devloper의 Lighthouse 문서](https://developers.google.com/web/tools/lighthouse/?hl=ko)
[Lighthouse Report Viewer](https://googlechrome.github.io/lighthouse/viewer/)
***

## 최적화를 진행하게 된 이유?
필자는 회사에서 [**숨고**](https://soomgo.com)라는 서비스를 개발하고 있다. 숨고에서는 1주 단위의 스프린트로 업무를 진행하고 있는데, 마침 이번 주에 다른 이슈에 의해 필자가 진행할 이슈가 병목에 걸려버려서 시간이 붕 떴다.그래서 뭘 할까 찾아보다가 숨고의 [고수 찾기](https://soomgo.com/search/pro) 페이지에서 Audits를 한번 돌렸는데 First Meaningful Paint 항목이 거의 2초가 걸리는 것을 확인했다.

<center>
    {% asset_img 'result_before.png' 'result_before' %}
    <sub>숨고의 고수 찾기 페이지를 분석한 결과</sub>
</center>

해당 페이지는 SEO 최적화 대상 페이지 중 하나이기 때문에 이 참에 `First Meaningful Paint` 시간을 1초 아래까지 줄여보자라는 목표를 가지고 최적화를 진행하게 되었다. 사실 해당 페이지는 이 작업 이전에도 동료들과 함께 여러 차례에 걸쳐 최적화 작업을 진행해왔기 때문에 페이지 자체의 로딩 속도는 나쁜 편은 아니다. 그러나 이전의 최적화는 클라이언트보다는 렌더 서버에 초점을 맞춰서 진행해왔기 때문에 클라이언트 렌더링의 병목 지점을 확인한 것은 사실 이번이 처음이다.

## 문제점 파악
일단 Lighthouse에서 감사 결과로 지목했던 다양한 문제점 중 지금 당장 짧은 시간 안에 해결할 수 있는 문제들을 중심으로 파악했다. 애초에 이 이슈는 스프린트에 들어갔던 이슈가 아니라 우연히 시간이 남아서 하게 된 일이기 때문에 자칫 [야크 털깎기](https://www.lesstif.com/pages/viewpage.action?pageId=29590364)에 빠지거나 욕심을 부려서 너무 오랜 시간을 끌게되면 정작 중요한 비지니스 이슈를 처리하지 못하기 때문이다. 그 중 필자가 생각하기에 짧은 시간안에 우선 개선할 수 있는 부분은 다음과 같았다.

#### Text 압축 미사용
보통 `text/html`이나 `application/javascript` 등 텍스트나 코드로 취급되는 리소스들은 gzip 압축을 사용한다. 하지만 현재 렌더 서버는 `text/html` 타입만 gzip 압축을 수행하고 있었다.

#### 오프스크린 이미지 지연이 필요함
`오프스크린 이미지`란 코드 상에는 존재하지만 화면 밖에 있거나 CSS 스타일로 인해 감춰져 있는 등 실제로 유저에게는 보여지고 있지 않은 이미지를 의미한다. 이런 이미지는 당연히 지연 로딩(Lazy Loading)을 하는 것이 좋을 거라 생각했다.

#### 네트워크 페이로드 크기가 너무 크다
이 문제는 상기한 `Text 압축 미사용`과 관련있다. 말 그대로 리소스를 한번 요청했을 때 받아와야하는 데이터의 크기가 너무 크다는 것을 의미한다. 이 이슈는 gzip 압축과 Code Chunking 등으로 해결할 수 있다.

#### 기본 스레드 작업 최소화 하기
브라우저에서 웹 애플리케이션을 초기화 할 때 JavaScript를 실행하는 시간이 너무 오래 걸려서 화면에 요소를 렌더링하는 행위에 병목이 발생한 것을 의미한다. 이 문제를 해결하기 위한 방법은 진짜 마이너한 최적화부터 조금만 손봐도 큰 효과를 볼 수 있는 방법까지 여러가지 방법이 떠올랐는데, 마이너한 최적화는 사실 하나마나므로 최소 비용으로 최대의 효과를 얻을 수 있는 방법을 골라야 했다.

#### 웹폰트가 로드되는 동안 텍스트가 계속 표시되는지 확인하기
아무런 조치도 취하지 않았을 경우 브라우저들은 각각의 정책에 따라 웹폰트를 렌더하는 방법이 다르다. Chrome, Firefox, Safari, Opera 같은 Webkit 진영의 브라우저들은 웹폰트의 다운로드가 완료될 때 까지 폰트가 적용된 텍스트를 보여주지 않는 `FOIT(Flash of Invisible Text)` 방식으로, IE, Edge는 웹폰트의 다운로드가 완료될 때 까지 텍스트를 기본 폰트가 적용된 상태로 노출시키는 `FOUT(Flash of Unstyled Text)` 방식으로 웹폰트를 렌더한다. 그렇기 때문에 Lighthouse는 사용자가 웹폰트 다운로드 완료 여부와 상관없이 페이지의 내용을 확인할 수 있는 FOUT 방식을 사용할 것을 권고하였다.

## 조치
#### 이미지 지연 로딩
이미지 지연 로딩은 HTML5의 [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)를 사용하면 간단하게 구현할 수 있다. 그러나 한가지 걱정되었던 것은 "지연 로딩을 하면 구글의 Search Engine Bot이 이미지를 긁어가지 못하는 것이 아닌가?"라는 것이다. 그래서 다른 사람들은 어떤 방식으로 생각하는 지 알고 싶어 리서치를 조금 해봤는데 `<noscript>` 태그를 사용하는 방법, XML을 사용하여 이미지 사이트맵을 만드는 방법 등 몇가지 방법이 있었고 혹자는 구글의 Search Engine Bot이 지연 로딩을 사용하여 불러오는 이미지도 전부 인덱싱하기 때문에 신경안써도 된다는 얘기도 있었다.

그래서 이 문제에 관해 PO(Product Owner)와 토의해보았다. 그 결과 어차피 고수 찾기 페이기에 있는 이미지는 유저 프로필 이미지 밖에 없고, 이 이미지들은 인덱싱이 되든 안되든 SEO에 큰 영향이 없을 것으로 판단되어 별도의 조치 없이 그냥 지연 로딩을 적용하기로 하였다.

숨고 프론트엔드는 Vue를 사용하고 있기 때문에 Vue에서 제공해주는 `Directive`와 HTML5의 `IntersectionObserver` API를 사용하여 이미지 지연 로딩 기능을 구현하였다. 일단 유저의 프로필 이미지를 렌더하고 있는 컴포넌트 내부에서 유저 프로필을 `img` 태그가 아니라 CSS의 `background-image` 속성을 사용하여 렌더하고 있기 때문에 필자가 생각했던 이 디렉티브의 인터페이스는 대충 이랬다.

```html
<div class="test" v-lazy-background-image></div>
<!-- 디렉티브 바인딩 후 -->
<div
  class="test"
  v-lazy-background-image
  data-lazy-background-image="스타일에서는 이미지 URL을 지우고 여기다가 이미지 URL을 담아놓자"
```

```css
.test {
  background-image: url(https://assets.soomgo.com/user/example.jpeg);
}
/* 디렉티브 바인딩 후 */
.test {}
```

이런 엘리먼트가 있을 때 `lazy-background-image` 디렉티브는 바인딩된 엘리먼트의 `style` 속성에 접근해서 `background-image` 속성이 있으면 해당 URL을 별도의 속성에 저장해놨다가 엘리먼트가 뷰포트에 진입했을 때 해당 이미지를 지연 로딩해주면 될 것 같았다. 여기까지 구상이 됐으면 Observer를 간단히 구현하면 된다. 그러나 한 가지 간과해선 안되는 점이 있는데,  IntersectionObserver API를 아직 지원하지않는 브라우저들이 많다는 것이다. 때문에 반드시 이런 브라우저들에 대해서 예외처리를 해줘야한다. IntersectionObserver API의 지원 현황에 대해서는 [Can I Use IntersectionObserver](https://caniuse.com/#feat=intersectionobserver)를 참고하자.

```ts lazy-background-image.directive.ts
const isSupportIntersectionObserver = 'IntersectionObserver' in window;

const intersectionObserver: IntersectionObserver|null = isSupportIntersectionObserver
  ? new IntersectionObserver((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const imageURL: string = entry.target.getAttribute('data-lazy-background-image');
        if (!imageURL.length) {
          return;
        }

        entry.target.style.backgroundImage = imageURL;
        observer.unobserve(entry.target);
      }
    });
  })
  : null;
```

IntersectionObserver의 constructor는 요소가 뷰포트로 들어오거나 벗어나는 등 행위가 발생했을 때 Observer가 호출할 콜백 함수를 전달 인자로 받는다. 과거 scroll 이벤트로 비슷한 행동을 처리했지만 이벤트는 동기적으로 반응하기 때문에 메인 스레드의 응답성, 간단하게 말하면 퍼포먼스에 영향을 준다. scroll 이벤트는 워낙 빈번하게 호출되기 때문에 scroll 이벤트 핸들러에서 조금만 많은 처리를 해도 화면이 뚝뚝 끊기는 등 문제가 발생하는 모습을 볼 수 있다.<small>(이벤트 옵션 중 passive 옵션을 사용하면 어느 정도 이 현상을 방어할 수는 있다.)</small>

그러나 Observer는 비동기적으로 동작하기 때문에 메인 스레드의 처리 스택과 독립적으로 실행된다. 브라우저 지원률이 90%가 안된다는 점만 해결된다면 진짜 좋을 텐데...
이제 Observer를 구현했으니 디렉티브를 뚝딱 만들면 된다.

```ts lazy-background-image.directive.ts
import { Vue } from 'vue-property-decorator';
import { VNode, VNodeDirective } from 'vue';

Vue.directive('lazy-background-image', {
  bind (el: any, binding: VNodeDirective, vnode: VNode) {
    if (isSupportIntersectionObserver) {
      if (!el.style.backgroundImage) {
        return;
      }
      el.setAttribute('data-lazy-background-image', el.style.backgroundImage);
      el.style.backgroundImage = '';
      intersectionObserver.observe(el);
    }
  },
  unbind (el: any) {
    if (isSupportIntersectionObserver) {
      intersectionObserver.unobserve(el);
    }
  },
});
```

이렇게 디렉티브를 사용하여 이미지 지연 로딩을 한 결과 최초 요청하는 이미지 개수를 60개에서 39개로 대폭 줄일 수 있었다.

<center>
  {% asset_img 'lazy_load_before.png' 'lazy_load_before' %}
  {% asset_img 'lazy_load_after.png' 'lazy_load_after' %}
  <br>
</center>

#### 컴포넌트 지연 로딩
숨고 프론트엔드는 SEO를 위해 첫 요청은 `SSR(서버사이드렌더링)`을 하지만 그 외에는 일반적인 SPA와 동일한 방식으로 작동한다. 그렇기 때문에 처음 애플리케이션이 초기화될 때 애플리케이션 내에서 사용될 모든 JavaScript와 CSS를 받아온다. 이 방식은 애플리케이션이 작을 때는 딱히 문제가 되지 않지만 애플리케이션이 커질수록 번들의 용량도 비례하여 늘어나므로 점점 부담이 되기 마련이다. 그래서 Webpack에서 제공하는 기능인 Dynamic Import를 사용하여 해당 페이지에서 사용하는 코드만을 비동기적으로 로드하여 사용하도록 변경하였다.

```ts router/search.ts
// Sync
import SearchPro from '@/pages/Search/SearchPro';

// Async
const SearchPro = () => import(/* webpackChunkName: "search" */ 'src/pages/Search/SearchPro');
```

`webpackChunkName` 주석을 사용하면 일정 단위의 모듈들을 하나의 청크로 묶어줄 수 있다. 숨고는 현재 HTTP/1.1 프로토콜을 사용하고 있으므로 한번에 요청할 수 있는 리소스의 개수가 6개 정도로 한정되어있다.<small>(이 개수는 브라우저의 정책에 따라 조금씩 다르다)</small> 
청크의 개수가 너무 많아지면 오히려 로딩 속도가 느려질 수 있으므로 관련있는 모듈을 묶어주어 청크의 개수가 너무 많아지지 않도록 조절하였다.

여기까지는 솔직히 별로 어려울 것도 없고 순조로웠는데 CSS를 별도의 번들로 분리하기 위해 사용하는 `mini-css-extract-plugin`에서 문제가 발생했다. 이 플러그인이 Dynamic import로 불러온 CSS 모듈을 처리하는 방식 때문에 SSR 사이클에서 `ReferenceError: document is not defined`라는 참조 에러가 발생했던 것이다.

```js node_modules/mini-css-extract-plugin/dist/index.js
var linkTag = document.createElement("link");
linkTag.rel = "stylesheet";
linkTag.type = "text/css";
linkTag.onload = resolve;
linkTag.href = fullhref;
head.appendChild(linkTag);
```

원래 코드는 엄청 거대하지만 간단하게 한번 추려보자면 여기가 문제가 발생한 부분이다.
SSR 사이클은 NodeJS 프로세스에서 실행되므로 당연히 document고 나발이고 없기 때문에 참조 에러가 발생한 것이다. 다행히 빌드 설정은 `client.config`와 `server.config`로 나눠서 관리되고 있기 때문에 적절한 조치를 취해줄 수 있었다. 클라이언트 사이드 렌더링 사이클은 문제 없으므로 최초 요청 시 Express가 Vue를 컴파일할때만 손봐주면 된다.

역시 StackOverflow에 필자와 같은 삽질을 했었던 전 세계의 개발랭이들이 이미 열띤 토론을 통해 [mini-css-extract-plugin의 SSR 관련 이슈](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/90)에 대해 어느 정도 결론을 내놓은 것을 발견했다. 위아 더 월드.

다양한 방법들이 논의되었지만 필자는 `css-loader`의 `exportOnlyLocals` 옵션을 사용하는 방법을 선택했다. 해당 이슈에는 `css-loader/locals`로 사용하라고 되어있지만 이 이슈가 논의된 이후에 css-loader가 업데이트 되었기 때문에 이제는 옵션 객체를 사용해야 한다.

```js webpack.server.config.js
module.exports = merge(baseConfig, {
  // ...
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'css-loader',
            options: { exportOnlyLocals: true }
          },
          'postcss-loader',
          'sass-loader'
        ]
      },
    ]
  }
  // ...
})
```

이렇게 문제는 해결했지만 일단 이 기술의 안정성이 프론트엔드 챕터 내에서 충분히 확인되지 않았다고 판단되어 일단 원래 목표였던 고수 찾기 페이지에 관련된 컴포넌트들만 지연 로딩하고 있는 중이다. 향후 안정성이 검증되면 점진적으로 커버리지를 넓혀 적용할 예정이다.

#### 텍스트 컨텐츠 gzip 압축 적용
이건 그냥 Nginx 설정에 gzip 관련 설정들을 추가해주면 된다.

```nginx
server {
  # ...
  gzip on;
  gzip_disable "msie6";

  gzip_proxied any;
  gzip_comp_level 6;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

사실 숨고는 IE6 지원 따위 하지도 않지만 유저가 아예 페이지를 못보는 상황보다는 망가진 페이지라도 보는게 낫다고 생각하여 혹시 몰라 추가해두었다. `컴포넌트 지연 로딩`과 `텍스트 컨텐츠 gzip 압축 적용`을 마치고나서 한번 번들의 크기와 로딩 속도를 확인해 보았다.

**JS**
Before
{% asset_img 'js_before.png' 'js_before' %}
After
{% asset_img 'js_after.png' 'js_after' %}

**CSS**
Before
{% asset_img 'css_before.png' 'css_before' %}
After
{% asset_img 'css_after.png' 'css_after' %}

JS before의 제일 상단에 있는 변태같은 1.2MB 크기의 번들이 node_modules 라이브러리를 묶어놓은 vendor이다. 항상 이 놈을 볼때마다 눈물이 나고 마음이 아팠는데 이렇게 간단하게 끝낼 수 있는 걸 왜 이리 시간을 끌었나 싶었다.

#### SEO가 필요한 페이지는 인증 과정을 기다리지 않고 바로 페이지를 렌더하도록 변경
사실 이건 숨고의 기술 부채와도 관련이 있는 내용이다. 현재 로그인한 사용자의 정보를 받아오는 API가 엄청 느리다. 보통 때는 응답 시간이 1.5초 정도이고 트래픽 피크 타임때는 2초에 가까워 지는 경우도 있다. 이건 DB 스키마와도 관련있는 깊은 기술 부채이기 때문에 짧은 시간 안에 해결하기에는 조금 힘든 문제다.

그렇다 하더라도 외부 네트워크 요인 때문에 사용자가 화면을 볼 수 있는 시간이 2초씩이나 딜레이된다는 것은 너무 아깝다. 근데 생각을 해보자.

> SEO가 필요한 페이지는 무조건 비로그인 유저도 볼 수 있는 페이지이다.

응? 사실 너무나 당연한 사실인데 놓치고 있었다. 그럼 이런 의식의 흐름이 생긴다.

1. SEO가 중요한 페이지의 로딩 시간을 단축시키는 것이 목표였다.
2. SEO가 되고 있는 페이지는 애초에 비로그인 유저도 접근 가능한 페이지다.
3. 인증 API를 기다릴 필요가 없다...?

그렇다면 그냥

```js client-entry.js
// ...
router.onReady(async () => {
  if (isAllowGuestPage(router.currentRoute)) {
    init();
  }
  else {
    await init();
  }
  // ...
});
```

이렇게 바로 질러버린다. 라우터 퍼미션을 검사해서 비회원 유저도 접근 가능한 페이지는 `init`의 프로미스를 기다리지 않고 다음 초기화 로직을 실행하도록 변경하였다. 그 결과 비회원 접근 가능 페이지들의 로딩 속도가 1초 정도 더 빨라진 것을 확인할 수 있었다.

| Before | After |
|--------|-------|
| 2513.9ms | 1111.5ms |

## 결과
이렇게 이것 저것 열심히 했더니 그래도 조금 빨라지긴 했다.

Before
<center>
  {% asset_img 'result_before.png' 500 %}
  <br>
</center>

After
<center>
  {% asset_img 'result_after.png' 500 %}
  <br>
</center>

원래 목표였던 `First Meaningful Paint`를 1초 아래로 떨어트리는 목표는 달성했지만 다른 수치가 이 정도로 영향을 안받을 줄은 몰랐다. 퍼포먼스 점수도 꼴랑 2점 올라갔다. 다른 팀원들은 "그래도 2점이 어디야~"라고 해주셨지만 뭔가 마음 한켠이 찜찜하다...
다음에는 다른 점수를 좀 더 올려보는 걸 목표로 삼아봐야겠다. PWA 세팅해놓으면 Accessibility 점수는 좀 더 올라갈 것 같기도 한데 생각해놓은 다른 이슈들은 백엔드 개발자 분들의 도움이 필요한 것들이 꽤 있어서 혼자서는 힘들 듯하다.

이상으로 클라이언트 사이드 렌더링 최적화 포스팅을 마친다.
