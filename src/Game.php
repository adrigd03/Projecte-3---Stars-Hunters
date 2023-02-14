<?php
namespace StarHunters;

use Ratchet\WebSocket\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use StarHunters\Settings;

 class Game implements MessageComponentInterface{
    protected $clients;
    protected $admin;
    protected $settings;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->settings = new Settings();
    }

    public function onOpen(ConnectionInterface $conn) {
        if(empty($this->clients)){
            $this->admin = $conn;
        }
        $this->clients->attach($conn);
        $this->settings->addPlayer($conn);

        echo "S'ha unit un jugador " . $conn->resourceId . "\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {

    }

    public function onClose(ConnectionInterface $conn) {
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
    }

    public function broadcast($msg){
        foreach ($this->clients as $client) {
            $client->send($msg);
        }
    }

 }
?>