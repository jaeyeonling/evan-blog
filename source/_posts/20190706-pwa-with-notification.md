---
title: PWA 하루 만에 도입하기(삽질기)
tags:
  - JavaScript
  - Web Push
  - Notification API
  - Vue
  - PWA
  - Progressive Web Application
categories:
  - JavaScript
toc: true
widgets:
  - type: toc
    position: right
  - type: category
    position: right
sidebar:
  right:
    sticky: true
date: 2019-07-06 21:06:37
thumbnail: /2019/07/06/pwa-with-notification/thumbnail.png
---

이번 포스팅에서는 필자가 회사에서 `2019년 7월 5일 금요일` 하루 동안 기존 어플리케이션에 `PWA(Progressive Web Application)` 기능을 붙힌 삽질기를 기록하려고 한다. `PWA`는 지원하지 않는 브라우저에 대한 예외처리만 꼼꼼하게 해주면 `UX`, `성능`, `SEO` 등에서 무조건 플러스 요인이기 때문에 예전부터 계속 해보고 싶었다.
<!-- more -->

하지만 시간이 없어서 계속 미루고 있었는데 마침 어제 간만에 필자에게 여유 시간이 주어졌다.
필자가 지금 작업하고 있는 프로젝트가 회사의 비즈니스 모델과 밀접한 관련이 있는 프로젝트이고, 또 워낙 이 기능에 관련된 사내 `이해관계자(Stakeholder)`들이 많아서 `PO`가 테스트를 좀 더 꼼꼼히 하고 싶다고 했기 때문이다.

그래서 금요일 하루, 정확히 말하면 오전에는 버그 터진거 하나 핫픽스하고 점심먹고나서 자료 조사도 한시간 쯤 해본 다음에 `15시 30분` 쯤부터 시작해서 `22시 55분`까지 달렸다. 원래 필자는 근무시간에 열심히 하고 다른 시간은 나에게 투자하자는 주의라 야근은 왠만하면 안하는데, 필자에게 주어진 시간이 하루 밖에 없어서 그 안에 무조건 끝내야 했던 것도 있지만 사실 제일 큰 이유는...

<center>
 {% asset_img tyson.jpg 400 %}
 <br>
</center>

> 네, 쉽게 보고 덤볐다가 쳐맞았습니다.

필자는 사실 `PWA`를 구현해본 경험이 없다. 구글에서 제공해주는 데모는 몇번 돌려본 적이 있지만 나머지는 그냥 다른 굇수분들의 블로그를 보고 `오...나도 해보고 싶군` 정도로만 생각했었다.
근데 다른 사람들이 구현한 걸 보면 뭐 코드가 복잡한 것도 아니고 `서비스 워커(Service Worker)`도 작동 원리가 그렇게 생소한 느낌은 아니기에 사실 얕보고 있었다.

## 원래 필자의 계획
원래 필자도 `PWA`에게 쳐맞기 전까진 그럴싸한 계획이 있었다. 물론 필자는 자세히 공부를 하고 덤비는 타입이 아니라 그냥 대충 알아본 다음에 나머지는 직접 맞아가면서 배우는 타입이라 더 그랬던 것도 있다. 어쨌든 어제 점심을 먹고 와서 필자가 사무실에 앉아서 가만히 생각을 해본 결과, `PWA나 해볼까...? Manifest 넣고 서비스 워커 붙히면 뭐 나머지는 문서보고 해도 대충 될 거 같은데...?`로 결론이 나왔다.

그래도 `PWA`의 모든 기능을 다 구현하는 것은 퇴근 시간인 `19시`까지는 힘들 것 같아서 작업에 대한 스코프를 잡았다.

{% blockquote 문에반, 프로 계획러 %}
1. 기능을 전부 구현하는 건 힘들 것 같으니 일단 기반을 잡아놓는다고 생각하자.
2. 서비스 워커 설치.
3. Manifest.json 추가. 이건 남들 다하는 거니까 우리도 기본적으로 해야함.
4. Pusher SDK와 PushManager를 사용해서 브라우저가 꺼져있더라도 사용자에게 푸시 메세지를 보여주자.
5. 시간 되면 모바일에서 홈스크린에 어플리케이션을 추가하는 것까진 해보고 싶다.(우선순위 낮음)
6. 오프라인 캐싱은 다음 시간에...(나름 스코프 조절)
{% endblockquote %}

자 이제 계획이 잡혔으니 PO와 테스터에게 `프로젝트 테스트 하시는 동안 저는 저만의 놀이터에서 놀다 오겠습니다`라고 협의<small><del>(라고 쓰고 통보라고 읽는다.)</del></small>를 한 뒤 마스터에서 브랜치를 하나 땄다. 브랜치 이름도 필자의 의지가 돋보이는 `feature/service-worker-web-push`로 딱 지어놓고 `15시 30분` 쯤 부터 작업을 시작했다. 그래도 이정도면 한 `4~5시간` 안에 충분히 가능하겠다 싶었는데...

<center>
  {% asset_img babo.jpg %}
  <small>코딩하는 내내 필자의 정신상태</small>
  <br>
</center>

결과적으로 저 중에서 달성한 제대로 달성한 목표는 `1, 2, 3`번 뿐이이다. `4`번 목표인 푸시 메시지의 경우, Background 메세징은 삽질만 하다가 시간이 너무 많이 가서 실패하고 `Notification API`를 사용하여 Foreground에서만 노출되도록 구현했다.

처음에는 숨고 모바일 앱에서 이미 사용하고 있는 `FCM(Firebase Cloud Messaging)`을 사용하려고 했는데 그러면 웹 클라리언트의 푸시 채널이 이원화되기 때문에 일단 테스트도 해볼 겸 `FCM`없이 서비스 워커의 `PushManager`만 사용해서 구현하려고 했다.

이제 필자가 이것들을 작업하면서 어떤 문제에 봉착했고, 어떻게 해결했는지 한번 설명해보겠다.

## 제 1 관문, Manifest.json
제일 처음 한 일은 `manifest.json`을 생성하는 것이다. 이건 그냥 말 그대로 생성하면 된다. 또한 `manifest.json`은 어차피 정적인 파일이기도 하고 업데이트도 잦지 않은 파일이기 때문에 굳이 `Express`에서 응답하지 않아도 된다. 그래서 프로젝트 내부의 `static` 디렉토리에 `manifest.json`을 생성하고 `nginx`가 바로 응답해주는 방식으로 작성했다.

```json static/manifest.json
{
  "name": "숨고",
  "short_name": "숨고",
  "icons": [{
    "src": "https://d1hhkexwnh74v.cloudfront.net/app_icons/1x.png",
    "type": "image/png",
    "sizes": "48x48"
  }, {
    "src": "https://d1hhkexwnh74v.cloudfront.net/app_icons/2x.png",
    "type": "image/png",
    "sizes": "64x64"
  }, {
    "src": "https://d1hhkexwnh74v.cloudfront.net/app_icons/3x.png",
    "type": "image/png",
    "sizes": "128x128"
  }, {
    "src": "https://d1hhkexwnh74v.cloudfront.net/app_icons/3x.png",
    "type": "image/png",
    "sizes": "144x144"
  }],
  "start_url": "/?pwa=true",
  "display": "fullscreen",
  "background_color": "#FFFFFF",
  "theme_color": "#00C7AE",
}
```

`manifest.json`에 대한 자세한 내용은 Google Web Developer 문서의 [The Web App Manifest](https://developers.google.com/web/fundamentals/web-app-manifest/)를 참고해서 작성했다.

그리고 저 아이콘은 지금 숨고 앱에서 사용하고 있는 아이콘들이다. 굳이 모바일 앱과 다른 아이콘을 사용할 이유도 없고, 디자이너 분들도 바빠서 멘탈나간 상황이기 때문에 필자의 기술적인 욕심 때문에 아이콘을 만들어 달라고 하기엔 너무 미안했다.

또한 앱과 웹이 같은 아이콘을 사용해야 브랜딩 측면에서도 좋을 거라 생각해서 모바일 앱 레파지토리를 클론받아서 몰래 훔쳐왔다. 그리고 저 이미지들은 굳이 프로젝트 내에 저장할 필요가 없으므로 회사에서 사용하는 `S3` 버킷에 업로드하고 `CloudFront`로 딜리버리했다.

위에서 설명했듯이 필자는 `manifest.json`에 대한 요청을 `Express`가 처리하는 것이 아니라 서버 엔진인 `nginx`가 처리하는 방식을 선택했는데, 이렇게 `nginx`가 서버 어플리케이션까지 요청을 토스해주지 않고 그냥 알아서 서빙하도록 하고 싶다면 간단한 설정을 추가하면 된다.

```nginx
server {
  ...
  location ~ ^/static {
    root /your/project/location;
  }
  ...
}
```

이런 식으로 설정하면 바로 프로젝트 내의 `static` 디렉토리에 접근할 수 있다. `/static으로 시작하는 요청이 들어오면 /your/project/location 경로에서 니가 알아서 찾아줘~`라는 의미이다. 하지만 로컬에서 개발 서버를 사용할 때에는 nginx를 사용하지 않고 NodeJS를 사용하여 바로 개발용 서버를 띄우므로 로컬 환경에서는 `Express`가 직접 파일을 서빙할 수 있도록 해줘야 한다.

```js
if (process.env.NODE_ENV === 'local') {
    app.use('/static', serve('./static'));
}
```

이제 브라우저에게 `나의 Manifest 파일이 여기 있으니 가져가시오`라고 알려줄 수 있는 `link` 태그를 하나 넣어주면 끝이다.

```js constants/meta.constant.js
export default {
  // ...
  link: [{
      rel: 'manifest',
      href: '/static/manifest.json',
  }],
  // ...
};
```
```html
<link rel="manifest" href="/static/manifest.json" data-vue-meta="true">
```

필자는 `vue-meta` 라이브러리를 사용하고 있기 때문에 이렇게 `Object`형 객체를 리턴하는 방식을 사용하면 렌더링 때 `<head>` 내부에 알아서 넣어준다.
그 후 브라우저가 `manifest.json`을 제대로 가져가는지는 크롬 개발자 도구의 `Application > Manifest`에서 확인할 수 있다.

<center>
  {% asset_img has-manifest.png 300 %}
  <br>
</center>

자, 여기까지 하는데 거의 `10분` 정도 걸렸던 것 같다. 아직까지는 필자의 계획대로 순탄히 흘러가고 있었다.
하지만 문제는 이제부터 생기기 시작한다...

## 제 2 관문, Service Worker
기분 좋게 커피 한잔 때리고 와서 이제 `서비스 워커`를 적용하는 작업을 시작했다. 서비스 워커는 브라우저에 설치하고 나면 백그라운드에서 실행되는 프로세스로, 웹 어플리케이션의 메인 로직과는 전혀 별개로 작동한다.

서비스 워커와 웹앱의 메인 로직은 서로 `메세지`를 주고 받는 방식으로 작동한다. `postMessage`로 보내면 `onMessage`로 받는 방식인데, `WebView`나 `Chrome Extension`과 같은 방식이기 때문에 이미 우리에겐 익숙한 방식이다.

단, 아직까지 모든 브라우저에서 지원되는 것이 아니기 때문에 반드시 `navigator` 전역 객체 내부에 `serviceWorker` 객체가 존재하는 지 확인한 후 초기화를 진행해야한다.

```js
if ('serviceWorker' in navigator) { /* ... */ }
```

뭐 이 정도 쯤이야 필자같은 프론트엔드 개발자들에게는 굉장히 익숙한 상황이기 때문에 그냥 웃고 넘길 수 있지만 이것보다 더 귀찮은 게 있었다. 바로 서비스 워커의 개발환경 세팅이다.

### 개발환경 세팅
서비스 워커는 일반적인 웹 어플리케이션보다 많은 기능에 접근할 수 있기 때문에 보안이 굉장히 중요하다. 그래서 서비스 워커는 제한적인 환경에서만 작동할 수 있도록 만들어졌는데 그 조건은 딱 두가지이다.

1. 웹 어플리케이션의 호스트가 `localhost`이거나
2. `HTTPS` 프로토콜을 사용하고 있을 것

불행히도 필자는 이 두가지 모두 다 해당이 안된다. 필자의 회사는 로컬에서 `http://local.soomgo.com`이라는 오리진을 사용하고 있기 때문에 서비스 워커 객체가 활성화 되지 않는다.
그럼 해결 방법은 2가지로 줄어든다. 내가 `localhost`로 접속하거나 로컬에 `HTTPS`를 붙히거나.

사실 필자는 이걸 놓쳐서 `아 서비스 워커 어디갔어? 왜 안돼? 죽을래?`로 컴퓨터랑 실랑이하느라 한 30분 날려먹었다. 공식 문서에 버젓이 `한국어`로 적혀있는 내용이므로 항상 공식 문서를 꼼꼼히 읽자...

#### 개발 서버를 HTTPS로 띄우자!
근데 또 필자가 `localhost`로 맞추기에는 왠지 컴퓨터 따위에게 지는 기분이라 그냥 개발 환경에 `HTTPS`를 붙히기로 했다.
`Express`는 내장 객체로 `https` 객체를 지원해주고 있기 때문에 간단하게 셋업할 수 있다. 먼저 `HTTPS`를 사용하기 위해서는 SSH 키쌍이 필요하므로 `openssl`을 사용하여 키를 만들어 주었다.

```bash
$ openssl genrsa 1024 > private.pem # 비공개키 생성
...
$ openssl req -x509 -new -key private.pem > public.pem # 공개키 생성
```

그 다음 이 키를 프로젝트의 적당한 곳에 저장한 다음 그냥 사용하면 되는데 여기서 주의 사항.

{% blockquote /keys/README.md %}
\> 생성한 ssh키는 로컬 개발환경에서만 사용되어야합니다.
\> 이 디렉토리 내의 *.pem 파일은 gitignore에 추가되어있습니다.
{% endblockquote %}

**절대 리모트 저장소에 SSH 키를 업로드하지 말자.** 보안 터진다. 대신 필자는 다른 개발자들이 쉽게 `HTTPS` 환경을 세팅할 수 있도록 프로젝트 내에 키를 저장하는 디렉토리 내부에 `README.md`를 작성해놓고 이 키가 어떤 용도로 사용될 것인지 주의 사항은 무엇인지 상세하게 적어놓았다.
그리고 개발할 때는 `HTTPS`가 아니라 `HTTP`로 서버를 띄울 일도 생길 수 있으므로 개발 서버를 띄울 때 옵션을 사용하여 프로토콜을 선택할 수 있도록 해주었다.

```json package.json
{
  "scripts": {
    "serve": "cross-env NODE_ENV=local node server",
    "serve:https": "cross-env NODE_ENV=local node server --https",
  }
}
```

```js server.js
const express = require('express');
const https = require('https');

// node의 옵션들은 배열 형태로 process.argv에 담겨있다.
const useHttps = process.argv.some(val => val === '--https');

const app = express();

// ...
if (isLocal) {
  let localApp = app;
  if (useHttps) {
    localApp = https.createServer({
      // 아까 생성한 키는 여기서 사용한다!
      key: fs.readFileSync('./keys/private.pem'),
      cert: fs.readFileSync('./keys/public.pem'),
    }, app);
  }
  localApp.listen(port, host, () => {
    debug(`${isHttps ? 'https://' : 'http://'}${host}:${port}로 가즈아!!!!`);
  });
}
// ...
```

이런 식으로 작성해놓으면 개발 서버를 올릴 때 원하는 프로토콜을 자유자재로 변경할 수 있기 때문에, 혹시 내가 개발 서버를 `HTTPS`로 바꿔놔서 다른 개발자 컴퓨터에서 개발 서버가 안 올라가도 일단 시간을 벌어놓고 버그를 수정할 수 있다.

원래 진짜 고수는 맞기 전에 맞을 곳을 예상해서 미리 힘을 주고 있는 법이다.<small>(많이 맞아본 1인)</small>

개발 서버를 `HTTPS`로 띄우면 이제 `navigator` 객체 내부에 이쁘게 들어가있는 `serviceWorker` 객체를 확인할 수 있다.

```js
> navigator.serviceWorker
< ServiceWorkerContainer {ready: Promise, controller: null, oncontrollerchange: null, onmessage: null}
```

#### HTTPS를 쓰지 않고 문제 회피하기
사실 필자도 처음에는 로컬에 `HTTPS` 붙히기가 귀찮아서 리서치하다가 찾은 얌생이인데, 로컬 서버에서도 `HTTPS`를 사용하지 않고도 서비스 워커를 사용할 수 있는 방법이 있다.

`chrome://flags/#unsafely-treat-insecure-origin-as-secure`에 들어가서 해당 기능을 활성화하고 텍스트 필드에 원하는 호스트를 입력해놓으면 해당 호스트는 안전하다고 판단하여 서비스 워커를 사용할 수 있게 해준다.

<center>
  {% asset_img secure-hack.png %}
  <br>
</center>

이렇게 등록한 뒤 하단의 `Relaunch Now` 버튼을 클릭하면 크롬이 재시작되면서 설정이 변경된다. 하지만 이 방법은 스스로 보안 취약점을 만들어 내는 것이기 찜찜해서 결국 사용하지는 않았다.

### Service Worker 작성
이제 개발환경 세팅이 다 끝났다면 이제부터는 딱히 귀찮은 건 없다. 그냥 문서보면서 쭉쭉 작성하면 된다. 일단 서비스 워커의 기능을 구현하기 전에 잘 작동하는 지 부터 확인해야 하므로 아무 내용이 없는 서비스 워커부터 만들었다.

근데 이것도 `manifest.json`처럼 그냥 웹 어플리케이션과 완전 분리된 `static/service-worker.js`로 따로 작성하면 만들 때는 편하긴 한데, 나중에 서비스 워커에서 웹 어플리케이션에서 사용하고 있는 모듈이나 데이터에 접근하고 싶을 때 굉장히 애매해질 것 같아서 그냥 `Webpack`을 사용해서 같이 빌드하기로 결정했다.

#### 일단 service-worker.js 파일을 만들자!
`Webpack`으로 빌드한다고 해도 이 친구가 무에서 유를 창조하는 친구는 아니기 때문에 당연히 소스 파일은 있어야 한다. 일단 서비스 워커가 작동하는 것을 보는 것이 목적이므로 심플하게 작성해주었다.

```js src/service-worker.js
self.addEventListener('message', event => {
  console.log('저 쪽 테이블에서 보내신 겁니다 -> ', event);
});
```

#### Service Worker Webpack Plugin 사용하기
`ServiceWorkerWebpackPlugin`은 구글에 `Service Worker Webpack`을 검색하면 가장 상단에 나오는 플러그인이다. [깃허브 레파지토리](https://github.com/oliviertassinari/serviceworker-webpack-plugin)에 가서 다들 구경 한번 해보자.

`README`를 읽어보니 사용법이 초간단 그 자체다. 그냥 `Webpack` 설정에 넣어주면 끝이다.

```js build/webpack.client.config.js
module.exports = merge(baseConfig, {
  plugins: [
    // ...
    new ServiceWorkerWebpackPlugin({
        entry: path.resolve(__dirname, '../src/service-worker.js'),
    }),
    // ...
  ]
})
```

서비스 워커 파일 경로를 찍어주고 `ServiceWorkerWebpackPlugin` 객체를 생성할 때 초기 인자로 넘겨주면 `Webpack` 설정의 `output`에 정의된 경로에 `sw.js` 파일을 생성해준다. 물론 이 파일 이름은 변경할 수 있으니 모두 각자의 취향대로 애정을 듬뿍 담은 이쁜 이름을 지어주자. 필자는 귀찮으니까 그냥 `sw`로 가기로 했다.

<center>
  {% asset_img sw.png %}
  <small>이쁘게 태어난 sw.js</small>
  <br>
</center>

근데 이 방법의 단점이 있는데, 일반적인 서비스 워커보다 파일의 크기가 커진다는 것이다. 아무래도 `Webpack`으로 빌드하다보니 서비스 워커의 외부에 있는 모듈이나 라이브러리를 끌어오기 때문이다.
뭐 이건 애초에 필자가 조금 편하게 쓰려고 선택한 상황이니 어쩔 수 없긴하다. 어쨌든 이런 단점이 있으니, 서비스 워커의 크기를 줄이고자 하시는 독자분들은 직접 작성하시는 게 더 좋을 수도 있다.

이제 서비스 워커의 본체를 만들었으니 이걸 웹 어플리케이션이 초기화될 때 브라우저에 `나 서비스 워커 가지고 있어!`라고 알려주는 일만 남았다.

### Service Worker 설치
서비스 워커를 설치하는 방법은 간단하다. 이 브라우저에 `serviceWorker` 객체가 지원되는 지 확인한 후 설치하면 된다.
일반적인 서비스 워커의 설치 방법은 구글의 [서비스 워커:소개](https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ko) 문서를 보고 따라하면 된다.  필자는 `ServiceWorkerWebpackPlugin`을 사용했기 때문에 해당 플러그인의 문서를 참조하여 작성했다.

어차피 어떤 방법을 사용하든 설치 자체는 그렇게 어렵지 않다.

```ts settings/service-worker.setting.js
export default () => {
  const isSupported = process.browser && 'serviceWorker' in navigator;

  if (!isSupported) {
    return;
  }

  console.log('서비스 워커가 지원되는 브라우저 입니다.');

  const runtime = require('serviceworker-webpack-plugin/lib/runtime');

  runtime.register().then(res => {
    console.log('서비스 워커 설치 성공 ->', res);
  }).catch(e => {
    console.log('서비스 워커 설치 실패 ㅜㅜ -> ', e);
  });
}
```

`isSupported` 변수에 `process.browser` 값을 검사하는 이유는, 숨고의 어플리케이션은 `Next.js`나 `Nuxt.js` 처럼 유니버셜 SSR 환경에서 실행되기 때문이다.
유니버셜 SSR이 뭔지 궁금하신 분은 이전에 작성한 포스팅인 {% post_link universal-ssr Universal Server Side Rendering이란? %}을 한번 읽어보자.

해당 모듈은 물론 클라이언트 사이드에서만 호출되지만 그래도 혹시 모르니 왠만하면 현재 실행 컨텍스트가 클라이언트인지 서버인지는 체크해주는 것이 좋다.
서버 사이드 렌더링 사이클 때 브라우저 API인 `navigator`에 접근하려고 하면 당연히 에러가 발생한다.

서비스 워커의 설치가 성공했다면 `chrome://inspect/#service-workers` 또는 `chrome://serviceworker-internals`에 여러분의 서비스 워커가 노출될 것이다. 서비스 워커를 적용하는 방법은 사실 굉장히 심플한 편이다.

근데 사실 필자가 가장 시간을 많이 잡아먹은 부분이 바로 이 서비스 워커였는데, 그 이유는 서비스 워커 공식 문서에 적혀있다.

{% blockquote Matt Gaunt, contributor to WebFundamentals %}
<strong>설치 실패 알림 기능 부족</strong>

서비스 워커가 등록되더라도 `chrome://inspect/#service-workers` 또는 `chrome://serviceworker-internals`에 표시되지 않는 경우 오류가 발생했거나 `event.waitUntil()`에 거부된 프라미스를 전달했기 때문에 설치하지 못했을 수 있습니다.

이 문제를 해결하려면 `chrome://serviceworker-internals`로 이동하여 'Open DevTools window and pause JavaScript execution on service worker startup for debugging'을 선택하고 설치 이벤트의 시작 위치에 디버거 문을 추가합니다. 이 옵션을 [확인할 수 없는 예외 시 일시 중지](https://developers.google.com/web/tools/chrome-devtools/javascript/breakpoints?hl=ko)와 함께 사용하면 문제를 찾을 수 있습니다.
{% endblockquote %}

아니 이게 디버깅이 진짜 힘들다. 서비스 워커의 설치가 실패했으면 어디서 에러가 났는지, 왜 났는지 보여줘야 하는데 `Uncaught DomException` 하나만 딸랑 보여주고 끝낸다. 그래서 뭐가 잘못되었는지 하나하나 코드 라인에 `debugger` 찍고 추리해가면서 수정해야하는데 이게 진짜 힘들다. 근데 이걸 또 공식 문서에 디버깅 힘들다고 버젓이 적어놔서 괜히 더 힘든 거 같다.

<center>
  {% asset_img conan.png 300 %}
  <small>도와줘요 명탐정... 범인말고 내 버그도 찾아줘...</small>
  <br>
</center>

## 제 3 관문, PushManager
이제 서비스 워커도 설치했으니 서비스 워커의 `PushManager`만 연동해주면 모든 것이 끝난다! 라고 생각했지만 이 놈도 복병이었다.
`PushManager` 또한 아직 표준이 아니라서 모든 브라우저에서 지원되는 기능이 아니기 때문에 서비스 워커 설치 시 `PushManager`의 존재 여부도 함께 검사해주어야한다.

```js settings/service-worker.setting.js
const isSupported = process.browser && 'serviceWorker' in navigator && 'PushManager' in window;
// ...
```

조건의 가독성이 조금 떨어진 것이 마음에 안들지만 일단은 구동 테스트를 하는 것이므로 그냥 넘어갔다. 딱 여기까지 하고나서 다음 스텝을 봤더니...

### 재앙의 시작
{% blockquote Matt Gaunt https://developers.google.com/web/fundamentals/codelabs/push-notifications/?hl=ko 웹 앱에 푸시 알림 추가 %}
<strong>애플리케이션 서버 키 가져오기</strong>

이 코드랩으로 작업하려면 애플리케이션 서버 키를 몇 개 생성할 필요가 있는데, 도우미 사이트인 https://web-push-codelab.glitch.me/에서 생성할 수 있습니다.
여기서 공개 키 쌍과 비공개 키 쌍을 생성할 수 있습니다.
다음과 같이 `scripts/main.js`로 공개 키를 복사하여 `<Your Public Key>` 값을 바꾸세요.

`const applicationServerPublicKey = '<Your Public Key>';`

참고: 절대로 비공개 키를 웹 앱에 두면 안 됩니다!
{% endblockquote %}

응...? SSH 키가 필요하다고...? 뭔가 느낌이 쎄하다싶어서 PushManager로 구독하는 예제를 살펴봤더니 확실히 SSH 키가 필요하긴 했다.

```js
function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  // ...
}
```

음 아직까진 괜찮다. 어차피 `Pusher`라는 푸시 솔루션을 이미 사용하고 있고 이것도 결국 비슷한 원리로 작동하기 때문에 내부적으로는 SSH 키쌍을 사용한 인증을 사용했을 것이다.

### 빠른 손절
그렇게 찾기를 어언 20분... 결국 못 찾았다. `Pusher` 내부적으로 서버에서 사용하는 `secret`값과 클라이언트에서 사용하는 `key`를 사용하여 인증을 하는데, 이건 SSH 키쌍이 아니라 그냥 임의의 문자열이었다. 어차피 SSH 키를 만든다고 해도 웹 푸시에 대한 컨트롤은 백엔드가 가지고 있으므로 필자 혼자 이것저것 건드리면서 테스트 해보기에는 조금 무리가 있다. 게다가 퇴근 시간은 이미 한참 지났기 때문에 백엔드 분들은 퇴근하셨다.<small>(사실 금요일 저녁에 이런 거 하고 있는 사람이 이상한거다.)</small>

이때 이미 필자의 멘탈은 조금 나가있었기 때문에 월요일에 출근해서 모바일 앱에서는 어떻게 `Pusher`와 `FCM`을 연동해서 사용하고 있는 지 물어본 후 진행해야겠다고 결론을 내리고 방향을 바꿨다.

커밋 로그를 보니 이때 시간이 대략 `21시 40분` 쯤... 아니 그래도 퇴근은 해야하니까... 집에는 가야지...

<center>
  {% asset_img giveup.png 400 %}
  <small>역시 아니다 싶으면 빠른 손절이 답이다...</small>
  <br>
</center>

## 제 4 관문, Notification API
그래서 바꾼 방향은 `Background 푸시 메세지는 포기하고 Foreground 푸시 메세지라도 제대로 받게 하자`였다.
이렇게 되면 필자가 처음 생각했던 `브라우저가 꺼져있더라도 푸시 메세지를 보여주고 싶다`는 달성하지 못하지만 브라우저가 켜져있고 `soomgo.com`에 접속되어 있다면 창을 내려놓든 다른 일을 하고 있든 사용자에게 푸시 메세지는 보여줄 수 있으므로 어느 정도 목적 달성은 된다.

방향을 바꾸고 나니까 기존의 웹 어플리케이션에 구현되어있던 푸시 로직에 노티피케이션을 보여주는 코드만 추가하면 끝나는 간단한 일이 되었다. 어차피 [Pusher](https://pusher.com/) 솔루션을 사용하여 인증, 이벤트 구독 등의 로직은 예전에 채팅 기능 개발할 때 다 만들어 놨기 때문이다.

### 기존 기능에 Notification 끼워넣기
예전에 채팅 기능을 개발할 때 `Pusher SDK`를 한번 래핑한 헬퍼 클래스도 만들어 놨었기 때문에 나름 구조도 탄탄하다. 이제 여기에 메소드만 몇개 추가하고 웹 푸시 이벤트가 발생했을 때 알림만 보여주면 된다.
우선 이 브라우저가 `Notification API`를 지원하는 지 확인하는 메소드가 필요하다.

```js src/helpers/Pusher.js
isSupportNotification () {
  return process.browser && window && 'Notification' in window;
}
```

그 다음 사용자에게 `알림`에 대한 허가를 받는 메소드를 작성한다. `Notification`은 내부에 `permission` 속성을 가지고 있고 이 속성은 `granted`, `denied`, `default`로 나누어 진다.

```js src/helpers/Pusher.js
getNotificationPermission () {
  if (!this.isSupportNotification()) {
    this.isAllowNotification = false;
    return Promise.reject(new Error('not_supported'));
  }

  if (Notification.permission === 'granted') {
    this.isAllowNotification = true;
    return Promise.resolve();
  }
  else if (Notification.permission !== 'denied' || Notification.permission === 'default') {
    return Notification.requestPermission().then(result => {
      if (result === 'granted') {
        this.isAllowNotification = true;
      }
    });
  }
}
```

`granted`는 사용자가 이미 알림을 허용한 상태, `denied`는 거부한 상태, `default`는 아직 알림에 대한 퍼미션을 줄지말지 사용자가 결정을 하지 않은 상태이다. 따라서 우리는 `granted`와 `default` 상태일 때 `Notification.requestPermission` 메소드를 사용하여 사용자에게 알림 노출에 대한 허가를 받아야 한다.

이제 실제로 알림창을 띄워줄 메소드를 작성해보자. `Notification API` 자체가 워낙 심플하다보니 그닥 어렵지 않다.

```js
createForegroundNotification (title, { body, icon, link }) {
  const notification = new Notification(title, {
    body,
    icon: icon || `${AssetsCloudFrontHost}/app_icons/1x.png`,
  });

  notification.onshow = () => {
    setTimeout(() => notification.close(), 5000);
  };
  notification.onerror = e => {
    console.error(e);
  };
  notification.onclick = event => {
    event.preventDefault();
    if (link) {
        window.open(link, '_blank');
    }
  };
}
```

`new` 키워드를 사용하여 `Notification` 객체를 생성하면 그 즉시 `OSX`는 화면 우측 상단에, `Windows`는 우측 하단에 알림 메세지가 노출된다. 그 다음 생성한 `Notification`객체의 `onshow`, `onclick` 등의 이벤트 리스너에 핸들러를 등록해주면 된다.

메소드 명은 `Background` 메세징을 실현하지 못한 필자의 슬픔을 담아 `createForegroundNotification`으로 결정했다. 굳이 `Foreground`를 강조한 이유는 언젠가 `createBackgroundNotification` 메소드를 만들겠다는 필자의 야망을 담았다.

이제 필요한 모든 것을 만들었으니 `Pusher SDK`에서 Web Socket을 통해 푸시를 보낼 때마다 알림이 작동하도록 연결만 해주면 된다.

```js
async subscribeNotification () {
  if (!this.isSupportNotification()) {
    return;
}

  await this.getNotificationPermission();
  if (!this.isAllowNotification) {
    return;
  }

  const channel = await this.getPrivateUserChannel();
  channel.bind('message', response => {
    if (response.sender.id === this.myUserId) {
      return;
    }

    const targetChatRoute = !!response.sender.provider ? 'chats' : 'pro/chats';
    this.createForegroundNotification(`${response.sender.name}님이 메세지를 보냈어요.`, {
      body: response.message,
      icon: response.sender.profile_image,
      link: `${location.origin}/${targetChatRoute}/${response.chat.id}`,
    });
  });
}
```

`Pusher SDK`는 푸시 채널에 이벤트 핸들러를 바인딩할 수 있는 기능을 제공해준다. `message` 이벤트는 사용자가 채팅 메세지를 받았을 때 호출되는 이벤트이다. 단 자기 자신이 보낸 메세지에도 여과없이 이벤트가 호출되므로 `response.sender.id === this.myUserId` 조건을 통해 자신이 보낸 메세지에는 알림을 보여주지 않도록 처리하였다.

그 다음은 이제 사용자가 작은 알림 메세지만 보고도 어떤 상황이 벌어지는 것인지 쉽게 알 수 있도록 `OOO님이 메세지를 보냈어요`라는 형식의 제목과 메세지의 내용, 상대방의 프로필 사진을 사용하여 `Notification` 객체를 생성하면 끝이다.

<center>
  {% asset_img push.png 500 %}
  <small>필자의 멘탈 상태를 여과없이 보여주는 메세지 내용. 29살먹고 잉잉...</small>
  <br>
</center>

어쨌든 이렇게 해서 브라우저에 `soomgo.com`이 열려있다면 사용자들은 다른 일을 하다가 계속 페이지를 확인하거나 핸드폰을 확인할 필요없이 데스크탑 내에서 새로운 채팅 메세지를 바로 확인할 수 있게 되었다.

아직도 `Background` 상태에서 푸시 메세지를 바로 보여주지 못했다는 게 아쉽긴 하다. 하지만 이 정도만 해도 사용자들 입장에서는 꽤나 편할 것이라고 생각한다.

## 마치며
사실 처음 목표했던 걸 다 이루진 못해서 찝찝했지만 너무 피곤했기 때문에 다음을 기약하기로 했다.
이제 월요일에 출근해서 `PO`한테 이걸 보여주고 혹시 뭐 추가하고 싶은 거 없는지 물어보고 몇가지 테스트를 좀 해본 후 배포할 예정이다.

서비스 워커에 `fetch` 이벤트 핸들러를 추가하면 `Add to Homescreen` 기능도 사용할 수 있지만 사실 숨고의 프론트엔드 챕터 공식 입장은 사용자들이 모바일 웹보다는 모바일 앱을 많이 사용했으면 하는 것이기 때문에 이건 할까말까 고민 중이다.<small><del>(인앱 브라우저 크로스브라우징 하기 싫...)</del></small>

일단 처음 스코프를 너무 크게 잡은 것 같기도 하다. 하나하나 좀 자세히 알아보고 작업을 했으면 좋았을 것 같은데 월요일부터는 바로 또 하던 프로젝트 작업을 다시 해야해서 마음이 급했던 것도 있다. 그리고 회사에 프론트엔드 개발자가 부족하기 때문에 이런 기술적인 기능을 붙히는 건 우선 순위가 낮은 편이라서 `지금 아니면 앞으로 언제 할 수 있을 지 모른다`라는 마음도 컸던 것 같다.

막간을 이용해, 필자와 함께 일해주실 [프론트엔드 개발자 분을 모신다는 JD](https://www.wanted.co.kr/wd/14044)를 뿌리면서 포스팅을 마무리 하겠다.
PWA 외에도 다른 하고 싶은 건 많은데 프론트엔드 개발자가 모자라서 못하고 있기 때문에 경력 여하와 상관없이 그냥 재밌는 거 좋아하시는 분이면 된다.<small>(하고 싶은 개발 다 하실 수 있도록 이 한몸 불살라 보필하겠습니다.)</small>

이상으로 PWA 하루 만에 도입하기 포스팅을 마친다.
