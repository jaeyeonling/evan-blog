---
title: 클라이언트 사이드 렌더링 최적화 
date: 2019-06-03 17:22:26
tags:
    - SEO
    - 렌더 최적화
    - Render Optimizing
categories:
    - Web
    - JavaScript
---

### 들어가며
이번 포스팅에서는 필자의 현직장에서 진행했던 클라이언트 사이드 렌더링 최적화에 대해서 적어보려고 한다. 크롬 브라우저의 Audits 탭에서 현재 페이지의 퍼포먼스나 SEO 점수와 같은 지표를 확인해볼 수 있다. 이 지표는 Google Chrome 팀에서 제공하는  Lighthouse라는 툴을 사용하여 측정된다. 또한 측정된 지표를 JSON 포맷으로 Export하여 저장하고 Lighthouse의 Report Viewer 페이지에서 다시 확인해볼수도 있다. 아래 링크들을 살펴보면 Lighthouse에 대해서 더 잘 알 수 있을 것이다.

***
[Lighthouse Github 레파지토리](https://github.com/GoogleChrome/lighthouse)
[Google Devloper의 Lighthouse 문서](https://developers.google.com/web/tools/lighthouse/?hl=ko)
[Lighthouse Report Viewer](https://googlechrome.github.io/lighthouse/viewer/)
***

### 최적화를 진행하게 된 이유?
필자는 회사에서 [**숨고**](https://soomgo.com)라는 서비스를 개발하고 있다. 숨고에서는 애자일 프로세스를 사용한 스크럼을 1주 단위로 돌리고 있는데, 마침 이번 주에 다른 이슈에 의해 필자가 진행할 이슈가 병목에 걸려버려서 시간이 붕 떴다. 그래서 뭘 할까 찾아보다가 오랜만에 Audits를 한번 돌렸는데

이 중 SEO를 가장 중요하게 생각하는 페이지 중 하나인 [고수 찾기](https://soomgo.com/search/pro)라는 페이지에 대해서 최적화를 진행하게 되었다. 사실 이번 작업 이전에도 동료들과 함께 여러 차례에 걸쳐 최적화 작업을 진행해왔기 때문에 페이지 자체의 로딩 속도는 나쁜 편은 아니다. 그러나 이전의 최적화는 클라이언트보다는 렌더 서버에 초점을 맞춰서 진행해왔기 때문에 클라이언트 렌더링의 병목 지점을 확인한 것은 사실 이번이 처음이다.

<center>
    {% asset_img 'result_before.png' 'result_before' %}
    <sub>숨고의 고수 찾기 페이지를 분석한 결과</sub>
</center>

