---
title: 커밋 히스토리를 이쁘게 단장하자
tags:
  - Git
  - Commit
  - Merge
  - Merge and squash
  - Rebase
categories:
  - Programming
  - Git
toc: true
widgets:
  - type: toc
    position: right
  - type: category
    position: right
sidebar:
  right:
    sticky: true
date: 2019-08-30 14:31:29
thumbnail: 2019/08/30/commit-history-merge-strategy/thumbnail.jpg
---


이번 포스팅에서는 Git의 머지 전략 중 대표적인 3가지인 `Merge`, `Squash and merge`, `Rebase and merge`의 차이에 대해서 한번 이야기해보려고 한다. 이 3가지 머지 전략 모두 브랜치를 머지한다는 목적은 같지만, 어떤 방식을 선택하냐에 따라 `커밋 히스토리`가 기록되는 방식이 달라지게 된다.

<!-- more -->

이 3가지 머지 전략은 Github 뿐만 아니라 Atlassian의 Bitbucket에서도 동일하게 지원하고 있는데, 그 만큼 머지를 할 때 커밋 히스토리를 어떤 방식으로 남길 것이냐를 선택할 수 있는 것이 중요하다고 말할 수 있다.

<center>
  {% asset_img github-merge.png 500 %}
  <small>Github에서는 Pull Request를 머지할 때 머지 전략을 선택할 수 있다.</small>
  <br>
  {% asset_img bitbucket-merge.png 500 %}
  <small>Bitbucket에서는 레파지토리 설정에서 기본 머지 전략을 선택할 수도 있다.</small>
  <br>
</center>

Github과 Bitbucket의 머지 전략은 이름은 조금 다르지만 이것들이 의미하는 기능은 모두 같다. Github의 `Create a merge commit`은 Bitbucket의 `Merge commit`과 같은 전략이고 `Squash and merge`는 `Squash`와, `Rebase and merge`는 `Fast forward`와 같은 전략을 의미한다.

물론 이 머지 전략들은 각자 장단점이 있기 때문에 적재적소에 잘 사용하는 것이 중요하다. 예를 들어, Git Flow를 사용할 때는 기능 개발을 하는 `feature` 브랜치가 `develop` 브랜치로 머지될 때는 `Squash and merge`를, `develop` 브랜치가 `master` 브랜치로 머지될 때는 `Merge`을 사용하는 등 유연하게 사용하기도 한다.

하지만 적재적소에 잘 사용하려면 각각의 머지 전략이 어떤 방식으로 브랜치를 머지하는지 잘 알고있어야 가능한 법이다. 그래서 이번 포스팅에서는 이 3가지 머지 방식이 뭐가 어떻게 다른지 살펴보려고 한다.

## 커밋 히스토리가 왜 중요한가요?
일단 머지 전략에 대한 설명에 들어가기에 앞서, Git의 커밋 히스토리가 왜 중요한지에 대해 간단히 이야기해보려고 한다. 서두에서 이야기한 3가지 머지 전략은 브랜치를 머지할 때 커밋 히스토리를 어떻게 남길 것이냐를 선택하는 것이나 마찬가지이기 때문에 `개발자들이 왜 커밋 히스토리에 이렇게 목매는지`에 대한 이해가 필요하다.

모두 알다시피 `커밋(Commit)`은 Git을 구성하는 중요한 요소 중 하나이며, 원칙적으로 하나의 커밋은 `의미있는 하나의 변경사항`을 의미한다.

그 말인 즉슨, 커밋 메세지만 보고도 어떤 사항이 어떤 이유로 변경되었는지 쉽게 파악할 수 있어야한다는 것이다. 많은 개발자들이 의미 있는 커밋 메세지에 대한 중요성을 언급하는 이유도 짧은 커밋 메세지만 보고도 언제, 어떻게 코드가 변경되었는가를 한번에 알고 싶기 때문이다.

이 커밋들이 모여서 시간 순으로 정렬된 것을 `커밋 히스토리(Commit History)`라고 부른다. 히스토리라는 단어에서 알 수 있듯이, 이건 말 그대로 이 프로그램의 역사와 같은 것이다. 많은 개발자들이 커밋 히스토리에 `의미있는 역사`를 기록하는 것이 굉장히 중요하다고 하는 이유에는 여러 가지가 있겠지만 대표적인 두 가지는 다음과 같다.

### 버그가 언제 터졌는지 파악하기가 쉽다
우리가 Git을 사용하여 프로그램의 버전 관리를 할 때 혼자 개발을 진행하는 경우도 있지만 대부분의 경우 다른 여러 명의 개발자들과 함께 협업을 하게 된다. 이때 프로그램의 변경 사항이 많을 수록, 혹은 프로그램의 규모 자체가 큰 경우 협업에 참여하고 있는 개발자들은 사소한 실수로 인해서 버그를 발생시킬 가능성 또한 커지게 된다

이때 개발자들이 커밋 히스토리를 보고 어떤 이유로 어떤 코드가 수정되었는지 빠르게 파악할 수 있다면 해당 버그의 원인을 찾는 것이 더 빨라진다.

예를 들어 새로운 버전을 릴리즈한 후에 결제 관련 버그가 터졌다고 생각해보자. 이때 당연히 개발자들은 결제에 관련된 코드부터 뜯어보기 시작할 것이다. 하지만 대부분의 프로그램은 내부적으로 수많은 모듈 간의 디펜던시가 얽혀있는 경우가 많기 때문에 그걸 짧은 시간안에 전부 파악하고 버그의 원인을 찾아서 수정한다는 것은 쉬운 일이 아니다. 이때 잘 정리된 커밋 히스토리가 있다면 이번 버전에서 결제 관련된 부분을 수정한 커밋을 찾아서 어떤 코드가 수정되었는지 빠르게 확인할 수 있다.

만약 이전 버전에서는 문제가 없었고 이번에 배포한 버전에서 문제가 발생했다면 결제 관련 버그가 발생한 이유는 해당 커밋에서 수정한 코드 때문일 가능성이 높기 때문에 조금 더 빠른 대응이 가능하다.

### 레거시 코드를 수정해야할 때
두번째 이유는 조금 슬픈 상황인데, 바로 레거시 코드를 고쳐야하는데 `코드 짠 사람이 없을 때`이다. 이 사람이 없는 이유는 퇴사라던가, 퇴사라던가, 퇴사같은 경우가 있다.

사실 레거시 코드가 무서운 이유는 코드 자체가 너무 복잡해서 파악하기 힘들다는 것 보다는 이걸 건드렸을 때 다른 부분에 문제가 없을 것이란 보장이 없기 때문이다. 게다가 이런 레거시 코드는 어느 회사에나 다 존재하기 때문에 레거시를 수정해야하는 상황이 그렇게 드문 상황도 아니다.

만약 그 코드가 딱 봐도 책임 분리가 잘 되어 있는 코드거나 간단한 코드라면 뭐 그냥 가벼운 마음으로 수정할 수도 있지만, 대부분 우리가 수정하기 망설여지는 코드는 그냥 레거시가 아니라 `오랜 시간 숙성된 레거시`인 경우가 많다. 특히 이 코드가 회사 창립 초창기에 작성된 코드일 경우에는 그냥 코드만 봐도 당시 개발자가 얼마나 정신없이 개발을 했는지 알 수 있을 정도인 것들도 있다.

<center>
  {% asset_img exit-office.jpg 500 %}
  <small>호랭이는 죽어서 가죽을 남기고 개발자는 죽어서 레거시를 남...</small>
  <br>
</center>

이런 코드의 경우 섣불리 수정했다가 예상 못한 곳에서 도미노처럼 와장창나는 경우가 있기 때문에 이 와장창을 몇번 경험해본 개발자들은 레거시 코드를 수정함에 있어서 신중하게 접근할 수 밖에 없다. 그럼 이 상황에서 우리가 선택할 수 있는 방법은 대략 4가지 정도가 있다.

{% blockquote %}
  1. 건드리기 무서우니까 그냥 냅둔다.
  2. 퇴사자한테 어떻게든 연락해서 물어본다.
  3. 주변에 있는 개발자를 붙잡고 물어본다.
  4. 그냥 내가 분석한다.
{% endblockquote %}

음, 일단 1번의 경우는 본인이 `PO`나 `CTO`를 설득할 말빨이 없다면 성공할 확률이 낮다고 본다. 그리고 아마 좋은 소리를 들을 것 같지도 않다. 일단 개발자로써 월급을 받고 있으니 월급 값은 해야하지 않는가?

그렇다고 이미 퇴사한 사람한테 카톡해서 코드를 작성한 의도를 물어보기에는 왠지 싸대기 맞을 것 같기도 하고 좀 그렇다. 3번 같은 경우는 그나마 나은 경우긴 하지만 다른 팀원들도 다 바쁜데 매번 붙잡고 물어볼 수도 없는 노릇이니 결국 직접 분석하는게 제일 깔끔한 방법이다.

하지만 이 분석이라는 것이 말이 쉽지, 실제로 거대한 어플리케이션에서 단 하나도 놓치지 않고 모든 의존 관계를 파악한다는 것은 사실 쉬운 일이 아니다. 게다가 이런 분석은 단순히 코드만 본다고 되는 것이 아니라 비즈니스와도 밀접한 관련이 있는 경우가 많기 때문에 해당 기능의 개발 당시 비즈니스 히스토리도 어느 정도 함께 파악하는 것이 좋다.

그나마 팀 내에 해당 기능을 개발하게 된 히스토리를 알고 있는 동료가 있다면 다행이지만, 그 마저도 없을 경우 우리가 의지할 것은 당시의 개발자가 어떤 의도로 코드를 고쳤는지 기록해놓은 `커밋 히스토리` 밖에 없는 것이다.

물론 정신없이 개발하는 와중에 커밋 메세지에 당시의 비즈니스적인 의도까지 담는 경우는 거의 없기 때문에 비즈니스 히스토리는 파악하기 힘들 수 있지만, 의미있는 단위로 커밋이 되어있다면 적어도 어떤 의도로 이 코드를 수정했는지 정도는 파악할 수 있다. 말 그대로 역사를 읽는 것이다. 하지만 이때 커밋 히스토리가 너무 쓸데 없이 복잡하거나 커밋 메세지가 개판이라면 아무래도 읽어나가는데 어려움이 있을 수 밖에 없다.

<center>
  {% asset_img bad-commit-message.png 500 %}
  <small>이렇게 커밋해버리면 뭘 고친건지 알 수가 없다.</small>
  <br>
</center>

그래서 개발자들이 `의미 있는 단위의 커밋`, `의미 있는 커밋 메세지`를 강조하는 것이고 여기에 더해 적절한 머지 전략을 사용하여 가독성이 높고 의미도 있는 커밋 히스토리 그래프를 유지하려고 하는 것이다. 필자는 이 중 깔끔한 히스토리 그래프를 만드는 방법에 대해 설명하려고 하는 것이고, 이때 필요한 것이 적절한 브랜치 머지 전략의 선택인 것이다.

## 히스토리를 깔끔하게 만드는 3가지 머지 전략
위에서 한번 설명했듯이 `Merge`, `Squash and merge`, `Rebase`는 두 개의 브랜치를 머지한다는 의미는 모두 같지만 머지하는 방법과 커밋 히스토리의 기록을 다르게 가져가는 머지 전략들이다. 한번 이 3가지 전략이 어떤 방식으로 브랜치를 머지하는 지, 커밋 히스토리는 어떻게 기록되는지 살펴보고 이에 따른 장단점을 알아보도록 하자.

### Create a merge commit

<center>
  {% asset_img merge-icon.jpg 300 %}
  <br>
</center>

`머지(Merge)`는 우리가 알고 있는 일반적인 머지 전략이다. 머지의 장점은 기존 개발자들에게 익숙한 개념이라는 것과 머지된 브랜치가 삭제되어 사라졌다고 해도 히스토리 그래프 상에서는 그대로 다른 가지로 표기되기 때문에 `어떤 브랜치에서 어떤 커밋이 진행되어 어떻게 머지가 되었군`이라는 자세한 정보를 얻을 수 있다는 것이다.

<center>
  {% asset_img merge-commit-1.png 350 %}
  <small>`first-merge` 브랜치가 `master`로 머지된 히스토리</small>
  <br>
</center>

<center>
  {% asset_img merge-commit-2.png 350 %}
  <small>추후 `first-merge` 브랜치를 삭제하더라도 히스토리와 브랜치 가지는 그대로 남아있다</small>
  <br>
</center>

반면에 단점은 너무 자세하게 히스토리가 남기 때문에 브랜치의 개수가 많아지거나 머지 횟수가 잦아질수록 히스토리 그래프의 가독성이 떨어진다는 것이다.

또한 원칙적으로 커밋은 의미있는 변경 사항의 최소 단위라고는 하지만 사실 실무에서 일을 하다보면 `오타 수정`과 같은 자잘한 커밋을 하는 경우도 많다. 사실 이런 자잘한 커밋의 경우 별로 정보성이 없기 때문에 이런 커밋들이 많아지면 오히려 히스토리의 가독성을 저해하는 원인이 된다.

<center>
  {% asset_img merge-commit-3.png 500 %}
  <small>규모가 큰 어플리케이션일수록 이런 복잡한 히스토리가 그려지기 쉽다</small>
  <br>
</center>

위 그림에서 볼 수 있듯이 머지가 수행되었을 때 생기는 `머지 커밋(Merge commit)`은 `어느 순간에 어떤 브랜치의 변경사항이 머지되었다`라는 소중한 정보를 주는 커밋이지만 개발이 진행되고 있는 브랜치가 많아진 상황에서는 이 머지 커밋들과 해당 브랜치에서 발생한 커밋들이 전부 기록되기 때문에 그래프가 너무 복잡해져서 오히려 히스토리를 추적하기 힘들 수도 있다.

위 예시의 그래프는 조금 오래된 히스토리라 헤드가 앞으로 나아가면서 해당 시점의 `master` 브랜치가 최신 버전인 상황이기 때문에 반드시 맨 아래 쪽에 `master` 브랜치가 위치한다.

그 덕분에 `master` 브랜치를 기준으로 읽어나간다면 어느 정도 흐름을 읽을 수 있지만, 한창 개발이 진행되는 중이라 `master`의 헤드가 뒤로 밀리기도 하는 상황이면 그래프의 맨 아래 쪽에 `master` 브랜치가 위치하지 않고 중간 어딘가 쯤에 끼어있기도 하기 때문에 히스토리 그래프를 읽으면서 추적하다가 놓칠 때도 있다.<small>(해보신 분은 알겠지만 진짜 눈알 빠질 것 같다)</small>

### Squash and merge

<center>
  {% asset_img merge-squash-icon.jpg 300 %}
  <br>
</center>

`Squash and merge`에서 Squash는 여러 개의 커밋을 하나로 합치는 기능을 말한다. 즉, 이 기능은 머지할 브랜치의 커밋을 전부 하나의 커밋으로 합친 뒤 타겟 브랜치에 커밋하는 방식으로 머지를 진행한다. 즉 `Squash and merge`에서 발생하는 머지 커밋은 실질적인 머지로 인해서 생성된 머지 커밋이라기보다는 그냥 다른 브랜치의 변경 사항을 하나로 뭉쳐놓은 커밋인 것이다.

그래도 Squash and merge 전략은 일단 머지 커밋이 남긴 하기 때문에 머지가 되었다는 사실을 히스토리 상에서 한번에 알아볼 수 있고 버전 별로 어떤 것이 변경 되었는지 한 눈에 알수 있다는 것이 장점이다. 또한 머지된 브랜치의 자잘한 커밋 사항이 남지 않기 때문에 `머지가 되었다`라는 사실 자체에만 집중한 기록이 남게되고, 그로 인해 이 프로그램의 변경 사항을 읽기가 한결 수월해진다.

단점은 일반적인 머지 커밋보다는 아무래도 정보력이 떨어진다는 것이다. 일반 머지는 해당 브랜치에서 누가 어떤 커밋을 통해 어떤 라인을 수정 했는지 까지 알려주지만 Squash and merge 전략은 머지 대상 브랜치의 모든 커밋을 하나로 통합해버리기 때문에 그 정도의 자세한 정보는 알 수가 없다.

<center>
  {% asset_img squash-1.png 500 %}
  <small>머지하기 전 히스토리 그래프</small>
  <br>
</center>

지금 상황은 `update-a-txt` 브랜치의 헤드가 `master`의 헤드보다 하나 더 앞으로 나아간 상황이다. `update-a-txt` 브랜치의 가지를 보면 `update a txt`, `Add b txt` 총 2개의 커밋이 있고 최근에 `master`에서 최신 변경 사항을 받아왔다. 이때 Squash and merge 전략을 사용하여 `master`에 머지를 하게 되면 이 브랜치에 있는 모든 커밋은 하나의 커밋으로 합쳐져서 마스터에 커밋된다.

<center>
  {% asset_img squash-2.png 500 %}
  <small>Squash and merge를 사용하여 `update-a-txt` 브랜치를 `master`에 머지한 모습</small>
  <br>
</center>

위 그림에서 볼 수 있듯이 일반적인 머지와는 다르게 `update-a-txt` 브랜치의 가지가 `master`로 들어가는 형태가 아니라 `master` 브랜치에 `update a txt(#1)`이라는 새로운 커밋이 하나 추가된 것을 볼 수 있다. 이때 `master`에 추가된 커밋은 `update-a-txt` 브랜치의 모든 커밋, 즉 변경 사항을 하나로 합친 커밋이다.

<center>
  {% asset_img squash-3.png 500 %}
  <br>
</center>

이후 쓸모 없어진 `update-a-txt` 브랜치를 삭제하면 `master`에는 Squash된 커밋이 남지만 `update-a-txt` 브랜치에서 커밋되었던 자세한 내용을 볼 수는 없다. 즉, Squash and merge을 사용하여 브랜치를 머지하게 되면 `머지된 사실` 자체는 알 수 있으나 `어떤 상황에서 어떤 코드를 변경 했는지`까지는 알 수가 없다.

### Rebase and merge

<center>
  {% asset_img rebase-icon.jpg 300 %}
  <br>
</center>

`Rebase and merge` 전략은 Git의 `리베이스(Rebase)` 기능을 사용하여 브랜치를 머지하는 것이다. 이때 리베이스는 말 그대로 브랜치 히스토리들의 베이스를 변경하는 기능이다. 베이스를 변경한다는 의미를 좀 더 쉽게 말하자면 `a` 브랜치의 변경 사항이 마치 `b` 브랜치에서 변경된 것처럼 바꿀 수 있다는 것이다.

리베이스는 머지된 브랜치의 커밋을 모두 살려놓기 때문에 누가 언제, 어떤 부분을 수정했다는 정보는 전부 알 수 있지만 해당 브랜치가 어느 시점에 머지되었는지는 알 수 없다. 그래서 리베이스를 사용하는 경우 다른 방법보다 더 태깅에 신경써줘야한다.

<center>
  {% asset_img rebase-1.png 500 %}
  <br>
</center>

위 그래프는 `rebase-test-1` 브랜치에서 총 4번의 커밋을 진행하고 이제 `master` 브랜치로 머지해야하는 상황이다. 이때 리베이스를 사용하여 브랜치를 머지하게 되면 `rebase-test-1` 브랜치에서 발생한 모든 변경 사항이 마치 `master`에서 직접 커밋한 것 처럼 변경할 수 있다.

<center>
  {% asset_img rebase-2.png 500 %}
  <br>
</center>

쨘, 리베이스를 진행하고 난 이후의 상황이다. `rebase-test-1` 브랜치의 모든 커밋들이 `master` 브랜치로 그대로 옮겨진 것을 볼 수 있다. 이제 쓸모 없어진 `rebase-test-1` 브랜치를 삭제하게 되면 처음부터 `master`에서 개발을 진행한 것과 같은 깔끔한 히스토리 그래프를 얻을 수 있다.

<center>
  {% asset_img rebase-3.png 500 %}
  <br>
</center>

위 그림에서 볼 수 있듯이 리베이스를 사용하여 브랜치를 머지하게되면 `머지 커밋`이 생성되지 않기 때문에 어느 시점에 어떤 브랜치가 머지된 것인지 알 수가 없다. 그래서 위에서 말했듯이 필자는 `tag` 기능을 사용하여 해당 브랜치가 머지된 시점에 태그를 달아주는 것을 추천한다.<small>(시멘틱 버저닝을 합시다)</small>

그리고 리베이스의 치명적인 단점 중 하나는 바로 `머지 충돌(Merge Conflict)`이 발생했을 경우다. 이건 머지할 브랜치의 히스토리 자체를 그대로 복사해서 대상 브랜치의 히스토리에 박아버리는 방법이기 때문에 충돌이 발생하게 되면 `Merge commit`이나 `Squash and merge`처럼 충돌이 한번 발생하는 것이 아니라 각각의 커밋에 하나씩 충돌이 발생한다. 이게 머지할 브랜치의 커밋이 몇개 안되는 상황에서는 할만할지 몰라도 커밋이 몇 백개씩 되는 큰 기능의 브랜치를 리베이스로 머지했다가 충돌이 나면 그냥 죽었다 생각하고 커피를 타오도록 하자.

## 마치며
사실 커밋 히스토리를 잘 남기는 것은 미래의 나 자신을 위한 것일수도 있지만, 그보다는 내가 작성하는 코드를 언젠가 고쳐야할 누군가를 위해 신경써야 하는 것이 더 크기는 하다.

쭉 읽어보면 알겠지만 이 3가지 머지 전략은 각각 장단점이 명확하기 때문에 머지 전략 간의 우위는 없다. 그냥 상황에 따라서, 혹은 팀의 전략에 따라서 알맞은 머지 전략을 선택하면 된다는 것이다. 혹자는 `Squash and merge`나 `Rebase`와 같은 기능이 필요없고 그냥 일반적인 머지만으로도 충분히 버전 관리가 가능하다고 말하기도 한다.

그래도 이 3가지 머지 전략이 어떤 원리로 브랜치를 병합하는지 제대로 파악하고 히스토리가 어떻게 기록되는지 알고 있다면 복잡한 협업을 통해 개발이 진행되는 상황에서도 가독성 높은 히스토리 그래프를 만들어 낼 수 있고, 깔끔한 히스토리가 가져다주는 장점들은 분명히 있기 때문에, 아직 일반적인 머지만을 사용하여 히스토리를 관리하고 있었다면 한번 여러가지 전략을 사용해보는 것을 추천한다.

이상으로 커밋 히스토리를 이쁘게 단장하자 포스팅을 마친다.

