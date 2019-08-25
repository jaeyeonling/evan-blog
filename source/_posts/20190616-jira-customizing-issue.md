---
title: JIRA 프로젝트 이슈 커스터마이징하기
date: 2019-06-16 22:50:00
tags:
  - Jira
  - 애자일
  - Agile
  - 협업
  - Atlassian
categories:
  - Soft Skills
  - Agile
thumbnail: /2019/06/16/jira-customizing-issue/jira-logo.png
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

이번 포스팅에서는 Atlassian의 대표 제품 중 하나인 `Jira`에 대해서 포스팅 하려고 한다. 요즘 많은 IT회사들에서 `애자일 개발 방법론`을 사용하여 소프트웨어 개발을 진행하고 있다. Jira는 애자일 방법론에서 사용하는 다양한 방법들을 좀 더 쉽고 편하게 사용할 수 있게 도와준다.
<!-- more -->

사실 애자일 프로세스는 일종의 방법론일 뿐 어떤 원칙이 아니기 때문에 팀마다 그 구성이나 개발 과정이 조금씩 달라지게 될 수 밖에 없고, 또 회고를 통해 이런 저런 방법들을 계속 시도해보기 때문에 어떠한 규칙으로 똑부러지게 정해지는 게 아니다. Jira는 이렇게 매번 달라지는 규칙들에 대응하기 위해서 다양하게 프로젝트를 커스터마이징 할 수 있는 기능을 제공한다.

그러나 기능이 너무 많고 용어가 복잡해서 처음 접하는 사람은 이걸 도대체 어떻게 써야할지 감이 안오는 것도 사실이다. 아마 많은 분들이 그냥 기본적으로 제공해주는 칸반이나 스프린트 기능 정도만 사용하고 있지 않을까 싶다.

그래서 오늘은 Jira를 사용할 때 제일 기본적인 단위를 이루는 `Issue`를 커스터마이징하는 방법을 설명해볼까 한다.

## Jira Software란?
Jira는 호주의 Atlassian이라는 기업에서 제공하는 `애자일 소프트웨어 개발 방법론`을 지원하는 일종의 프로젝트 관리 솔루션이다. 간단하게는 칸반보드부터 깊게는 애자일 프로세스에 필요한 스프린트 단위의 관리 기법이나 스프린트를 분석할 수 있는 다양한 보고서까지도 제공해주고 있다.

이런 점이 바로 `Trello`나 `Asana`와 같은 다른 프로젝트 관리 툴과 차별화되는 점인 것 같다.<small>(참고로 Trello도 Atlassian이 먹은 지 좀 됐다)</small>

또한 Atlassian에서 제공하는 다른 서비스들인 `Bitbucket`, `Confluence`, `Source Tree` 등과 서로 연동이 잘되어있는 부분도 좋은 것 같다. 예를 들면 어떤 브랜치에서 기능을 개발하다가 해당 브랜치로 `Pull Request`를 생성하면 Jira에 연결된 이슈가 자동으로 `Code Review` 상태로 변경되게도 할 수 있고 커밋 메세지에 `LU-0000 first commit` 처럼 Jira 이슈 번호를 넣어준다면 Jira 이슈 내에 해당 커밋과 브랜치가 자동으로 추적되기도 한다.

<center>
  {% asset_img 'jira-branch.png' 'Jira 브랜치 추적' %}
  <sub>이슈에서 추적되고 있는 브랜치와 커밋의 모습</sub>
  <br>
</center>

저런 공유 기능으로 인해서 제일 좋은 점은 사실 `PO(Product Owner)`들의 업무가 많이 편해진다는 것이다. Jira의 스프린트 대시보드는 일종의 상황판이다. 누가 어떤 업무를 어느 정도 진행했는지 브랜치와 커밋을 통해 상세히 알아볼 수도 있고 또 전체 스프린트의 이슈의 몇 퍼센트가 Done 상태인지, 팀이 얼마나 더 빡쎄게 달려야 이 스프린트를 마칠 수 있는지와 같은 정보를 실시간으로 보여준다.

뭐 사실 이러지 저러니 해도 Jira는 툴일 뿐, 애자일에는 `일을 효율적으로 하고 싶다`라는 팀의 의지가 가장 중요하긴 하지만 그래도 Jira가 굉장히 세심한 기능들을 제공해준다는 건 사실이다.

## Jira 이슈 커스터마이징 하기
> 이 문서에 작성되는 사항들은 프로젝트의 Administrator 권한이 있는 사용자만 수행할 수 있습니다.

### Jira 세팅 메뉴 찾기
Jira 메인 화면에 접속하였을 때 Jira 프로젝트 설정에 대해 수정 권한이 있는 사용자라면 왼쪽 메뉴 리스트의 제일 하단에 `Jira settings`라는 메뉴가 보일 것이다. 이 메뉴에 접속하면 `시스템`, `프로젝트`, `이슈` 등 Jira에 대한 모든 설정을 수정할 수 있다. 

<center>
  {% asset_img 'jira1.png' 'Jira 세팅 메뉴' %}
  <br>
</center>


`Jira settings` 메뉴를 클릭하여 세팅 메뉴가 노출되면 `System`, `Products`, `Projects`, `Issues`, `Apps` 총 5개의 메뉴가 보인다. 이 포스팅에서는 이 설정들 중에서 `Issues`에 대한 설정만을 다룰 것이다.

### Issues 메뉴

<center>
  {% asset_img 'menu.png' 500 'Jira 이슈 메뉴들' %}
  <br>
</center>

Jira settings 내의 Issues 메뉴를 클릭해보면 이슈에 관련된 수많은 메뉴들이 노출된다. 하나하나 알아보자.

#### Issue Types
***
##### Issue Types

<center>
  {% asset_img 'issue-types.png' 'Jira 이슈 타입' %}
  <br>
</center>

이슈 타입은 `Story`, `Bug`, `Task`와 같이 Jira 내에서 사용할 수 있는 이슈의 타입을 의미한다.
이런 이슈 타입들은 크게 `Standard` 타입과 `Sub-Task` 타입으로 나누어진다.

| 이슈 타입 | 설명 |
|:----------:|------|
| **Standard** | 부모 이슈로써 자식 이슈를 가질 수 있는 이슈 |
| **Sub-Task** | 부모 이슈의 자식 이슈로만 존재할 수 있는 이슈. 단독으로는 존재 불가능 |

현재 직장의 애자일 팀에서는 `Bug`, `Epic`, `Research`, `Story`, `Sustain`, `Task`, `Sub-task`로 총 7개의 이슈 타입을 사용 중이다. 각 이슈 타입의 의미에 대해서는 이슈 타입 밑에 적혀져 있는 설명을 읽어보자. 

<center>
  {% asset_img 'jira2.png' 'Jira 이슈 타입 리스트' %}
  <br>
</center>

슬프게도 영어로 되어있지만 그냥저냥 읽을 수 있는 수준이다. 다른 사람들도 이렇게 영어로 설명을 읽어야하는 고통을 경험하게 만들고 싶지 않다면 우리가 희생해서 전부 한글로 번역해두면 된다.
이슈 타입들은 맨 마지막 컬럼인 `Actions` 컬럼의 메뉴를 통해 수정 및 삭제할 수 있다.

- Edit: 이슈 타입의 이름, 설명, 아이콘 등을 `수정`
- Translate: 이슈 타입 이름과 설명의 `번역 내용을 설정`
- Delete: 되도록이면 쓰지말자. 쳐다도 보지 말자.

##### Issue Type Schemes
이슈 타입 스키마는 `이슈 타입들을 묶어놓은 일종의 그룹`이다. 각 프로젝트에 이슈 타입을 적용할 때 이슈 타입을 각각 할당하는 것이 아닌 이슈 타입 스키마를 할당하게 된다. 또한 이슈 타입 스키마 설정 페이지의 Projects 컬럼에는 해당 스키마가 어떤 프로젝트에서 사용되고 있는지 명시되어 있으므로 수정 및 삭제 시 반드시 이 부분을 확인하고 진행하도록하자.

<center>
  {% asset_img 'jira3.png' 'Jira 이슈 타입 스키마 리스트' %}
  <br>
</center>

이슈 타입 스키마도 이슈 타입과 마찬가지로 맨 마지막 컬럼인 `Actions` 컬럼의 메뉴를 통해 이슈 타입 스키마를 수정, 삭제, 할당, 복사할 수 있다.

- Edit - 이슈 타입 스키마의 이름, 설명, 기본 이슈 타입, 사용할 이슈 타입의 종류를 설정
- Associate - 이슈 타입 스키마를 프로젝트에 할당
- Copy - 이슈 타입 스키마를 복사
- Delete - 이슈 타입 스키마를 삭제

##### Sub-tasks
서브 태스크들의 이슈 타입을 관리한다. 아무것도 설정하지 않았다면 기본적으로 제공해주는 `Sub-task`라는 이름의 이슈 타입만 사용하게 되어있다.

#### Workflows
워크 플로우는 지라 프로젝트 내 이슈들의 작업 흐름을 의미한다. `To Do`, `In Progress`, `Done` 등이 여기에 해당한다.
***
##### Workflows

<center>
  {% asset_img 'jira4.png' 'Jira workflows' %}
  <br>
</center>

워크 플로우를 자세히 보려면 `Actions` 컬럼의 `View` 버튼을 클릭하면 된다. 워크 플로우는 `다이어그램`과 `텍스트` 2가지 방식으로 볼 수 있는데 텍스트 방식은 작업의 흐름을 읽기가 불편하니 다이어그램 방식으로 보는 것을 추천한다.

<center>
  {% asset_img 'jira5.png' 'Jira workflow diagram' %}
  <br>
</center>

워크 플로우는 `Status`와 `Transition`으로 구분된다. `To Do`, `Done`과 같은 사각형이 `Status`를 의미하고 그 사각형들을 이어주는 화살표는 `Transition`이다. 워크 플로우를 수정하려면 우측 상단의 `Edit` 버튼을 누르면 된다. 그러면 다이어그램 UI를 사용하여 워크 플로우 수정 화면이 노출된다. 

PowerPoint나 Google Draw.io와 유사한 UX를 제공해주기 때문에 처음이라도 무리없이 수정할 수 있다.

<center>
  {% asset_img 'jira6.png' 'Jira workflow diagram editing' %}
  <br>
</center>

Status를 클릭하면 Status의 정보를 수정할 수 있는 창이 노출되는데, 이 창 내부에서 `Allow all statuses to transition to this one`에 체크를 하면 이슈가 어떤 Status를 가지고 있는지와 관계없이 자유롭게 현재 Status로 변경할 수 있도록 설정된다.

<center>
  {% asset_img 'jira7.png' 'Allow all statuses to transition to this one' %}
  <br>
</center>

`Transition`을 클릭하면 Transition 설정 창이 노출된다. 이 창에서는 Transition의 `이름`, `속성`, `트리거`, `조건`, `유효성 검사` 등을 설정할 수 있다. 특히 트리거와 조건은 굉장히 유용하게 사용할 수 있다.

- 트리거 - 임의의 이벤트가 발생하면 자동으로 해당 Transition을 실행한다. `Pull Request가 생성되면 자동으로 이슈를 Code Review 상태로 변경 등`
- 조건 - 이 Transition이 실행되기 위한 조건들을 설정한다. `이슈를 Done으로 바꾸려면 이슈에 할당된 모든 Reporter가 동의해야한다 등`

이후 모든 수정을 마쳤다면 상단의 `Publish Draft`를 클릭하여 설정을 배포하면 된다. 이때 이전 워크플로우를 백업할 것이냐고 물어보는 창이 노출되는데 백업을 할지말지는 그냥 본인 판단하에 알아서 하면된다.

<center>
  {% asset_img 'save.jpg' 400 %}
  <sub>편집한 이슈는 내 마음 속에 저장!</sub>
  <br>
</center>

그리고 한번 `Edit` 버튼을 눌러 워크플로우 수정 화면으로 들어가면 아무 것도 수정하지 않았더라도 Jira는 `현재 상태를 자동 저장`한다. 그러니까 아무것도 수정하지 않았더라도 상단의 `Discard Draft` 버튼을 클릭하여 수정 상태를 종료해주도록 하자.

<center>
  {% asset_img 'jira8.png' 'Jira discard draft' %}
  <br>
</center>


##### Workflow schemes
Jira는 프로젝트의 이슈 타입마다 다른 워크 플로우를 사용할 수 있게끔 해준다. 워크 플로우 스키마는 이슈 타입마다 워크 플로우를 할당하는 그룹이다.

- Bug: `To Do → In Progress → Resolved`
- Story: `To Do → In Progress → Test → Review → Deployed`
- Research: `To Do → In Progress → Done`

이런 식으로 이슈 타입마다 다른 워크 플로우를 적용할 수 있다.

#### Screens
스크린은 스크럼 보드에서 이슈를 클릭했을 때 나오는 이슈의 자세한 정보를 보여주는 화면을 의미한다. 이 메뉴는 다른 메뉴들에 비해 직관적이므로 설명보다는 예시 스크린샷을 주로 보여주겠다.
***
##### Screens
스크린 메뉴에서는 해당 스크린에 들어갈 탭과 필드들을 설정할 수 있다.

<center>
  {% asset_img 'jira9.png' 'Jira Screen Fields' %}
  <br>
</center>

##### Screen Schemes
이슈를 `생성할 때`, `수정할 때`, `열람할 때` 각각 다른 스크린을 할당할 수 있다. 기본적으로 `Default`로 설정되어있다.

<center>
  {% asset_img 'jira10.png' 'Jira Screen schemes' %}
  <br>
</center>

이슈 생성은 보통 실무자들이 플래닝할 때 생성하는 경우가 많으므로 빠르게 생성하기 위해 최소한의 필드만 입력하도록 하고 이후 `PO`들이 다시 이슈의 내용을 검토하며 자세히 작성하는 경우에 사용하면 좋다.

##### Issue Type Screen Schemes
이슈 타입마다 다른 `스크린 스키마`를 할당할 수 있다. 기본 값으로 `Default 이슈`와 `Bug 이슈`로 구분되어있다. `Bug` 같은 경우는 이슈 특성 상 에스티메이션을 할 수 없는 경우도 많고 뭔가를 개발하는 것이 아닌 고치는 것이기 때문에 이슈에 필요한 정보가 일반 이슈들과는 많이 다르기 때문에 나누어져 있는 것 같다.

> 참고로 스크린이 아니라 **스크린 스키마**를 할당하는 것이다.

<center>
  {% asset_img 'jira11.png' 'Jira Issue Type Screen Schemes' %}
  <br>
</center>

#### Fields
스크린에 들어가는 항목들을 수정할 수 있는 항목이다. `Custom Fields` 메뉴에서 항목을 추가하고 위에서 설명한 `Screens`에서 불러와서 사용하면 된다.

<center>
  {% asset_img 'custom-fields.png' 'Jira Custom fields' %}
  <br>
</center>

상단의 `Add custom field`를 누르면 다양한 폼을 선택할 수 있다. 폼 종류는 `Standard`와 `Advanced`가 있는 데, 필자는 `Standard` 밖에 사용을 안해봤다. 사실 `Standard` 폼만 사용하더라도 왠만한 정보는 전부 표현할 수 있다.
***

#### Issue Features
***
##### Time Tracking
`타임 트래킹`은 이슈를 진행할때 남기는 `워크 로그`를 통해 해당 이슈를 수행하는 데 얼마나 걸렸는지를 추적해주는 기능이다. 근데 워크 로그를 매번 남기는 게 생각보다 번거로운 작업인지라 팀 내에 정착이 잘 안됐다.<small>(다들 코멘트를 애용하심...)</small>

##### Issue Linking
`이슈 링킹`에서는 이슈들의 관계를 정의하는 필드에 들어갈 내용을 수정할 수 있다. 하나의 관계에는 `자동태`와 `수동태`로 두가지 상세 관계를 설정할 수 있다. 기본적으로 Jira는 6가지의 상태를 제공해준다.

- Blocks(병목) - `blocks`, `is blocked by`
- Cloners(복제) - `clones`, `is cloned by`
- Duplicate(중복) - `duplicates`, `is duplicated by`
- Issue split(분리) - `split to`, `split from`
- Problem/Incident(문제, 원인, 사건 등) - `causes`, `is caused by`
- Relates(관계됨) - `relates to`

만약 `A` 이슈와 `B` 이슈가 있을 때 `A` 이슈가 반드시 먼저 끝나야 `B` 이슈를 작업할 수 있는 상황이 있을 수 있다. 예를 들면 `A`가 DB 스키마 변경 작업이고 `B`가 REST API를 개발하는 작업과 같은 상황이다. 모델이 어떻게 변경될지 모르니까 섣불리 API를 개발할 수 없지 않은가?

이런 경우 `A blocks B` 또는 `B is blocked by A`로 표현할 수 있다. 만약 `A` 이슈에 `B` 이슈로 통하는 `blocks` 링크를 건다면 `B` 이슈에 자동으로 `is blocked by`가 추가된다.

***

###### A blocks B
<center>
  {% asset_img 'blocks.png' 500 %}
  <br>
</center>

###### B is blocked by A
<center>
  {% asset_img 'is-blocked-by.png' 500 %}
  <br>
</center>

***

`이슈 링킹` 기능은 해당 이슈 담당자로 하여금 이 이슈가 어디서 파생된 이슈인지 혹은 어떤 작업이 선행되어야 하는지 명시적으로 알려줄 수 있는 기능이므로 잘 사용하면 커뮤니케이션 비용을 상당히 아낄 수 있다.

이상으로 JIRA 프로젝트 이슈 커스터마이징하기 포스팅을 마친다.

