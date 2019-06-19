---
title: AWS와 함께 간단하게 HTTP/2 적용하기
date: 2019-06-13 21:44:00
tags:
  - Aamazon Web Service
  - HTTP
  - HTTP/2
  - Web
  - Network
categories:
  - AWS
thumbnail: /2019/06/13/http2-with-aws/aws.png
toc: true
---

## 들어가며
이번 포스팅에서는 AWS(Amazon Web Service) 환경에서 HTTP/2 프로토콜을 적용하는 방법에 대해서 설명하려고 한다. AWS의 `Cloud Front`와 `Application Load Balancer`는 자체적으로 HTTP/2 프로토콜을 사용할 수 있는 기능들을 제공해주고 있기 때문에 별도의 작업 없이 간단하게 HTTP/2 프로토콜을 적용할 수 있다.

<!-- more -->

## HTTP/2란?
`HTTP/1`은 이미 세상에 나온지 30년이 다 되어가는 프로토콜로, 웹 어플리케이션을 위한 프로토콜이라기 보다는 문서를 위한 프로토콜로 설계되었기 때문에 모던 웹 어플리케이션과 같이 무거운 페이로드, 빈번한 통신 등의 환경에서는 여러 가지 비효율적인 점이 많다.

그래서 `HTTP/2`는 현대적인 통신을 지원하기 위해 다음과 같은 목표를 가지고 고안되었다.

***
- 전체 요청, 응답 다중화를 통한 지연 시간 단축
- 비대한 HTTP 헤더 필드의 효율적인 압축을 통해 프로토콜 오버헤드를 최소화
- 요청 우선 순위 지정
- 서버 푸시 지원
***

HTTP/2는 기존 HTTP/1 프로토콜을 사용하고 있는 어플리케이션을 수정하지 않고도 모든 핵심 개념(메소드, 상태 코드, URI 및 헤더 필드)을 공유하도록 설계되었다. 대신 HTTP/2는 클라이언트와 서버 간 데이터 프레임과 전송 방식을 수정하는 방식으로 통신 효율을 높였다.

또한 클라이언트와 서버 간 통신에서 가장 효과가 큰 것은 `응답 다중화`가 정식으로 지원된다는 것이다. 이 말은 하나의 연결만 으로 여러 리소스를 주고 받을 수 있다는 뜻이다.

{% asset_img 'multiplexing.gif' 'HTTP2 Multiplexing' %}
<center><sub>[출처] csstrick.com<sub></center>

HTTP/1에서는 프로토콜 차원의 응답 다중화가 지원되지않았고 응답의 병렬 처리는 브라우저가 책임을 가졌다. 그렇기 때문에 브라우저의 정책에 따라 요청의 병렬처리가 가능한 개수가 달랐다.

***
- Internet Explorer: 출처 별 10개~11개
- Chrome: 출처 별 6개
- Firefox: 출처 별 6개
- Opera: 출처 별 6개
***

그렇기 때문에 프론트엔드 개발자들은 어플리케이션 초기화 시 최대한 리소스 요청을 줄이기 위해 모든 JavaScript와 CSS 파일을 하나의 번들로 묶어 `index.js`나 `style.css`와 같은 파일로 만들고 `Minify`나 `Uglify` 등의 기법을 사용하여 용량을 최대한 줄이기도 하고, 여러 개의 이미지를 요청하지 않기 위해 하나의 커다란 이미지를 다운로드받아 마스킹해서 사용하는 스프라이트 방식과 같은 방식을 사용했다.

하지만 HTTP/2는 `출처 별로 최대 128개`의 병렬 요청을 처리할 수 있으므로, 이제 우리는 하나의 큰 파일이 아닌 작은 여러 개의 파일로 나눠서 동시에 요청하고 받아올 수 있는 등의 HTTP/1.1에서는 하지 못했던 성능 개선의 여지를 만들 수 있게되었다.

## AWS Cloud Front에서 HTTP/2 사용하기
AWS는 2016년 9월부터 Cloud Front에서 HTTP/2를 지원해주기 시작했다. 간단한 세팅 만으로 HTTP/1.1에서 HTTP/2로 변경할 수 있다. 또한 HTTP/2를 지원하지않는 하위 버전의 브라우저에서 요청을 받는다면 HTTP/1.1으로 프로토콜을 변경하여 응답하는 기능 또한 가지고 있다.

[AWS CloudFront HTTP/2 세팅 메뉴얼](https://aws.amazon.com/blogs/aws/new-http2-support-for-cloudfront/)에서 HTTP/2를 세팅할 수 있는 방법을 자세히 설명해주고 있기 때문에 프로토콜을 변경하는 과정은 전혀 어려움이 없었다.

### CloudFront Distributions 변경하기
먼저 Cloud Front 대시보드로 이동하면 현재 등록되어있는 배포판들의 목록이 보인다. 이 중 HTTP/2 프로토콜을 적용하고 싶은 배포판을 선택한 후 상단의 `Distribution Settings`을 선택한다.

{% asset_img 'cloudfront1.png' 'Distribution Settings' %}

`Distribution Settings`을 클릭해서 배포판 설정 화면으로 들어가면 현재 배포판에 대한 여러 가지 정보가 있는 화면이 나온다. 이 정보들 중 이 배포판이 지원하고 있는 프로토콜에 대한 정보도 함께 담겨있다.

{% asset_img 'cloudfront2.png' 'Distribution Settings' %}

이제 상단의 `Edit` 버튼을 눌러 배포판의 설정을 변경하도록 하자. 밑으로 쭉 내리다보면 `Supported HTTP Versions`라는 항목이 있다.

{% asset_img 'cloudfront3.png' 'Supported HTTP Versions' %}

이미 저 스샷이 모든 걸 설명해주고 있기 때문에 마무리는 스킵하겠다.

{% asset_img 'skip.jpg' '생략' %}

## Elastic Beanstalk에서 HTTP/2 사용하기
Elastic Beanstalk은 Web 서버나 Worker와 같이 친숙한 웹 어플리케이션이나 서비스를 간편하게 배포하거나 컨트롤할 수 있는 서비스이다. Elastic Beanstalk에서 환경을 생성할 때 사용할 언어나 서버 엔진등을 설정해놓으면 해당 설정을 사용하여 다른 환경으로 복사할 수도 있고 Auto Scaling이나 Load Balancing과 같은 귀찮은 설정이 필요한 작업들도 간단한 몇개의 설정만 건드려주면 알아서 다 해주기 때문에 꿀이 따로 없다.

또한 프로젝트의 루트에 `.ebextensions` 디렉토리를 생성하고 내부에 쉘 스크립트 파일을 넣어놓으면 파일 정렬 순서에 따라서 배포할 때마다 해당 스크립트들을 실행시킬 수도 있어서 굉장히 유연하다.<small><strike>(node-sass가 말썽부려서 rebuild 해야할 때 아주 유용하다)</strike></small>

환경을 생성할 때 `Classic Load Balancer`와 `Application Load Balancer` 중 하나의 로드 밸런서를 선택할 수 있는데 Classic Load Balancer는 기존의 ELB를 의미한다. Elastic Beanstalk에서 HTTP/2를 사용하고 싶다면 `Application Load Balancer`를 선택하도록 하자. 물론 ELB를 고르고 직접 세팅하는 방법도 있지만 필자는 굳이 어려운 길을 선택하지 않았다.

### Application Load Balancer란?
AWS는 지난 2016년에 L7(Application) 계층에서 작동하는 [Application Load Balancer(ALB)](https://aws.amazon.com/ko/blogs/korea/new-aws-application-load-balancer/)를 공개하였다. 기존에 사용되던 로드밸런서인 Elastic Load Balancer(ELB)는 L4(Network) 계층에서 동작하기 떄문에 HTTP나 HTTPS와 같은 Application Layer에서 사용되는 프로토콜을 인지하지도 못하고 이에 따라서 유연하게 처리하지도 못했지만 ALB는 Application 계층에서 작동하기 때문에 직접 HTTP 헤더를 까보고 이에 따른 유연한 부하 분산이 가능한 것이 장점이다.
예를 들면 동일한 호스트로 요청을 보내더라도 `/a` 경로로 요청을 보내면 a 서버로 보내고 `/b` 경로로 요청을 보내면 b 서버로 보내는 등의 유연한 라우팅이 가능하게 된다는 것이다.

하지만 무엇보다 좋은 점은 위에서 설명했듯이 `HTTP/2` 프로토콜과 `WebSocket`을 자체적으로 지원한다는 것이다. 만약 기존에 ELB, 즉 Classic Load Balancer를 사용하고 있던 환경에서 HTTP/2 프로토콜을 사용하고 싶다면 직접 세팅하거나 ALB로 마이그레이션 해야한다.
하지만 로드 밸런서를 마이그레이션해도 기존 ELB에 연결되어있던 인스턴스들과 자동으로 연결해주지는 않기 때문에 Elastic Beanstalk을 사용하고 있다면 그냥 환경을 다시 만드는 게 정신건강에 이롭다.<small><strike>(처음에 쉽게 가보려다가 안되서 실망한 1인)</strike></small>

### 설정하기
먼저 Elastic Beanstalk 환경에 접속하여 새로운 환경을 생성하자.

{% asset_img 'eb1.png' 'Elastic Beanstalk 환경 생성' %}

이후 `Web server environment`를 선택하면 환경 이름이나 사용할 언어등 간단한 세팅을 할 수 있는 화면으로 이동한다.

{% asset_img 'eb2.png' 'Elastic Beanstalk Platform 설정' %}

Elastic Beanstalk에서는 다양한 언어를 제공해주고 있으니 입맛대로 골라담아보자. 이렇게 기본적인 세팅을 하고서 하단의 `Configure more options`를 클릭하면 좀 더 디테일한 설정을 할 수 있는 화면으로 이동할 수 있다.

{% asset_img 'eb3.png' 'Configure more option' %}

만약 손이 미끄러져서 `Create environment`를 클릭하면 환경이 생성되는 동안 10분 정도는 그냥 날리게 되므로 눈 크게 뜨고 클릭하도록 하자. 제대로 클릭했다면 디테일 설정화면으로 이동하게 되는데 상단의 `Configuration presets`를 확인해보면 아마 기본 값으로 `Low cost`가 선택되어 있을 것이다. 이 옵션에서는 로드 밸런서를 사용할 수 없으므로 우리는 `Custom configuration`을 선택해야한다.

{% asset_img 'eb4.png' 'Configuration presets' %}

`Custom configuration` 옵션을 선택하면 하단의 Load balancer 카드에 `Modify` 버튼이 활성화 되었을 것이다. 해당 버튼을 클릭하면 이제 드디어 로드 밸런서를 선택할 수 있는 화면이 나타난다.

{% asset_img 'eb5.png' '로드 밸런서 선택화면' %}

3개 다 맛있어보이지만 한번에 하나만 먹을 수 있으므로 욕심 부리지말고 `Application Load Balancer`를 선택하자. 그리고 밑으로 스크롤을 조금만 내려보면 로드 밸런서 설정 메뉴들이 보인다. 우리는 이 중 `Listener`를 생성해주어야한다. ALB의 리스너는 구성한 프로토콜이나 포트를 사용한 요청을 확인하는 프로세스라고 보면 된다. 기본 설정에는 `HTTP 프로토콜을 사용하여 80포트`로 들어오는 요청에 대한 리스너만 있기 때문에 우리는 `HTTPS 프로토콜을 사용하여 443포트`로 들어오는 요청에 대한 리스너를 만들어주면 된다.

{% asset_img 'eb6.png' '로드 밸런서 선택화면' %}

리스너를 생성했다면 하단의 `Save` 버튼을 눌러 로드 밸런서 설정을 저장하고 나머지 설정도 입맛대로 설정한 후 `Create environment`를 클릭하면 드디어 환경이 올라가기 시작한다. 참고로 좀 오래 걸린다.

### 서버에 별도 설정을 안했는데?
따로 안해도 된다. ALB에 HTTPS 리스너를 가지고 있다면 이 리스너가 알아서 해준다. 만약 브라우저가 HTTP/2를 지원하는 브라우저라면 리스너도 HTTP/2로 응답할 것이고 만약 HTTP/1.1만 지원하는 브라우저<small><strike>인터넷익스플로러</strike></small>라면 리스너도 HTTP/1.1 프로토콜로 응답할 것이다.

그리고 HTTPS 리스너가 HTTP/2 요청을 받더라도 로드 밸런서에 연결된 인스턴스들과는 각각의 HTTP/1.1 프로토콜로 통신하기 때문에 서버에서는 그냥 평소대로 HTTP/1.1에 대한 처리만 하면 된다.

자세한 내용은 [Elastic Load Balancing 사용 설명서의 HTTP Connections](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html#http-connections)을 읽어보도록 하자.


## HTTP/2 잘 적용 됐니?
환경을 생성했다면 이제 끝이다. 가장 간단하게 테스트해볼 수 있는 방법은 역시 `curl`을 사용하는 것이다. 여러분이 생성한 환경에 요청을 해봐도 되고 아니면 그냥 아무데나 찔러보자. 생각보다 많은 서비스들이 HTTP/2를 사용하고 있다.

```shellscript
$ curl --http2 -I https://www.naver.com/

HTTP/2 200
server: NWS
date: Thu, 13 Jun 2019 14:59:09 GMT
content-type: text/html; charset=UTF-8
cache-control: no-cache, no-store, must-revalidate
pragma: no-cache
```

크롬 브라우저를 사용한다면 [HTTP/2 and SPDY indicator 크롬익스텐션](https://chrome.google.com/webstore/detail/http2-and-spdy-indicator/mpbpobfflnpcgagjijhmgnchggcjblin?utm_source=chrome-ntp-icon)을 설치하는 방법도 있다.

{% asset_img 'http2-plugin.png' 'HTTP/2 and SPDY indicator' %}

이런 귀여운 아이콘이 `HTTP/2`나 `SPDY` 프로토콜 사용 여부를 알려줄 것이다. 근데 SPDY는 아직까지 구글말고는 쓰는 곳을 본 적이 없는듯...?

또는 크롬 브라우저의 개발자 도구 `Network` 탭에서 테이블 헤드에 마우스 우클릭을 하면 `Protocol` 컬럼을 활성화 시킬 수도 있다.

{% asset_img 'network.png' '네트워크 탭의 Protocol 컬럼 활성화' %}

그러면 네트워크 탭에서 HTTP/2 프로토콜로 통신하여 받아온 리소스는 `h2`라고 표시가 된다.

{% asset_img 'http2-check.png' '네트워크 탭의 Protocol 컬럼 모습' %}

## Waterfall로 비교해보자
왼쪽이 `HTTP/1.1`, 오른쪽이 `HTTP/2`이다. HTTP/2 쪽의 붉은 라인은 이미지 요청 에러인데, 스테이징 환경에서 리소스 출처 문제로 인해 발생하는 403에러이기 때문에 무시해도된다.

{% img inline '/2019/06/13/http2-with-aws/result-http1.png' 200 %}
{% img inline '/2019/06/13/http2-with-aws/result-http2.png' 200 %}
<style>.inline { display: inline !important; vertical-align: top; }</style>

HTTP/2 쪽의 Waterfall은 상당히 많은 수의 요청이 동시에 처리되고 있는 것을 확인할 수 있다. HTTP/2의 이런 특징을 이용하면 기존에 하나로 번들링하고 있던 JavaScript 파일을 여러 개로 Chunking하여 파일 용량을 줄이거나, 기존에 스프라이트로 사용하던 이미지도 개별 요청을 통해 동시에 받아옴으로써 로딩 속도를 조금 더 단축시킬 수도 있다.

이상으로 AWS와 함께 간단하게 HTTP/2 적용하기 포스팅을 마친다.
