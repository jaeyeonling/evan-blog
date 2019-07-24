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

{% raw %}
<script src="https://cdn.jsdelivr.net/npm/@gitgraph/js"></script>
<script>
  function getGitGraph (domId = '') {
    const el = document.getElementById(domId);
    return GitgraphJS.createGitgraph(el, {

    });
  }
</script>
<style>
.git-graph text {
  font-size: 12px;
}
</style>
{% endraw %}

이번 포스팅에서는 너도 쓰고 나도 쓰고 우리 모두 쓰고 있는 `Git`의 기초에 대해서 포스팅 하려고한다. 필자는 Git을 대학교 때 처음 접했는데 처음에는 `왠 이상한 클라우드에 소스코드를 올려놓는다` 정도로만 이해하고 사용했던 기억이 난다. 하지만 Git의 기능은 단순히 코드 공유에서 끝나지 않는 `버전 관리 도구`이므로 Git을 잘 쓰면 실무에서 펼쳐지는 다이나믹한 상황에 유연하게 대처할수도 있다.
<!-- more -->

Git은 크게 `add`, `commit`, `push`, `pull`, `fetch`등의 리모트 저장소를 업데이트하거나 연동하는 명령어와 `checkout`, `branch`, `merge`, `cherry-pick`과 같이 버전을 관리하는 명령어로 나눌 수 있다. Git의 모든 명령어를 이 포스팅에서 전부 다루기에는 지면이 부족하니, 이번에는 기본적인 기능에 대한 설명만 진행하도록 하겠다.

## Git은 누가, 왜 만들었나요?
Git은 2005년 `리누스 토르발즈`가 자기가 쓰려고 만든 `분산 버전 관리 시스템`이다. 일단 이 `리누스 토르발즈`라는 핀란드 형부터가 프로그래머라면 대부분 알고 있을 정도로 유명하다.

아실 만한 분들은 다 아시겠지만 이 형은 오픈소스 커널인 `리눅스(Linux)`를 만든 사람이다. 리눅스 커널로 만든 유명한 운영체제는 데비안 계열의 `우분투(Ubuntu)`, 레드햇 계열의 `센트OS(CentOS)` 등이 있다. 이 운영체제들은 서버에서도 많이 사용되고, 터미널의 기본 기능도 튼실해서 개발 친화적이기 때문에 프로그래머라면 대부분 알고 있는 운영체제이다. 참고로 `안드로이드 OS`도 리눅스 커널을 기반으로 만든 운영체제다.

뭐 어쨌든 이 형은 이 쪽 업계에서는 상당히 유명한데, 뭐 프로그래밍을 잘하거나 리눅스 커널 만든 걸로도 유명하지만 이런 걸로 더 유명하다.

<center>
  {% asset_img linus.jpg 500 %}
  <small>세계 그래픽 카드 점유율 1위 기업한테 엿을 먹이는 패기</small>
  <br>
</center>



이게 대략 2012년 쯤인데, 어떤 포럼 연설에서 실제로 이렇게 엔비디아 엿먹으라고 했다. 당시에 엔비디아 옵티머스 칩을 사용하는 컴퓨터에서 리눅스로 만든 OS가 제대로 안굴러가는 이슈가 있었는데 어떤 청중이 이런 질문을 했었다.

> 아 님... 엔비디아 옵티머스 칩 쓰는 노트북에 리눅스 까는게 너무 힘들어요ㅜㅜ 좋은 방법 없을까요?

이때 엔비디아가 지적재산권을 이유로 오픈소스 드라이버를 공개를 안했었기 때문에 리눅스의 설치가 힘들었던 것이다.. 그때 이 형의 대답이 대충 이랬다.

{% blockquote %}
...
난 우리가 하드웨어 제조업체들과 겪었던 최악의 문제 중 하나가 엔비디아라는 것을 이렇게 공개적으로 지적할 수 있어서 기쁘네요! 이건 조금 슬픈 일인데, 엔비디아는 안드로이드 시장에 많은 칩을 팔고 있지만 이 회사는 우리가 경험한 회사 중 진짜 최악입니다.
그러니까 엔비디아... **엿이나 먹어라**
{% endblockquote %}

뭐 어쨌든 리누스 토르발즈는 이런 형이다. 참고로 리눅스 커널이 오픈소스라고 함부로 커밋했다가는 이 형한테 욕먹고 현타가 올 수도 있으니 마음 단단히 먹자. 이 형이 바로 이 업계의 **고든 램지**다.

근데 왜 이 형이 Git을 만들게 되었냐?

`리누스 토르발즈`는 리눅스 커널을 만들 당시에 `BitKeeper`라는 분산 버전 관리 시스템을 사용했는데, 이 `Bitkeeper`라는 서비스는 원래 유료였지만 리눅스 커뮤니티에는 무료로 제공해주고 있었다.
근데 이 커뮤니티의 개발자 한명이 BitKeeper의 통신 프로토콜을 리버스 엔지니어링해서 해킹하는 사건이 발생했고, Bitkeeper는 무료로 리눅스 커뮤니티에 서비스를 제공하던 것을 철회한 것이다.

근데 이걸 쓰지 말라고 막은 게 아니라 그냥 무료에서 유료로 돌린 거다. 근데 이 형이 돈내기는 싫었는지 그냥 자기가 분산 버전 관리 시스템을 2주 만에 뚝딱! 만들었는데 그게 바로 `Git`이다.
`2달`이 아니고 `2주` 맞다. 이 형 진짜 굇수 중에 굇수...

리누스가 `Git`을 처음 커밋했던 내용은 Github의 [Git 미러 저장소](https://github.com/git/git/commit/e83c5163316f89bfbde7d9ab23ca2e25604af290)에서 확인해볼 수 있는데 여기서도 `리누스 토르발즈` 형의 성격이 드러난다.

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

음, 이게 리누스가 한 첫번째 커밋의 `README.md` 파일의 일부를 가져온 것인데, `Git`은 그냥 아무 의미 없는 세글자 알파벳이라고 한다. 그냥 유닉스 명령어 중에 `git`이라는 명령어가 없어서 정했다고 한다. 기분이 좋으면 `global information tracker`라고 하고 기분이 구리면 `goddamn idiotic truckload of sh*t`이라고 하랜다.<small>(진짜 이 형 똘끼...너무 멋져)</small>

정리하자면 `Git`은 핀란드의 어떤 천재 형이 쓰던 툴이 유료가 되서 2주만에 만들어낸 분산 버전 관리 시스템이고, 지금은 전 세계적으로 널리 사용되고 있다는 것이다.

## Git의 개념 알아보기
Git은 분산 버전 관리 시스템이기 때문에 리모트 서버에 있는 소스 코드를 수정하려면 사용자의 클라이언트로 코드를 `클론(Clone)`하는 과정이 필요하다. 말 그대로 모든 소스 코드를 복사하여 클라이언트인 사용자의 컴퓨터로 받아오는 것이다.
이후 Git은 사용자 컴퓨터의 파일을 감시하고 있다가 사용자가 소스 코드를 수정하면 그 변경 사항을 알려준다. 그 후 사용자는 자신이 서버에 업데이트하고 싶은 파일이나 소스 코드의 라인을 고른 뒤 리모트 서버에 업로드한다. 

<center>
  {% asset_img source-tree.png 500 %}
  <small>맨 위의 `origin/master`는 리모트 서버의 버전, 맨 밑의 `master`는 필자 컴퓨터의 버전을 의미한다.</small>
  <br>
</center>

리모트 서버를 `Remote`라고 부르는 분도 있고 `Origin`이라고 부르는 분도 있기 때문에 이 부분에서 헷갈리기 쉬운데, Origin은 리모트 서버의 관례적인 이름이다. 물론 리모트 서버는 한개만 사용할 수 있는 것이 아니라 여러 개를 함께 사용할 수도 있기 때문에 `Remote`와 `Origin`은 확실히 명칭을 구분해주는 것이 좋다.

이때 사용자가 서버의 소스를 업데이트하는 행위를 `Push`라고 부르고 사용자가 서버의 코드를 가져오는 행위를 `Pull`이라고 부르는 것이다. 많은 개발자들이 간혹 **"그 소스 서버에 커밋했어?"** 처럼 `push`의 의미로 `commit`이라는 단어를 사용하는데 이 두 명령어는 엄연히 다른 역할을 하기 때문에 Git 뉴비를 헷갈리게 만드는 요인 중 하나인 것 같다.

사용자는 `add`, `commit`, `push`, `pull` 등 명령어를 사용하여 원하는 파일을 고르고 포장한 뒤 서버로 업로드하거나 갱신된 파일을 서버로부터 받아오는 등의 과정을 거치게 된다. 그럼 먼저 `원격 서버로부터 처음 파일을 받아오는 과정`부터 소스를 수정하고 `다시 파일을 수정하고 서버에 업로드하는 과정`을 간단히 알아보자.

### clone
`clone`은 리모트 서버에서 말 그대로 소스 코드를 복붙하는 행위를 말한다. 보통 쉘에서 `CLI(Command Line Tool)`을 사용하여 수행하거나 `Source Tree`와 같은 GUI 툴을 사용하여 수행하게 된다.

이때 `HTTPS` 프로토콜이나 `SSH` 프로토콜을 사용하여 소스 코드를 클론받을 수 있는데, 보통 `HTTPS`를 많이 사용한다.

```bash
$ cd ~/dev/evan # 원하는 작업 디렉토리로 이동
$ git clone https://github.com/evan-moon/test-repo.git
```

원하는 작업 디렉토리로 이동한 뒤 `git clone` 명령어를 사용하여 소스 코드를 클론하면 현재 위치에 레파지토리 이름과 동일한 디렉토리가 생성되고 그 내부에 소스 코드가 복사된다. 위 예제의 경우 `~/dev/eva/test-repo` 디렉토리 내부에 `test-repo` 레파지토리의 소스 코드가 복사될 것이다.

### add
Git을 사용하여 변경한 파일을 서버에 업로드하는 과정을 편의점 택배라고 생각해보자. 보통 집에 있는 모든 물건을 택배로 보내진 않기 때문에 보낼 물건을 정해야하는데, 이때 `add` 명령어가 `어떤 물건들을 포장할 것인지 고르는 과정`을 담당한다.

<center>
{% asset_img add.jpg 500 %}
<small>원하는 변경사항만 골라 담기!</small>
<br>
</center>

```bash
$ git add . # 현재 디렉토리의 모든 변경사항을 스테이지에 올린다
$ git add ./src/components # components 디렉토리의 모든 변경사항을 스테이지에 올린다
$ git add ./src/components/Test.vue # 특정 파일의 변경사항만 스테이지에 올린다
```

이때 선택된 변경 사항들은 `스테이지(Stage)`라고 불리는 공간으로 이동하게 된다.

### commit
`add`를 사용하여 원하는 변경사항을 스테이지에 올렸다면 이제 스테이지에 있는 변경 사항들을 포장할 차례이다. 이때 이 포장하는 행위를 `commit`이라고 한다.

<center>
{% asset_img commit.jpg 500 %}
<br>
</center>

커밋은 Git에서 상당히 중요한 부분을 차지하는 행위인데, 바로 Git에서 커밋 단위로 버전을 표현하기 때문이다.

{% raw %}
<div id="commit-git-graph" class=git-graph></div>
<script>
(function () {
  const git = getGitGraph('commit-git-graph');
  const master = git.branch('master');
  master.commit({
    subject: '첫번째 커밋 입니다',
    author: 'Evan <bboydart91@gmail.com>',
  });
  master.commit({
    subject: '두번째 커밋 입니다',
    author: 'Evan <bboydart91@gmail.com>',
  });
  master.commit({
    subject: '세번째 커밋 입니다',
    author: 'Evan <bboydart91@gmail.com>',
  });
})();
</script>
{% endraw %}

### push
<center>
{% asset_img push.jpg 500 %}
<br>
</center>

