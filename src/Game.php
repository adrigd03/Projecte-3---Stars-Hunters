<?php
namespace StarHunters;

use Ratchet\WebSocket\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use StarHunters\Settings;

 class Game implements MessageComponentInterface{
    protected $clients;
    protected $admin;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        if(empty($this->clients)){
            $this->admin = $conn;
        }
        $this->clients->attach($conn);

        echo "S'ha unit un jugador" . $conn->resourceId . "\n";
        
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        if($msg == 'admin'){
            $this->admin = $from;
        }

        if($from == $this->admin){
            //Si es el missatge diu estrella enviar posició de estrella a tots els jugadors
            if($msg == 'estrella'){
                
            }

        }
        $from->send('kjasvblh');

        
    }

    public function onClose(ConnectionInterface $conn) {
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
    }

    
   

 }
?>