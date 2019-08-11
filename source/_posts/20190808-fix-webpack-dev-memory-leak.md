---
title: Webpack Watch의 메모리 누수 고치기
tags:
  - Webpack
  - JavaScript
  - NodeJS
  - webpack dev server
  - webpack dev middleware
  - memory-fs
  - MFS
  - Memory leak
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
date: 2019-08-08 16:20:55
thumbnail: /2019/08/08/fix-webpack-dev-memory-leak/thumbnail.png
---


이번 포스팅에서는 최근에 고쳤던 Webpack Watch 기능의 메모리 누수에 대해서 간략하게 남겨보려고 한다. 필자가 회사에서 개발한 프로젝트가 점점 커짐에 따라서 Watch 중에 빌드를 여러 번 돌리게되면 어느 순간 갑자기 `out of memory`가 뜨면서 프로세스가 죽어버리는 이슈가 발생하였다. 이 문제는 사실 꽤 예전부터 발생했던 이슈지만 계속 비즈니스 이슈를 개발하느라고 외면받고 있던 이슈였는데 우연히 기회가 되어 해당 이슈를 자세히 들여다 볼 수 있었다.
<!-- more -->

사실 구글에 `webpack watch memory leak`이라고 검색만 해봐도 같은 이슈로 고통받고 있는 전세계의 동지들이 많다는 것을 알 수 있다.

<center>
  {% asset_img out-of-memory.png 700 %}
  <small>Webpack을 사용하다보면 자주 볼 수 있는 슬픈 화면</small>
  <br>
</center>

일단 이 문제의 가장 유명한 해결 방법은 바로 NodeJS의 `--max-old-space-size`을 사용하여 Old Space의 영역을 늘리는 것이다. 원래 Old Space의 기본 크기는 64비트 기준 1.4GB 정도이지만 이렇게 메모리가 터지는 경우 Old Space에 4GB나 8GB를 할당할 것을 권장하는 해결 방법이 많다.

사실 이 방법을 사용하면 왠만큼 해결은 된다. 메모리 누수는 일반적으로 `GC(가비지 컬렉팅)` 때 수집되어야 할 쓰레기가 제대로 수집되지 않아서 발생하는 경우가 대부분인데, 이때 수집되지않은 쓰레기 객체들은 모두 Old Space에 있기 때문이다. 하지만 이 방법은 근본적인 해결 방법이 아니라 그냥 메모리가 터지는 시점을 좀 더 늦춘 것 뿐이다.

> Old Space에 4GB를 할당해주고 20번 빌드했더니 메모리가 터져서 Old Space에 8GB를 할당했다? 그레봤자 약 40번 정도 빌드하면 언젠간 또 터진다.

그렇다고 이렇게 해결하는 것이 틀린 방법인 건 아니다. 필자도 사실 이미 `--max-old-space-size=4096` 옵션을 통해 Old Space에 4GB 정도를 할당해주고 있었다. 하지만 이건 마치 뭐랄까, 진통제 같은 느낌이지 근본적인 치료는 아니기 때문에 이번 기회에 필자는 이 이슈의 원인을 찾아내어 제대로 고쳐보고 싶었다.

## NodeJS 인스펙터 사용하기
먼저, 이런 메모리 누수가 고치기 까다로운 이유는 원인 추적이 힘들기 때문이다. 예를 들어 `TypeError`같은 경우는 로그에 아주 명확하게 `어디서, 왜` 타입에러가 발생했는지 알려주지만 메모리 누수는 그딴 거 없다. 그냥 쭉쭉 잘 실행되고 있는 듯 보이다가 어느 순간 픽! `out of memory`를 남기고 프로그램이 죽어버리기 때문이다. 프로그램이 죽으면서 마지막 힘을 짜내어 몇 줄의 Stack Trace를 남겨주긴 하지만, 표면적인 원인만 보여주는 느낌이기 때문에 메모리 누수를 고칠 때는 별 도움이 안되었던 것 같다.

그래서 이런 메모리 누수를 고칠 때는 가장 먼저, 자바스크립트의 Heap을 뜯어봐야한다. 프로그램 내에서 어떤 놈이 메모리를 점점 갉아먹고 있는 지 부터 파악하는 것이다. NodeJS를 실행시킬 때 몇가지 옵션을 사용하면 구글 크롬(Chrome)의 개발자 도구를 사용하여 Heap의 스냅샷을 찍을 수 있다.

```bash
$ node --inspect --inspect-brk server
```

<center>
  {% asset_img inspector.png 500 %}
  <br>
</center>

`--inspect` 옵션을 사용하여 어플리케이션을 시작하고나서 구글 크롬의 아무 창이나 선택한 후 개발자 도구를 켜보면 왼쪽 구석에 NodeJS의 아이콘이 생긴 것을 확인할 수 있다. 그 아이콘을 누르면 NodeJS를 프로파일링할 수 있는 새로운 인스펙터가 나타난다. 그리고 `--inspect-brk` 옵션은 코드를 실행하기 전 Debug Pause 기능을 이용하여 실행을 멈춰준다. 개발자가 직접 Resume 버튼을 눌러주면 코드가 실행된다.

## 메모리 누수 원인
필자도 맨 처음에 했던 일이 바로 NodeJS의 인스펙터를 사용하여 Heap 스냅샷을 찍어보는 것이었다. 사실 필자는 이 이슈가 일반적인 메모리 누수 상황과는 조금 다르다고 생각했는데, 보통 일반적인 메모리 누수는 대략 이런 시나리오로 그려진다.

{% blockquote %}
  1. 객체를 생성!
  2. 객체 참조를 해제함!
  3. 근데 GC가 안됨...? 뭐지...?
  4. 알고 보니 다른 놈이 참조를 하고 있었다는 결말
{% endblockquote %}

그렇기 때문에 보통 메모리 누수는 `어떤 놈이 해제되어야 할 객체를 참조하고 있는거지?`로 시작하는 경우가 많다.
그래서 보통 객체 할당을 하고 한번 Heap 스냅샷을 찍고, 다시 객체 참조를 해제한 다음 다시 Heap 스냅샷을 찍은 후 그 두 스냅샷을 비교하는 방법으로 디버깅을 진행한다. 분명히 나는 참조를 해제했는데 뭔가 아직도 유지되고 있는 놈이 보인다? 바로 그 놈이 범인일 가능성이 높다. 이 범인 색출이 오지게 힘들긴 하지만...

하지만 Webpack의 메모리 누수 이슈는 이런 복잡한 이슈는 아닌 것 같았다. Stack Overflow에서 다른 사람들의 사례를 보면 프로젝트가 작을 때는 별 문제 없다가 프로젝트가 커질수록 이런 문제가 발생한다는 사례가 많았고, 필자 또한 그런 상황이었기 때문에 처음부터 방향은 `혹시 빌드할 때마다 파일이 계속 누적되고 있나?`라는 가설로 잡았기 때문이다.

그래서 가설을 확인하기 위해 일단 빌드를 `n번` 진행한 후, 메모리 사용량의 변화를 살펴보기 위해 매 빌드마다 Heap 스냅샷을 찍었고, 그 결과 `Memory File System` 이라는 놈이 점점 비대해지고 있는 것을 발견했다.

| 빌드 횟수 | MFS의 메모리 사용량(byte) |
|---------|-----------------|
| 1 | 21,034,701 |
| 2 | 38,776,735 |
| 3 | 45,209,592 |
| 4 | 51,642,543 |
| 7 | 83,807,008 |
| 10 | 122,404,490 |
| 13 | 180,301,478 |

여기까지 확인한 후 `Memory File System` 객체의 내부를 한번 까봤더니 예상한 대로 번들링했던 모든 파일이 계속 누적되고 있는 것을 확인할 수 있었다.

<center>
  {% asset_img mfs.png 500 %}
  <small>징글징글한 것들...</small>
  <br>
</center>

왜 이런 문제가 발생했을까? 그 이유는 해당 프로젝트의 Webpack 세팅의 번들 파일 이름 패턴이 `client-bundle.[chunkhash].js`로 되어있었기 때문이다. `chunkhash`나 `hash` 옵션은 매 번들링 때 새로운 파일명을 만들어주므로 운영환경에서 발생하는 `파일 캐싱 이슈`에 대해서 자유롭게 해준다. 하지만 개발 환경에서는 이 옵션이 오히려 독이 된 것이다.

Webpack은 개발 서버를 띄울 때 번들링된 파일을 `memory-fs`라는 라이브러리를 사용하여 저장한다. 이 라이브러리는 그냥 내부적으로 `맵(Map)`을 가지고 있고 파일 내용은 `파일의 각 라인을 원소로 가지고 있는 배열(Array)`이다. 즉 번들링된 파일 이름이 `main.js`이면 다음과 같은 구조를 가진 객체가 생성된다는 것이다.

```js
const MFS = {
  'main.js': ['var a = 1', 'console.log(a)']
}
```

만약 필자가 `main.js` 파일이나 여기서 종속된 모듈을 수정하면 `main.js`는 다시 번들링 될 것이고 `MFS` 객체의 `main.js`키의 값을 새로 번들링된 파일의 내용으로 변경할 것이다. 그러나 문제는 `chunkhash`나 `hash`와 같이 빌드 때마다 파일 이름이 변경되는 경우에 생긴다.

```js
const MFS = {
  'main.1111.js': ['var a = 1'], // 기존 파일
  'main.2222.js': ['var a = 2'] // 새로 번들링된 파일
}
```

`main.1111.js`는 이전 빌드 때 생성된 번들이고 `main.2222.js`는 이번 빌드 때 생성된 번들이다. `chunkhash`, `hash`는 파일을 다시 번들링하면 해쉬값이 변경되므로 번들링된 파일의 이름이 달라지게 되고, 결과적으로 `MFS` 객체에 저장되어있던 이전 버전 번들은 교체되지 않고 남아있게 된다. 즉, 파일이 누적된다.

이 객체 자체나, 파일 라인들을 담고 있는 배열, 라인들의 값을 가지고 있는 문자열 모두 당연히 메모리에 저장되고, `memory-fs`가 이 친구들을 계속 참조하고 있으니 결과적으로 Old Space로 넘어간 후에도 계속 GC에 수집되지 않았던 것이다.

## 해결 방법
사실 이 문제를 처음 접했을 때 3가지 정도의 해결 방법을 생각했었다.

{% blockquote %}
  1. 개발 환경일 때는 파일 이름 패턴에 `hash`나 `chunkhash`를 사용하지 않는다.
  2. Webpack의 compiler hook에서 이전 빌드의 번들을 직접 제거(`HotModuleReplacement`가 사용하는 방법임)
  3. 그냥 Old Space를 늘려준다.<small>(자존심을 버린 최후의 방법)</small>
{% endblockquote %}

사실 1번 방법인 `파일 이름 패턴에서 chunkhash를 제거하기` 만으로도 해결되는 문제긴 하지만, 혹시 모르니 다음 차선책까지 생각해둔 것이다. 필자는 보통 이런 문제를 만나면 한번에 해결된다는 기대를 잘 안하는 편이다.<small>(높은 데서 떨어지면 더 아픈 법이다. 아예 기대를 말자)</small>

하지만 다행히도 1번 해결 방법으로 한 방에 해결이 되었다.

```js webpack.client.config.js
// ...
const isLocal = process.env.NODE_ENV === 'local';
// ...
 
module.exports = {
  output: {
    filename: isLocal ? 'client-bundle.[name].js' : 'client-bundle.[chunkhash].js',
  },
}
```
```shell
Built at: 2019-08-06 10:29:34
                                                     Asset       Size       Chunks             Chunk Names
                                      client-bundle.app.js   4.16 MiB          app  [emitted]  app
                                  client-bundle.app.js.map   2.98 MiB          app  [emitted]  app
                                     client-bundle.chat.js    815 KiB         chat  [emitted]  chat
                                 client-bundle.chat.js.map    503 KiB         chat  [emitted]  chat
                                client-bundle.chat~user.js    312 KiB    chat~user  [emitted]  chat~user
                            client-bundle.chat~user.js.map    200 KiB    chat~user  [emitted]  chat~user
                                 client-bundle.polyfill.js   6.24 KiB     polyfill  [emitted]  polyfill
                             client-bundle.polyfill.js.map   6.23 KiB     polyfill  [emitted]  polyfill
                                   client-bundle.search.js    254 KiB       search  [emitted]  search
                               client-bundle.search.js.map    224 KiB       search  [emitted]  search
                              client-bundle.style-guide.js    135 KiB  style-guide  [emitted]  style-guide
                          client-bundle.style-guide.js.map    105 KiB  style-guide  [emitted]  style-guide
                                     client-bundle.user.js    134 KiB         user  [emitted]  user
                                 client-bundle.user.js.map   70.2 KiB         user  [emitted]  user
                                   client-bundle.vendor.js    4.6 MiB       vendor  [emitted]  vendor
                               client-bundle.vendor.js.map   5.25 MiB       vendor  [emitted]  vendor
  fontawesome-webfont.eot?674f50d287a8c48dc19ba404d20fe713    162 KiB               [emitted]
  fontawesome-webfont.ttf?b06871f281fee6b241d60582ae9369b9    162 KiB               [emitted]
fontawesome-webfont.woff2?af7ae505a9eed503f8b8e6982036873e   75.4 KiB               [emitted]
 fontawesome-webfont.woff?fee66e712a8a08eef5805a46892932ad   95.7 KiB               [emitted]
                                                index.html  804 bytes               [emitted]
                                                     sw.js   4.79 KiB               [emitted]
                                                 sw.js.map    4.2 KiB               [emitted]
                              vue-ssr-client-manifest.json    108 KiB               [emitted]
```

파일 이름 패턴에서 `chunkhash`을 삭제하고 `name`을 추가했기 때문에 이제 몇 번을 빌드하든 `client-bundle.app.js`처럼 늘 같은 이름으로 번들이 생성될 것이다. 그리고 위에서 얘기했듯 `memory-fs`는 파일 이름을 맵의 키로 사용하기 때문에 새로운 파일을 맵에 저장할 때 그 파일과 같은 이름을 가진 이전 빌드의 번들은 자동으로 덮어씌워질 것이다.

아래는 해당 작업을 수행한 후 다시 Heap 스냅샷 사용하여 분석해본 `Memory File System` 내 dist 객체의 크기이다.

| 빌드 횟수 | MFS의 메모리 사용량(byte) |
|---------|-----------------|
| 1 | 21,031,408 |
| 2 | 21,023,274 |
| 3 | 21,023,224 |
| 4 | 21,023,310 |

이제 여러 번 빌드를 하더라도 `memory-fs`가 사용하는 메모리가 점점 증가하지 않게 되었고 프론트엔드 챕터 개발자들은 드디어 쾌적한 환경에서 개발을 계속 할 수 있게 되었다!

## 마치며
사실 이 이슈는 처음 이슈를 접했을 때 세운 가설이 딱 맞아들어가서 빠르게 해결할 수 있었던 케이스였다. 하지만 그 가설을 증명하는데는 거의 하루 종일 걸렸는데, 그 이유는 구글 크롬 인스펙터가 Heap 스냅샷을 한번 찍는데 시간이 너무 오래 걸려서이다. 아니 무슨 한번 찍는데 거의 3~4분이 걸려...

막상 원인을 파악하고 가설도 증명하고나니 해결 방법은 굉장히 심플했는데, 뭔가 손 안대고 코 푼 느낌이랄까...? 뭐 어쨌든 쉽게 해결할 수 있어서 다행이었다.

이상으로 Webpack Watch의 메모리 누수 고치기 포스팅을 마친다.


