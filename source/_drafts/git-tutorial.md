---
title: Git에 대해서 알아보기
toc: true
widgets:
  - type: toc
    position: right
  - type: category
    position: right
sidebar:
  right:
    sticky: true
tags:
  - 튜토리얼
  - Git
  - Tutorial
  - Versioning
  - 협업
  - 버전관리
categories:
  - Methodology
thumbnail:
---

이번 포스팅에서는 너도 쓰고 나도 쓰고 우리 모두 쓰고 있는 `Git`의 기초에 대해서 포스팅 하려고한다. 필자는 Git을 대학교 때 처음 접했는데 처음에는 `왠 이상한 클라우드에 소스코드를 올려놓는다` 정도로만 이해하고 사용했던 기억이 난다. 하지만 Git의 기능은 단순히 코드 공유에서 끝나지 않는 `버전 관리 도구`이므로 Git을 잘 쓰면 실무에서 펼쳐지는 다이나믹한 상황에 유연하게 대처할수도 있다.
<!-- more -->

하지만 Git의 모든 기능을 이 포스팅에서 전부 다루기에는 지면이 부족하니, 이번에는 Git을 사용하기 위한 기본적인 명령어인 `add`, `commit`, `push`, `pull`, `fetch`에 대한 설명만 진행하도록 하겠다.

## Git은 누가, 왜 만들었나요?
Git은 2005년 `리누스 토르발즈`가 자기가 쓰려고 만든 `분산 버전 관리 시스템`이다. 일단 이 `리누스 토르발즈`라는 핀란드 형부터가 프로그래머라면 대부분 알고 있을 정도로 유명하다.

아실 만한 분들은 다 아시겠지만 이 형은 오픈소스 커널인 `리눅스(Linux)`를 만든 사람이다. 리눅스 커널로 만든 유명한 운영체제는 데비안 계열의 `우분투(Ubuntu)`, 레드햇 계열의 `센트OS(CentOS)` 등이 있다. 이 운영체제들은 서버에서도 많이 사용되고, 터미널의 기본 기능도 튼실해서 개발 친화적이기 때문에 프로그래머라면 대부분 알고 있는 운영체제이다. 참고로 `안드로이드 OS`도 리눅스 커널을 기반으로 만든 운영체제다.

뭐 어쨌든 이 형은 이 쪽 업계에서는 상당히 유명한데, 뭐 프로그래밍을 잘하거나 리눅스 커널 만든 걸로도 유명하지만 이런 걸로 더 유명하다.

<center>
  {% asset_img linus.jpg 500 %}
  <small>세계 그래픽 카드 점유율 1위 기업한테 엿을 먹이는 패기</small>
  <br>
</center>

이게 대략 2012년 쯤인데, 어떤 포럼 연설에서 실제로 이렇게 엔비디아 엿먹으라고 했다. 당시에 엔비디아 옵티머스 칩을 사용하는 컴퓨터에서 리눅스로 만든 OS가 제대로 안굴러가는 이슈가 있었는데, 엔비디아가 지적재산권을 이유로 오픈소스 드라이버를 공개를 안했었기 때문에 리눅스의 설치가 힘들었던 것이다. 당시의 대화는 대략 이랬다.

{% blockquote %}
**[청중]**
  아 님... 엔비디아 옵티머스 칩 쓰는 노트북에 리눅스 까는게 너무 힘들어요ㅜㅜ 좋은 방법 없을까요?

**[리누스]**
  ...
  난 우리가 하드웨어 제조업체들과 겪었던 최악의 문제 중 하나가 엔비디아라는 것을 이렇게 공개적으로 지적할 수 있어서 기쁘네요! 이건 조금 슬픈 일인데, 엔비디아는 안드로이드 시장에 많은 칩을 팔고 있지만 이 회사는 우리가 경험한 회사 중 진짜 최악입니다.

  그러니까 엔비디아... **엿이나 먹어라**
{% endblockquote %}

리누스는 이런 형이다. 참고로 리눅스 커널이 오픈소스라고 함부로 커밋했다가는 이 형한테 욕먹고 현타가 올 수도 있으니 마음 단단히 먹자. 이 형이 바로 이 업계의 **고든 램지**다.

근데 왜 이 형이 Git을 만들게 되었냐?

리누스는 리눅스 커널을 만들 당시에 `BitKeeper`라는 분산 버전 관리 시스템을 사용했는데, 이 Bitkeeper라는 서비스는 원래 유료였지만 리눅스 커뮤니티에는 무료로 제공해주고 있었다. 근데 이 커뮤니티의 개발자 한명이 BitKeeper의 통신 프로토콜을 리버스 엔지니어링해서 해킹하는 사건이 발생했고, Bitkeeper는 무료로 리눅스 커뮤니티에 서비스를 제공하던 것을 철회한 것이다.

근데 이걸 쓰지 말라고 막은 게 아니라 그냥 무료에서 유료로 돌린 거다. 근데 이 형이 돈내기는 싫었는지 그냥 자기가 분산 버전 관리 시스템을 2주 만에 뚝딱! 만들었는데 그게 바로 `Git`이다.<small>(2달 아니고 2주 맞다...)</small>

리누스가 `Git`을 처음 커밋했던 내용은 Github의 [Git 미러 저장소](https://github.com/git/git/commit/e83c5163316f89bfbde7d9ab23ca2e25604af290)에서 확인해볼 수 있는데 여기서도 리누스 형의 성격이 드러난다.

{% blockquote Linus Torvalds https://github.com/git/git/commit/e83c5163316f89bfbde7d9ab23ca2e25604af290 git/git/README.md %}
GIT - the stupid content tracker

"git" can mean anything, depending on your mood.

 \- random three-letter combination that is pronounceable, and not
   actually used by any common UNIX command. The fact that it is a mispronounciation of "get" may or may not be relevant.
 \- stupid. contemptible and despicable. simple. Take your pick from the
   dictionary of slang.
 \- "global information tracker": you're in a good mood, and it actually
   works for you. Angels sing, and a light suddenly fills the room. 
 \- "goddamn idiotic truckload of sh*t": when it breaks
{% endblockquote %}

음, 이게 리누스가 한 첫번째 커밋의 `README.md` 파일의 일부를 가져온 것인데, `Git`은 그냥 아무 의미 없는 세글자 알파벳이라고 한다. 그냥 유닉스 명령어 중에 `git`이라는 명령어가 없어서 정했다고 한다. 기분이 좋으면 `global information tracker`라고 하고 기분이 구리면 `goddamn idiotic truckload of sh*t`이라고 하랜다.<small>(진짜 이 세상 쿨함이 아니다.)</small>

정리하자면 `Git`은 핀란드의 어떤 천재 형이 쓰던 버전 관리 도구가 갑자기 유료가 되서 2주만에 만들어낸 시스템이고, 지금은 전 세계적으로 널리 사용되고 있는 분산 버전 관리 시스템이다.

## Git의 개념 알아보기
Git은 분산 버전 관리 시스템이기 때문에 리모트 서버에 있는 소스 코드를 수정하려면 사용자의 클라이언트로 코드를 `클론(Clone)`하는 과정이 필요하다. 말 그대로 모든 소스 코드를 복사하여 클라이언트인 사용자의 컴퓨터로 받아오는 것이다.
이후 Git은 사용자 컴퓨터의 파일을 감시하고 있다가 사용자가 소스 코드를 수정하면 그 변경 사항을 알려준다. 그 후 사용자는 자신이 서버에 업데이트하고 싶은 파일이나 소스 코드의 라인을 고른 뒤 리모트 서버에 업로드한다.

<center>
  {% asset_img source-tree.png 500 %}
  <small>맨 위의 `origin/master`는 리모트 서버의 버전, 맨 밑의 `master`는 필자 컴퓨터의 버전을 의미한다.</small>
  <br>
</center>

자 Git에 대한 기본적인 개념은 이게 끝이다. 리모트 서버에 있는 파일을 내 컴퓨터로 복붙한 다음 수정해서 다시 리모트 서버로 업데이트한다는 것. 이때 사용자가 자신의 변경 사항을 서버의 소스를 업데이트하는, 즉 서버로 밀어올리는 행위를 `Push`라고 부르고 사용자가 서버의 코드를 자신의 클라이언트로 가져오는 행위를 `Pull` 또는 `Fetch`라고 하는 것이다. 쉽지 않은가?

하지만 처음 Git을 접하면 평소에 접해보지 못했던 `remote`, `origin`, `repository`와 같은 용어들이 튀어 나오기 때문에 당황할 수 있다. 그럼 이 3가지 용어가 무엇을 뜻하는지부터 간단하게 알아보자.

### Remote / Origin
우선 `Remote`는 말 그대로 리모트 서버 자체를 의미한다. 이 리모트 서버라는 개념이 잘 이해가 안되시는 분은 우리가 자주 사용하는 `구글 드라이브`나 `N드라이브`와 같은 클라우드 스토리지를 사용하는 것을 떠올리시면 된다. 전 세계 어딘가에 있는 서버에 우리의 파일들을 저장하는 것이다.

이때 이 서버를 제공해주는 대표적인 업체가 `Github`, `Bitbucket`, `GitLab`과 같은 회사들이다. 이 회사들이 `Git`을 만든 게 아니라 `Git`이라는 시스템에 필요한 리모트 서버와 Git을 좀 더 편리하게 사용할 수 있는 기능들을 제공하는 것이다.

Git을 사용할 때는 내가 어떤 리모트 서버에 변경 사항을 업로드 할 것인지 정해야하는데, 반드시 하나의 리모트 서버만 사용할 수 있는 것이 아니기 때문에 내가 사용하는 리모트 서버의 이름을 정해줘야한다. 이때 관례적으로 많이 사용하는 이름이 바로 `Origin`이다.

보통은 한 개의 리모트 서버만 운용하는 경우가 대다수이기 때문에 많은 사람들이 `Remote`와 `Origin`을 혼용해서 부르곤 한다.

### Repository
`레파지토리(Repository, Repo)`는 저장소라는 뜻으로, 리모트 서버 내에서 구분되는 프로젝트 단위라고 생각하면 된다. 우리가 구글 드라이브를 사용할 때도 하나의 디렉토리에 모든 파일을 다 때려넣지않고 몇 개의 디렉토리를 만들고 용도에 따라 파일을 나눠서 구분하는 것과 동일하다.

일반적으로 한 개의 레파지토리는 하나의 프로젝트를 의미하지만 경우에 따라서 레파지토리 하나에 여러 개의 프로젝트를 돌리기도 한다.

```text
https://github.com/user/repository.git
https://user@bitbucket.org/group-name/repository.git
```

레파지토리를 클론받을 때는 해당 레파지토리를 가리키는 URL이 필요한데, 레파지토리의 이름은 URL의 맨 마지막에 `.git` 확장자를 가지는 방식으로 표현된다.

## Git의 기본 명령어를 알아보자
만약 여러분이 혼자서만 프로젝트의 버전 관리를 한다면 단순히 리모트 서버의 레파지토리에서 파일을 클론받고 변경한 후 다시 리모트 서버로 업로드하는 과정만으로도 프로젝트를 진행하는데는 사실 아무 문제가 없다.

하지만 Git은 애초에 혼자서 개발하는 상황보다는 여럿이서 함께 같은 소스 코드를 수정하며 개발하는 협업 상황을 상정하고 만들었기 때문에 협업에서 발생할 수 있는 여러가지 곤란한 상황들을 타파하기 위한 많은 기능을 가지고 있다.

Git은 기본적으로 `CLI(Command Line Tools)`을 통해 사용하고 `commit`, `fetch`, `branch`와 같은 여러가지 명령어를 사용하여 이 기능들을 사용할 수 있게 해준다.

그럼 이번에는 Git을 사용하여 버전을 관리하기 위해 기본적으로 알아야 하는 몇 가지 명령어를 한번 살펴보자.

### clone
`clone`은 말 그대로 리모트 서버의 레파지토리에서 클라이언트로 파일을 복붙하는 행위를 말한다. 이때 클론을 수행하기 위해서는 `어떤 레파지토리`에서 파일을 가져올 것인지에 대한 정보가 필요한데, 이 정보는 URL로 표현한다. `HTTPS` 프로토콜이나 `SSH` 프로토콜을 사용하여 소스 코드를 클론받을 수 있는데, 보통 `HTTPS`를 많이 사용한다.

<center>
  {% asset_img clone.png 500 %}
  <br>
</center>

보통 Github과 같은 리모트 서버 제공업체들은 레파지토리를 쉽게 클론할 수 있도록 눈에 잘 띄는 버튼을 만들어 놓고 해당 레파지토리의 URL을 제공하는 경우가 많다. 사용자는 단지 저 URL을 복사한 다음 Git의 `clone` 명령어를 사용해서 레파지토리를 클론하기만 하면 된다.

```bash
$ cd ~/dev/evan # 원하는 작업 디렉토리로 이동
$ git clone https://github.com/evan-moon/test-repo.git
```

원하는 작업 디렉토리로 이동한 뒤 `clone` 명령어를 사용하여 레파지토리를 클론하게되면 현재 위치에 레파지토리 이름과 동일한 디렉토리가 생성되고 그 내부에 파일이 복사된다. 위 예제의 경우 `~/dev/evan/test-repo` 디렉토리 내부에 `test-repo` 레파지토리의 파일들이 복사될 것이다.

이제 이 복사된 파일을 맘대로 수정하더라도 리모트 서버에 업로드만 하지 않는다면, 같은 리모트 서버를 보고 있는 다른 사람은 절대 영향을 받지 않는다.

### add

<center>
{% asset_img add.jpg 500 %}
<small>원하는 변경사항만 골라 담는 add 명령어</small>
<br>
</center>

Git을 사용하여 변경한 파일을 서버에 업로드하는 과정을 편의점 택배라고 생각해보자. 보통 집에 있는 모든 물건을 택배로 보내진 않기 때문에 보낼 물건을 정해야하는데, 이때 `add` 명령어가 `어떤 물건들을 포장할 것인지 고르는 과정`을 담당한다.

```bash
$ git add . # 현재 디렉토리의 모든 변경사항을 스테이지에 올린다
$ git add ./src/components # components 디렉토리의 모든 변경사항을 스테이지에 올린다
$ git add ./src/components/Test.vue # 특정 파일의 변경사항만 스테이지에 올린다
$ git add -p # 변경된 사항을 하나하나 살펴보면서 스테이지에 올린다
```

이때 선택된 변경 사항들은 `스테이지(Stage)`라고 불리는 공간으로 이동하게 된다. 이때 `git add <경로>` 명령어는 해당 경로 안에 있는 모든 변경 사항을 전부 스테이지에 올리게 되는데, 이게 영 불안하다 싶은 사람은 `-p` 옵션을 줌으로써 변경 사항을 하나하나 확인하면서 스테이지에 올릴 수도 있다.

이렇게 스테이지에 담긴 변경 사항들은 `git status` 명령어를 사용하여 확인해볼 수 있고, `status` 명령어에 추가적으로 `-v` 옵션을 사용하면 어떤 파일의 어떤 부분이 변경되었는지도 함께 볼 수 있다.

```bash
$ git add ./soruce
$ git status

On branch master
Your branch is up to date with 'origin/master'.

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

	modified:   source/_drafts/git-tutorial.md
```

### commit

<center>
  {% asset_img commit.jpg 500 %}
  <small>변경 사항들을 포장하는 commit 명령어</small>
  <br>
</center>

`add`를 사용하여 원하는 변경사항을 스테이지에 올렸다면 이제 스테이지에 있는 변경 사항들을 포장할 차례이다. 이때 이 포장하는 행위를 `commit`이라고 한다. 커밋은 Git에서 상당히 중요한 부분을 차지하는 행위인데, 바로 Git에서 커밋 단위로 버전을 표현하기 때문이다. 커밋 단위로 버전을 표현하기 때문에 `특정 버전으로 어플리케이션을 변경`이라는 기준도 바로 이 커밋이 된다.

```bash
$ git log --graph

* commit 20f1ea9 (HEAD -> master, origin/master, origin/HEAD)
| Author: Evan Moon <bboydart91@gmail.com>
|
|     회원가입 기능 끝! 
|
* commit ca693fd
| Author: Evan Moon <bboydart91@gmail.com>
|
|     회원가입 비밀번호 입력 폼 추가
|
* commit f9b6e2d
| Author: Evan Moon <bboydart91@gmail.com>
|
|     회원가입 이메일 입력 폼 추가
|
```

위의 그래프 상에서 필자의 어플리케이션의 현재 상태는 어떤 커밋일까?

그래프 상에서 `HEAD`가 `20f1ea9 회원가입 기능 끝!` 커밋에 위치해 있으므로 현재 필자의 어플리케이션은 `회원가입 기능`까지 개발이 완료된 상태라는 것을 알 수 있다. 그리고 그래프를 자세히 보면 커밋들은 각각 고유한 해쉬 값을 가지고 있는데, 이 해쉬 값을 사용하여 어떠한 커밋으로든 자유자재로 이동할 수 있다.

예를 들면 `회원가입 비밀번호 입력 폼 추가` 커밋의 해쉬 값을 사용하여 `git checkout ca693fd` 명령어로 회원가입 비밀번호 입력 폼이 추가된 시점으로 이동할 수 있다는 것이다. 즉, 시간여행이 가능하다!

이런 커밋의 특징 때문에 커밋은 반드시 **실행 가능한 단위**로 해야한다. 더 쉽게 말하자면 특정 커밋으로 버전을 변경했을 때 어플리케이션이 제대로 실행되지 않고 에러가 발생하면 안된다는 것이다. 또한 커밋은 아직 리모트 서버에 파일을 전송하는 것이 아니라 사용자의 클라이언트 내에서 수행되는 과정이므로 인터넷에 연결이 되어 있지 않아도 변경 사항을 커밋하는 것은 아무런 지장이 없다.<small>(비행기에서 코딩할 때도 커밋까지는 가능하다!)</small>

많은 개발자들이 간혹 **"그 소스 서버에 커밋했어?"** 처럼 `push`의 의미로 `commit`이라는 단어를 사용하는데 이 두 명령어는 엄연히 다른 역할을 하기 때문에 Git 뉴비를 헷갈리게 만드는 요인 중 하나이다.

### push

<center>
  {% asset_img push.jpg 500 %}
  <small>변경 사항들을 리모트 서버로 업로드하는 push 명령어</small>
  <br>
</center>

커밋을 통해 포장된 변경 사항들은 `push` 명령어를 사용하여 리모트 서버로 업로드 된다.

### fetch

### pull
