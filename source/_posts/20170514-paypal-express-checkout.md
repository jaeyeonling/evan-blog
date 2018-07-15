---
title: Paypal - Express Checkout Restful API 사용하기
date: 2017-05-14 12:36:23
tags:
    - Coding
    - JavaScript
    - Paypal
    - DevLog
categories:
    - JavaScript
    - Paypal
---

#### - 들어가며
이번 포스팅에서는 Paypal의 RESTful API인 Express Checkout을 사용하는 방법에 대해서 포스팅 하려고 한다.
진행하기에 앞서 먼저, https://www.sandbox.paypal.com/에 접속해서 sandbox용 계정을 만들어야 한다.
이 계정으로 테스트를 진행하고 실제 운영 계정은 https://www.paypal.com/kr/home에서 회원가입하면 된다.

### Express Checkout이란?
Paypal에서 제공해주는 결제 플로우 방식 중 하나이며, 유저가 `페이팔로 구매하기`버튼을 클릭했을 때 페이팔 로그인 Modal window가 렌더되고, 이를 통해 결제를 진행하는 플로우이다.
모든 국가를 지원하며, 브라우저 지원은 다음과 같다.

|Internet Explorer|Chrome|Mozila Firefox|Safari|Opera|
|:-:|:-:|:-:|:-:|:-:|
|IE 9 이상|ver 27 이상|ver 30 이상|ver 5.1 이상|ver 23 이상|

Paypal에서는 총 3가지의 결제플로우를 제공하고 있으며, 한국에서는 이 중 All countries로 제공되는 다음 2가지 방식 중 선택이 가능하다.

#### 1. Paypal Standard
Paypal에서 제공해주는 HTML코드를 기반으로 생성된 버튼을 웹 클라이언트 소스에 직접 삽입하는 방식이다.
Paypal사이트에서 직접 상품 이름, 상품 ID, 가격 등을 입력하면 그에 맞는 버튼의 코드를 자동으로 생성해준다. 이후 그 코드를 클라이언트 소스에 삽입하면 된다.

#### 2. Express Checkout
Paypal의 JavaScript SDK인 checkout.js를 사용하여 버튼을 동적으로 렌더하는 방식이다.
상품 데이터를 본인 서비스의 서버로 전달한 후 Server to Server방식으로 Paypal서버에서 인증을 받는 방식으로 진행된다. 필자는 이 방법을 선택하였다.

### Express Checkout의 흐름
먼저 이 글은 Paypal Developer페이지의 Express Checkout항목을 참고하여 작성되었다.

<sub>이미지 출처 및 링크: https://developer.paypal.com/docs/classic/express-checkout/</sub>
<center>{% asset_img 'flow.png' 'express-checkout-flow' %}</center>

쉽게 생각하면 Facebook이나 Instagram계정으로 로그인하는 플로우와 UX가 비슷하다고 보면 된다.
유저가 구매버튼을 클릭하면 데스크탑에서는 팝업, 모바일에서는 새 탭의 형태로 페이팔 로그인 창이 열리고, 유저는 그 창에서 인증과 결제를 순차적으로 진행하게 된다.
이후 모든 플로우가 끝나면 유저는 결제 진행 결과에 따라 페이팔에 `redirect_url`파라미터로 보내졌던 URL로 이동을 하게되며 최종적으로 성공, 실패, 취소에 따른 페이지와 결제 정보 결과를 보게 된다.
Paypal서버와 통신하는 방법으로는 `RESTful API`와 `NVP/SOAP API`로 2가지 방법이 있으나 본 문서에서는 `RESTful API`만 기술하겠다.

Paypal Express Checkout의 플로우는 다음과 같다.
***
1. 유저가 구매버튼을 클릭
    - Express Checkout의 client SDK인 `checkout.js`를 통해 로그인 모달창이 열리거나 API서버가 Paypal API를 호출하여 `payment`이벤트를 초기화한다.
    - `payment`이벤트 초기화 후, Express Checkout 플로우가 모달창 내부에서 시작된다.
2. 유저가 페이팔 로그인을 진행
3. 유저가 결제 정보를 확인 후 `Contunue`버튼을 클릭
4. 유저가 `Continue`버튼을 클릭하면 다시 서비스의 리다이렉트페이지로 이동하며 최종 결제 정보가 표시된다.
결제 정보를 생성할 때 보냈던 상품 정보 파라미터는 이 단계에서 노출시키는 것이 좋다.
5. 최종적으로 `execute` API가 호출되고 결제가 마무리된다. 그리고 사용자는 서비스 상의 결제완료페이지로 리다이렉트된다.
***

### Client만으로 진행하기
> Paypal 공식문서에서는 Express Checkout과의 버전 호환성을 최대한 보장하기 위해 CDN을 이용한 동적로딩을 추천하고 있다. 직접 `checkout.js`파일을 다운받아 클라이언트 소스에 넣는 것은 추천하지 않는다.
> 이 문서에서의 `checkout.js`의 버전은 `4.0`으로 진행한다.

지금 작성하는 플로우는 필자 서비스의 API서버를 통하지 않고 `checkout.js`를 이용하여 바로 페이팔 서버로부터 인증과 결제까지 한번에 마치는 방법이다.
클라이언트에서는 데이터를 정의하고 `checkout.js`를 사용하여 Paypal결제 버튼을 렌더한다. 이 버튼을 클릭하면 `checkout.js`의 내장 메소드를 호출하여 자동으로 인증과 결제토큰생성, 결제 완료까지 한큐에 진행하게 된다.

먼저, `checkout.js` SDK의 동적로딩을 위해 `index.html`파일에 `script`태그를 열고 다음 스크립트를 작성하였다.

```js
(function() {
    var _DOM = document.createElement('script');
    _DOM.src = 'https://www.paypalobjects.com/api/checkout.js';
    var element = document.getElementsByTagName('script')[0];
    element.parentNode.insertBefore(_DOM, element);
});
```

이후 Paypal버튼을 DOM을 작성해주고 checkout.js를 사용해 버튼을 렌더한다.

```html
<div id="pay-test-btn">Test to payment</div>
```

```js
paypal.Button.render({
    env: 'sandbox', // 테스트용은 'sandbox'를, 운영은 'production'을 입력
    client: {
        sandbox: 'paypal-sandbox-key', // paypal에서 발급 받은 client_key를 입력
        production: 'paypal-production-key'
    },
    payment: function() {
        var env = this.props.env,
            client = this.props.client;
        return paypal.rest.payment.create(env, client, {
            transactions: [{
                amount: {
                    total: '10.00',
                    currency: 'USD'
                }
            }],
        });
    },
    commit: true,
    // false일 시 모달의 마지막 버튼의 문구가 Continue로 변하고 바로 결제가 진행되는 것이 아니라 리다이렉트 페이지로 이동한다.
    // true일 시 Pay Now로 변하고 바로 결제가 진행된다
    onAuthorize: function(data, actions) {
        return actions.payment.execute().then(function(res) {
            // 결제 성공 시 콜백파라미터인 res에 데이터가 담겨온다
        });
    }
}, '#pay-test-btn');
```

그러면 아래와 같이  아까 작성한 #pay-test-btn DOM엘리먼트에 자동으로 Paypal버튼이 렌더된다.

<center>{% asset_img 'paypal-button.jpeg' 'paypal-button' %}</center>

정상적으로 버튼이 렌더되었다면 이제 테스트 결제를 진행해보자.
저 버튼을 클릭하면 아래와 같은 창이 하나 뜰 것이다. 이 창은 사용자의 이용환경이 데스크탑이냐, 모바일이냐에 따라 팝업창, iframe또는 새 탭으로 열릴 수 있다.
이 창을 Paypal에서는 `light window`라고 부르지만 이 포스팅에서는 편의상 그냥 `로그인 모달`이라고 하겠다.
이 후 사용자는 로그인 모달의 안내에 따라 결제를 진행하게 되고, 최종 결제가 완료되면 `onAuthorize`메소드에 있는 Promise Callback함수의 `res`파라메터로 결과값을 전달받게 된다.

<center>{% asset_img 'light-window.jpeg' 'light-window' %}</center>

### Client와 Server의 통신으로 진행하기
이 플로우는 Paypal에서 발급해주는 client_key와 secret을 이용하여 페이팔 인증부터 차례대로 진행하는 방법이다.
이 방법의 장점으로는 본인의 서비스의 UX플로우를 최대한 지키며 결제를 진행시킬 수 있고, 첫번째 방법보다 플로우가 유연하며 버튼 디자인또한 css로 커스터마이징이 자유롭다.
그런 이유로 Paypal에서도 이 방법을 권장하고 있다. 결제플로우는 크게 3가지 단계로 나눠진다.

***
1. `client_key`와 `secret`을 사용하여 페이팔 서버로부터 액세스토큰을 받는 인증 과정
2. 결제를 `create`하는 과정
3. 결제를 `execute`하는 과정
***

먼저 클라이언트는 버튼을 렌더하고 본 서비스의 API를 통해 `create`요청을 보내야한다.
이때 전 플로우와의 차이점은 딱히 `checkout.js`를 사용하지않아도 딱히 상관이 없다는 점이다.
먼저 버튼을 렌더한다. 참고로 필자는 `AngularJS`와 `md-material`을 사용하였다.

```html
<div layout="row" layout-align="center center">
    <div layout="column">
        <md-button md-color="{background: 'blue-grey'}" ng-click="vm.postData()">
            TEST
        </md-button>
    </div>
</div>
```

이후 Paypal결제를 다른 페이지에서 사용하게 될때 중복로직을 작성해야하므로 따로 팩토리를 정의했다.
따로 팩토리를 정의하지 않고 컨트롤러 내부에 구현해도 상관은 없다.
이 팩토리에서는 필자의 API서버와 통신을 한 후 `Promise`를 사용하여 다시 컨트롤러로 값을 전달한다.

```js
(function() {
    'use strict';
 
    angular
        .module('services')
        .factory('PaypalService', [
            '$rootScope', 'Restangular', 'SNS_KEYS', '$q',
            PaypalService
        ]);
    
        function PaypalService($rootScope, Restangular, SNS_KEYS, $q) {
            var service = {
                create: create,
                execute: execute,
                getPaymentInfo: getPaymentInfo
            };
            //페이팔에서 발급해준 키를 전역으로 사용하기 위해 app.constants에 미리 담아놓았다.
            var clientKey = SNS_KEYS.paypal;
            return service;
 
            /**
             * @public 
             * @name create
             * @description create paypal payment request
             * @param { Object } data
             * @return { Promise }
             */
            function create(data) {
                var defer = $q.defer();
                data.clientKey = clientKey;
                data.redirect_urls = {
                    return_url: location.origin + '/paypal/result', // 결제가 완료되었을 때 리다이렉트될 페이지
                    cancel_url: location.origin + '/paypal/result' // 결제가 취소되었을 때 리다이렉트 될 페이지, return_url과 같아도 상관없다
                };
                // API서버의 API endpoint
                Restangular.all('paypal/payments/create')
                .customPOST(data, undefined, undefined, undefined, {
                    'Content-Type': 'application/json'
                }).then(function(res) {
                    defer.resolve(res);
                }, function(err) {
                    defer.reject(err);
                });
                 
                return defer.promise;
            }
            
            /**
             * @name execute
             * @description execute paypal payment
             * @param { Object } data
             * @return { Promise} 
             */
            function execute(data) {
                var defer = $q.defer();
                // API서버의 API endpoint
                Restangular.all('/paypal/payments/execute').customPOST(data, undefined, undefined, {
                    'Content-Type': 'application/json'
                }).then(function(res) {
                    defer.resolve(res);
                }, function(err) {
                    defer.reject(err);
                });
                 
                return defer.promise;
            }
            
            /**
             * @name getPaymentInfo
             * @description getting created paypal payment information
             * @param { Object } data
             * @return { Promise }
             */
            function getPaymentInfo(data) {
                var defer = $q.defer();
                // API서버의 API endpoint
                Restangular.all('/paypal/payments/detail').customGET('', data).then(function(res) {
                    defer.resolve(res);
                }, function(err) {
                    defer.reject(err);
                });
            }
        }
})();
```

이후 버튼을 렌더한 html파일에 물려있는 Controller에서 위에서 정의한 Paypal서비스를 호출한다. 

```js
(function() {
    'use strict';
 
    angular
        .module('app')
        .controller('PaypalCreateController', [
            '$rootScope', '$scope', 'PaypalService',
            PaypalCreateController
        ]);
        
        function PaypalCreateController() {
            var vm = this;
            //테스트를 위한 더미데이터를 정의한다. 실서비스에는 이 데이터들이 폼에 바인딩 될 것이다.
            vm.paymentData = {
                transactions: [{
                    amount: {
                        total: '1.00',
                        currency: 'USD'
                    },
                    description: 'This is the description',
                    item_list: {
                        items: [{
                            name: 'test',
                            description: 'This is test product',
                            quantity: '1',
                            price: '1.00',
                            sku: '1',
                            currency: 'USD'
                        }]
                    }
                }]
            };
            
            vm.postData = postData;
            function postData() {
                var data = angular.copy(vm.paymentData);
                // Deep Copy를 하는 이유는 데이터를 전송하기전에 변조해야할 경우가 생길 수 있기 때문이며
                // Object타입은 기본적으로 Call by reference이기때문에 여기서 변조를 해버리면 원본 데이터도 함께 변조되기 때문이다.
                PaypalService.create(data).then(function(res) {
                    // Paypal에서는 총 3개의 url을 리턴해주는데
                    // links[0] = 방금 생성된 결제정보의 자세한 값을 받을 수 있는 GET메소드 요청 URL
                    // links[1] = 생성된 결제페이지의 리다이렉트 URL
                    // links[2] = 결제 실행 URL
                    // 순으로 나열된다.
                    window.location = res.result.links[1].href;
                });            
            }
        }
});
```

이때 API서버는 클라이언트에서 보내준 값들을 가지고 Paypal서버와 통신하여 인증을 진행하는 로직을 가지고 있어야한다.
필자의 API서버는 `Laravel 5.x`로 되어있다.

```php
namespace App\Http\Controllers;
 
use Log;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
 
class PaypalPaymentController extends Controller {
    public $client;
    public $paymentUrl;
    public $accessToken;
 
    public function __construct() {
        $this--->client = new Client();
        $this->accessToken = env('PAYPAL_ACCESS_TOKEN_SANDBOX');
        // 필자는 페이팔에서 발급받은 access token값을 env에서 가져온다
        $this->paymentUrl = "https://api.sandbox.paypal.com/v1/payments/payment";
        // 지금은 테스트 중이라 sandbox url로 요청을 날리고있다. 본 서비스는 sandbox를 제거하고 api.paypal.com으로 날리면 된다.
    }
 
    public function detail(Request $request){
        $query = $request->query();
        $response = $this->client->request('GET', $this->paymentUrl.'/'.$query['paymentId'] , [
            'headers' => [
                "Content-Type" => "application/json",
                "Authorization" => $this->accessToken,
            ],
        ])->getBody()->getContents();
        $decodeResult = json_decode($response);
 
        return response()->success($decodeResult);
    }
    
    public function payment(Request $request) {
        $response = $this->client->request('POST', $this->paymentUrl, [
            'headers' => [
                "Content-Type" => "application.json",
                "Authorization" => $this->accessToken,
            ],
            'json' => [ // Paypal서버에 날릴 요청의 Body, 페이팔 공식사이트에 적혀있는 파라미터와 동일해야한다.
                "intent" => "sale",
                "redirect_urls" => $request->redirect_urls,
                "payer" => [
                    "payment_method" => "paypal", // 한국은 paypal메소드밖에 지원이 안된다
                ],
                "transactions" => $request->transactions, // client에서 보내준 결제 정보
            ]
        ])->getBody()->getContents();
        $decodeResult = json_decode($response);
        
        return response()->success($decodeResult);
    }
    
    public function execute(Request $request){
        $response = $this->client->request('POST', $this->paymentUrl.'/'.$request->paymentId.'/execute' , [
            'headers' => [
                "Content-Type" => "application/json",
                "Authorization" => $this->accessToken,
            ],
            'json' => [
                "payer_id" => $request->PayerID,
            ]
        ])->getBody()->getContents();
        $decodeResult = json_decode($response);
 
        return response()->success($decodeResult);
    }
}
```

이제 클라이언트에서 테스트 버튼을 클릭하면 미리 필자가 정의한 API인 `/paypal/payment/create`를 통해 필자의 API서버로 결제 데이터가 전송되고, API서버는 다시 그 데이터를 가지고 Paypal서버와 통신 후 클라이언트로 결과를 반환해 줄 것이다.
그 후 클라이언트는 리턴된 데이터의 `link[1]`에 담긴 리다이렉트페이지를 그냥 열기만 하면 결제가 시작된다!
왜 `link[1]`인지는 아래에서 다시 설명하겠다.

이후 사용자는 Paypal로그인 상태에 따라 로그인페이지 또는 결제 확인 페이지로 이동하게되며, Paypal의 결제 확인 창에서 Continue버튼을 누르면 아까 우리가 `create`API를 통해 보내놓았던 `redirect_url`페이지로 랜딩된다.
이때 Paypal은 사용자가 최종 결제 확인을 했고, 이제 결제를 시작해도 된다는 데이터를 `redirect_url`뒤에 쿼리스트링의 형태로 붙혀서 보내준다.

이제 클라이언트와 서버의 기본적인 로직이 모두 준비되었다! 전체적인 플로우를 다시 설명하면 다음과 같다.

***
1. 클라이언트에서 API서버로 결제 생성 요청을 보낸다.
2. API서버는 받은 데이터를 가지고 다시 Paypal서버로 결제 생성 요청을 보내고 이후 클라이언트로 값을 반환해준다.
3. 클라이언트는 반환받은 데이터에 있는 `redirect_url`로 사용자를 리다이렉트 시킨다.
4. 이후 사용자는 이동한 Paypal페이지에서 로그인 및 간략한 결제정보 확인을 마치고 `Continue`버튼을 클릭한다.
5. `Continue`버튼이 클릭되면 Paypal은 결제 생성 요청에 담겨있던 `redirect_url`로 사용자를 리다이렉트 시킨다.
6. 이후 사용자는 리다이렉트된 페이지에서 최종 결제전 상세 결제 정보를 확인한다.
7. 사용자가 "최종결제"버튼을 클릭하면 클라이언트는 결제 실행 요청을 API서버로 보낸다.
8. API서버는 다시 Paypal서버로 이 요청을 전달하고, 클라이언트로 값을 반환해준다.
9. 결제의 실행결과에 따라 사용자는 해당 페이지로 다시 리다이렉트된다.
***

뭔가 굉장히 복잡해 보이지만 잘 보면 API서버는 거의 그냥 통신 셔틀이라고 보면 된다.
그러면 그냥 Paypal서버와 다이렉트로 통신하면 안될까? 라고 생각할 수 있지만 이는 보안과 직결되는 문제이다.
Paypal서버와 통신을 하기 위해서는 `client_key`와 `secret`이 필요한데, API서버를 중개하지 않고 Paypal서버와 바로 통신을 하려면 클라이언트가 이 2개의 값을 다 가지고 있어야 한다는 뜻이 된다.
하지만 알다시피 웹 상에서 클라이언트 소스는 공개되기가 쉽고 난독화를 한다고 해도 Object의 `key`같은 `String`변수는 난독화되지 않기 때문에 악의를 가진 사용자가 손쉽게 `client_key`와 `secret`을 탈취할 수 있다.
그래서 상대적으로 안전한 서버에 `secret`을 저장하고 클라이언트에는 `client_key`만 저장하는 식으로 2개의 값을 한번에 볼 수 없도록 나눠 놓는다.

### 실행결과
먼저, API서버를 통해 create요청을 진행한 결과, 필자는 다음과 같은 response를 받을 수 있었다.

<center>{% asset_img 'result-1.png' %}</center>

links라는 배열을 하나 받았는데, 각 인덱스의 의미는 이렇다.

0 - 결제의 상세 정보를 GET메소드로 확인해볼 수 있는 API의 URI
1 - Paypal의 결제페이지로 리다이렉트 시키는 URL
2 - 결제를 실행시킬 수 있는 URL

아까 위에서 설명한 `links[1]`의 의미를 이제 알 수 있을 것이다.
그리고 보내진 url의 host를 보면 전부 `sandbox.*`로 시작하는데 이는 현재 sandbox계정을 사용하여 테스트를 진행하고 있다는 뜻이다. 실제 운영 API에는 저 sandbox부분이 빠져있다.
그리고 이제 `links[1]`의 url로 리다이렉트를 시키면 당연히(...) 저 값들은 먼지가 되어 사라지게 된다. 쿠키에 담든 어떻게 사용은 할 수 있겠지만 어차피 또 보내주니까 미련없이 버리자.

필자도 리다이렉트를 안시키고 팝업으로 저 페이지를 열어보았는데 `401 Unauthrized`를 뱉으며 결제정보가 장렬히 산화하는 모습을 볼 수 있었다....
하지만 어차피 Paypal에 `create`요청을 날린 시점에서 Paypal서버에는 필자가 처음 보낸 `redirect_url`값이 저장되어있기 때문에 사용자가 Paypal페이지에서 결제확인을 완료하게 되면 다시 주도권은 필자 서비스로 돌아오게 된다.

자 이제 리다이렉트를 시켜보자.

<center>{% asset_img 'redirect1.png' %}</center>

그러면 이런 화면이 하나 뜬다. 만약 Paypal에 로그인이 안되어있다면 먼저 로그인페이지로 이동 후 로그인이 완료되면 이 페이지로 이동하게 될 것이다.
이 페이지에서 유저는 자신이 결제할 금액을 확인할 수 있으며 오른쪽 상단에 있는 카트모양 아이콘을 누르면 조금 더 상세한 정보가 나오긴 한다. 근데 알아보기 힘들 정도로 간략하게 적혀있어서 딱히 의미는 없을 것 같았다.
그리고 필자가 요청을 날린 통화단위는 `EUR`, 즉 유로화로 등록이 되어있던 상품이었지만 Paypal에서는 자동으로 사용자의 국가의 환율로 자동 환산을 해준다.
이제 사용자가 모든 항목을 확인하고 `Continue`버튼을 누르면 필자가 처음 `create`시 보냈던 `redirect_url`로 이동이 시작된다.

<center>{% asset_img 'redirect2.png' %}</center>

이 페이지는 필자가 테스트를 위해 임시로 만들어 놓은 페이지이고 실제 운영서버였다면 이 페이지는 최종결제 전 마지막으로 정보를 확인할 수 있는 페이지가 될 것이다.
이때 주목해야할 것은 이 페이지의 URL이다.

<center>{% asset_img 'url.png' %}</center>

쿼리스트링으로 페이팔이 보내준 `paymentId`와 `token`, `PayerID`가 들어있다. 그럼 이제 저 값들을 사용해서 다음 플로우를 진행하면 된다.
이 페이지의 Controller는 저 값들을 사용하여 디테일한 결제정보를 받아오는 로직과 결제를 실행하는 로직을 가진 메소드로 이루어져있다.
혹시 아까 위에서 정의한 Paypal서비스의 로직이 기억나지 않는다면 위에서 다시 보고 오자.

```js
(function() {
    'use strict';
 
    angular
    .module('app.pages.product')
    .controller('PaypalRedirectController', [
        '$rootScope', 'Restangular', 'PaypalService', '$location',
        PaypalRedirectController
    ]);
 
    /** @ngInject */
    function PaypalRedirectController(
        $rootScope, Restangular, PaypalService, $location
    ) {
        var vm = this;
        var queryString = $location.search(); // 페이팔에서 보내준 쿼리스트링을 가져온다
 
        vm.init = (init)();
        function init() {
            getPaymentInfo();
        }
 
        /**
         * @public
         * @method executePaypal
         */
        vm.executePaypal = executePaypal;
        function executePaypal() {
            // 실제 결제 실행 메소드
            PaypalService.execute(queryString).then(function(res) {
                console.log('EXECUTE RESULT -> ', res);
            });
        }
        
        /**
        * @private 
        * @method getPaymentInfo
        */
        function getPaymentInfo() {
            // 결제 정보 받아오는 메소드
            PaypalService.getPaymentInfo(queryString).then(function(res) {
                console.log('GET PAYMENT INFO -> ',res);
            });
        }
    }
})();
```

필자는 해당 페이지에 있는 버튼에 `excutePaypal`메소드를 클릭 이벤트로 걸어놓았다.
이제 유저가 저 버튼을 클릭하면 최종 결제가 실행되고 결과를 `response`로 받아볼 수 있다.

<center>{% asset_img 'result.png' %}</center>

정상적으로 결제가 진행되고 Paypal서버가 보내준 결과이다. `payer.status`가 `approved`라면 정상적으로 결제가 승인된 것이다.

이제 실제로 결제가 승인되었고 돈이 제대로 들어왔는지 확인해볼 차례이다.

https://www.sandbox.paypal.com/에 접속해서 구매자 계정으로 확인해본 상태이다.
구매내역에 정상적으로 12유로가 출금 되었다고 나와있다.
판매자 계정에도 정상적으로 12유로가 들어왔다고 적혀있다.

<center>
    {% asset_img 'customer.png' %}
    <sub>샌드박스의 구매 테스트 계정. 12유로가 출금 되었다.</sub>
    
    {% asset_img 'provider.png' %}
    <sub>샌드박스의 판매 테스트 계정. 최상단에 필자 이름과 함께 12유로가 들어와있다.</sub>
</center>

하지만 아직 완전한 처리가 이루어지지 않은 상태라 Payment status는 `Unclaimed`로 되어있다.
아직은 저게 현금화 된게 아니라 그냥 Paypal서버에 들어가있는 데이터 쪼가리일 뿐이다.
이제 Accept버튼을 눌러 판매자의 계좌로 입금을 진행하면 상태가 `Completed`로 전환되며 계좌에 `12EUR`가 `USD`로 환전되며 입금된다.

이상으로 Express Checkout에 대한 포스팅을 마치겠습니다.


