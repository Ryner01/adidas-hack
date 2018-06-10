<?php

set_time_limit(0);
date_default_timezone_set('UTC');
require __DIR__.'/../vendor/autoload.php';
/////// CONFIG ///////
$username = '9stories.red';
$password = 'pwpwpw';
$massage_webhook = 'http://9chat.9roads.red/instagram-message';
$debug = true;
$truncatedDebug = false;
//////////////////////


$ig = new \InstagramAPI\Instagram($debug, $truncatedDebug);
try {
    $ig->login($username, $password);
} catch (\Exception $e) {
    echo 'Something went wrong: '.$e->getMessage()."\n";
    exit(0);
}

$loop = \React\EventLoop\Factory::create();
$httpServer = new RealtimeHttpServer($loop, $ig);
$loop->run();
class RealtimeHttpServer
{
    const HOST = '127.0.0.1';
    const PORT = 1307;
    const TIMEOUT = 5;
    protected $_contexts;
    protected $_loop;
    protected $_instagram;
    protected $_rtc;
    protected $_server;

    public function __construct(
        \React\EventLoop\LoopInterface $loop,
        \InstagramAPI\Instagram $instagram)
    {
        $this->_loop = $loop;
        $this->_instagram = $instagram;
        $this->_contexts = [];
        $this->_rtc = new \InstagramAPI\Realtime($this->_instagram, $this->_loop);
        $this->_rtc->on('client-context-ack', [$this, 'onClientContextAck']);
        $this->_rtc->on('error', [$this, 'onRealtimeFail']);
        $this->_rtc->start();
        $this->_startHttpServer();
    }

    protected function _stop()
    {
        $this->_rtc->stop();
        $this->_loop->addTimer(2, function () {
            $this->_loop->stop();
        });
    }

    public function onRealtimeFail(
        \Exception $e)
    {
        $this->_stop();
    }

    public function onClientContextAck(
        \InstagramAPI\Realtime\Payload\Action\AckAction $ack)
    {
        $context = $ack->getPayload()->getClientContext();
        // $this->_logger->info(sprintf('Received ACK for %s with status %s', $context, $ack->getStatus()));

        if (!isset($this->_contexts[$context])) {
            return;
        }

        $deferred = $this->_contexts[$context];
        $deferred->resolve($ack);

        unset($this->_contexts[$context]);
    }

    protected function _handleClientContext(
        $context)
    {
        if ($context === false) {
            return new \React\Http\Response(503);
        }

        $deferred = new \React\Promise\Deferred();
        $this->_contexts[$context] = $deferred;

        $timeout = $this->_loop->addTimer(self::TIMEOUT, function () use ($deferred, $context) {
            $deferred->reject();
            unset($this->_contexts[$context]);
        });
        return $deferred->promise()
            ->then(function (\InstagramAPI\Realtime\Payload\Action\AckAction $ack) use ($timeout) {
                $timeout->cancel();
                return new \React\Http\Response($ack->getStatusCode(), ['Content-Type' => 'text/json'], $ack->getPayload()->asJson());
            })
            ->otherwise(function () {
                return new \React\Http\Response(504);
            });
    }

    public function onHttpRequest(
        \Psr\Http\Message\ServerRequestInterface $request)
    {
        $command = $request->getUri()->getPath();
		$params = json_decode($request->getBody(), true);
		print_r($params);
        switch ($command) {
            case '/message':
                return $this->_handleClientContext($this->_rtc->sendTextToDirect($params['userId'], $params['text']));
            case '/typing':
                return $this->_handleClientContext($this->_rtc->indicateActivityInDirectThread($params['userId'], (bool) $params['flag']));
            case '/seen':
                $context = $this->_rtc->markDirectItemSeen($params['userId'], $params['messageId']);
                return new \React\Http\Response($context !== false ? 200 : 503);
            case '/like':
                return $this->_handleClientContext($this->_rtc->sendLikeToDirect($params['userId']));
            case '/like-item':
                return $this->_handleClientContext($this->_rtc->sendReactionToDirect($params['userId'], $params['messageId'], 'like'));
            default:
                return new \React\Http\Response(404);
        }
    }

    protected function _startHttpServer()
    {
        $socket = new \React\Socket\Server(self::HOST.':'.self::PORT, $this->_loop);
        $this->_server = new \React\Http\Server([$this, 'onHttpRequest']);
        $this->_server->listen($socket);
    }
}