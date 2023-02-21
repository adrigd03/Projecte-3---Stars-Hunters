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

        echo "S'ha unit un jugador" . $conn->resourceId . "\n";
        
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        if($msg == 'admin'){
            $this->admin = $from;
        }
        echo $msg;
        if($from == $this->admin){
            //Si es el missatge diu estrella enviar posició de estrella a tots els jugadors
            if($msg == 'estrella'){
                $this->broadcast($this->settings->posEstrella());
            }

        }

        $msg = json_decode($msg);
        if($msg->accio == 'BorrarEstrella'){
            
        }
        $from->send('kjasvblh');

        
    }

    public function onClose(ConnectionInterface $conn) {
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
    }

    public function broadcast($msg,$excludedClients = []){
        foreach ($this->clients as $client) {
            if(!in_array($client, $excludedClients)){
                $client->send($msg);
            }
        }
    }

 }
?>