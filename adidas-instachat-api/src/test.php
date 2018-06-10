<?php

set_time_limit(0);
date_default_timezone_set('UTC');
error_reporting(E_ALL);
ini_set('display_errors', 1);


require __DIR__.'/../vendor/autoload.php';

/////// CONFIG ///////
$username = '9stories.red';
$password = 'pwpwpw';
// $massage_webhook = ;
$debug = true;
$truncatedDebug = true;
//////////////////////

$ig = new \InstagramAPI\Instagram($debug, $truncatedDebug);

try {
    $ig->login($username, $password);
} catch (\Exception $e) {
    echo 'Something went wrong: '.$e->getMessage()."\n";
    exit(0);
}

// Create main event loop.
$loop = \React\EventLoop\Factory::create();
if ($debug) {
    $logger = new \Monolog\Logger('rtc');
    $logger->pushHandler(new \Monolog\Handler\StreamHandler('php://stdout', \Monolog\Logger::INFO));
} else {
    $logger = null;
}
// Create HTTP server along with Realtime client.
$httpServer = new RealtimeHttpServer($loop, $ig, $logger);
// Run main loop.
$loop->run();

class RealtimeHttpServer
{
    const HOST = '0.0.0.0';
    const PORT = 1307;

    const TIMEOUT = 5;

    /** @var \React\Promise\Deferred[] */
    protected $_contexts;

    /** @var \React\EventLoop\LoopInterface */
    protected $_loop;

    /** @var \InstagramAPI\Instagram */
    protected $_instagram;

    /** @var \InstagramAPI\Realtime */
    protected $_rtc;

    /** @var \React\Http\Server */
    protected $_server;

    /** @var \Psr\Log\LoggerInterface */
    protected $_logger;

    /**
     * Constructor.
     *
     * @param \React\EventLoop\LoopInterface $loop
     * @param \InstagramAPI\Instagram        $instagram
     * @param \Psr\Log\LoggerInterface|null  $logger
     */
    public function __construct(
        \React\EventLoop\LoopInterface $loop,
        \InstagramAPI\Instagram $instagram,
        \Psr\Log\LoggerInterface $logger = null)
    {
        $this->_loop = $loop;
        $this->_instagram = $instagram;
        if ($logger === null) {
            $logger = new \Psr\Log\NullLogger();
        }
        $this->_logger = $logger;
        $this->_contexts = [];
        $this->_rtc = new \InstagramAPI\Realtime($this->_instagram, $this->_loop, $this->_logger);
        // $this->_rtc->on('client-context-ack', [$this, 'onClientContextAck']);
        $this->_rtc->on('error', [$this, 'onRealtimeFail']);

        $this->_rtc->on('thread-item-created', function ($threadId, $threadItemId, \InstagramAPI\Response\Model\DirectThreadItem $threadItem) {
            printf('[RTC] Item %s has been created in thread %s%s', $threadItemId, $threadId, PHP_EOL);
            
            $type = $threadItem->getItem_type();
            if ($type == 'text' || $type == 'reel_share') {
                if ($type == 'text') {
                    $text = $threadItem->getText();
                } else {
                    $text = 'Hi';
                }
                $data = array(
                    "messageId" => $threadItemId,
                    "userId" => $threadId,
                    "text" => $text,
                    "instagramUserId" => $threadItem->getUser_id()
                );
                $data_string = json_encode($data);
                printf('webhook prepered: %s%s', $data_string, PHP_EOL);
                $ch = curl_init('https://9chat.9roads.red/instagram-message');                                                                      
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
                curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
                curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
                    'Content-Type: application/json',                                                                                
                    'Content-Length: ' . strlen($data_string))                                                                       
                );
                printf('response result: %s%s', curl_exec($ch), PHP_EOL);
                printf('webhook done: %s%s', $data_string, PHP_EOL);
            }
        });

        $this->_rtc->start();
        $this->_startHttpServer();
    }

    /**
     * Gracefully stop everything.
     */
    protected function _stop()
    {
        // Initiate shutdown sequence.
        $this->_rtc->stop();
        // Wait 2 seconds for Realtime to shutdown.
        $this->_loop->addTimer(2, function () {
            // Stop main loop.
            $this->_loop->stop();
        });
    }

    /**
     * Called when fatal error has been received from Realtime.
     *
     * @param \Exception $e
     */
    public function onRealtimeFail(
        \Exception $e)
    {
        $this->_logger->error((string) $e);
        $this->_stop();
    }

    // public function onClientContextAck(
    //     \InstagramAPI\Realtime\Payload\Action\AckAction $ack)
    // {
    //     $context = $ack->getPayload()->getClientContext();

    //     foreach ($context['data'] as $data) {
    //         $data = json_decode($data);
    //         $this->_logger->info($data);
    //         if ($data['item_type'] == 'text') {
    //             $threadId = explode("/", $data['path'])[3];
    //             $text = $data['text'];

    //             $data = array("threadId" => threadId, "text" => text);
    //             $data_string = json_encode($data);                                                                   

    //             $ch = curl_init($massage_webhook);                                                                      
    //             curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
    //             curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
    //             curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
    //             curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
    //                 'Content-Type: application/json',                                                                                
    //                 'Content-Length: ' . strlen($data_string))                                                                       
    //             );
    //             curl_exec($ch);
    //         }
    //     }


    //     $this->_logger->info(sprintf('Received ACK for %s with status %s', $context, $ack->getStatus()));
    //     // Check if we have deferred object for this client_context.
    //     if (!isset($this->_contexts[$context])) {
    //         return;
    //     }
    //     // Resolve deferred object with $ack.
    //     $deferred = $this->_contexts[$context];
    //     $deferred->resolve($ack);
    //     // Clean up.
    //     unset($this->_contexts[$context]);
    // }

    /**
     * @param string|bool $context
     *
     * @return \React\Http\Response|\React\Promise\PromiseInterface
     */
    protected function _handleClientContext(
        $context)
    {
        // Reply with 503 Service Unavailable.
        if ($context === false) {
            return new \React\Http\Response(503);
        }
        // Set up deferred object.
        $deferred = new \React\Promise\Deferred();
        $this->_contexts[$context] = $deferred;
        // Reject deferred after given timeout.
        $timeout = $this->_loop->addTimer(self::TIMEOUT, function () use ($deferred, $context) {
            $deferred->reject();
            unset($this->_contexts[$context]);
        });
        // Set up promise.
        return $deferred->promise()
            ->then(function (\InstagramAPI\Realtime\Payload\Action\AckAction $ack) use ($timeout) {
                // Cancel reject timer.
                $timeout->cancel();
                // Reply with info from $ack.
                return new \React\Http\Response($ack->getStatusCode(), ['Content-Type' => 'text/json'], $ack->getPayload()->asJson());
            })
            ->otherwise(function () {
                // Called by reject timer. Reply with 504 Gateway Time-out.
                return new \React\Http\Response(200);
            });
    }


    public function onHttpRequest(
        \Psr\Http\Message\ServerRequestInterface $request)
    {
        $command = $request->getUri()->getPath();
        $params = $request->getQueryParams();
        switch ($command) {
            case '/send-message':
                return $this->_handleClientContext($this->_rtc->sendTextToDirect($params['userId'], $params['text']));
            case '/send-image':
                $filePath = './' . uniqid(rand(), true) . '.jpg';
                $ch = curl_init($params['imageUrl']);
                $fp = fopen($filePath, 'wb');
                curl_setopt($ch, CURLOPT_FILE, $fp);
                curl_setopt($ch, CURLOPT_HEADER, 0);
                curl_exec($ch);
                curl_close($ch);
                fclose($fp);
                $recipients = ['thread' => $params['userId']];
                $this->_instagram->direct->sendPhoto($recipients, $filePath);
                $this->_instagram->direct->sendText($recipients, $params['text']);
                return new \React\Http\Response(200);
            case '/set-typing':
                return $this->_handleClientContext($this->_rtc->indicateActivityInDirectThread($params['userId'], (bool) $params['flag']));
            case '/set-seen':
                $context = $this->_rtc->markDirectItemSeen($params['userId'], $params['messageId']);
                return new \React\Http\Response($context !== false ? 200 : 503);
            case '/send-like':
                return $this->_handleClientContext($this->_rtc->sendLikeToDirect($params['userId']));
            case '/like-item':
                return $this->_handleClientContext($this->_rtc->sendReactionToDirect($params['userId'], $params['messageId'], 'like'));
            default:
                return new \React\Http\Response(404);
        }
    }
    /**
     * Init and start HTTP server.
     */
    protected function _startHttpServer()
    {
        // Create server socket.
        $socket = new \React\Socket\Server(self::HOST.':'.self::PORT, $this->_loop);
        $this->_logger->info(sprintf('Listening on http://%s', $socket->getAddress()));
        // Bind HTTP server on server socket.
        $this->_server = new \React\Http\Server([$this, 'onHttpRequest']);
        $this->_server->listen($socket);
    }
}