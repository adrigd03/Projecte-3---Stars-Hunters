<?php
namespace StarHunters;

use Ratchet\WebSocket\MessageComponentInterface;
use Ratchet\ConnectionInterface;

 class Game implements MessageComponentInterface{
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);

        echo "S'ha unit un jugador" . $conn->resourceId . "\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
    }

    public function onClose(ConnectionInterface $conn) {
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
    }

 }
?>