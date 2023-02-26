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
        
        $this->clients->attach($conn);
        

        echo "S'ha unit un jugador" . $conn->resourceId . "\n";

        $player = new Player($conn, false);
        $player->setNom('jugador' . $conn->resourceId);
        $this->settings->addPlayer($player);

    }

    public function onMessage(ConnectionInterface $from, $msg) {
        if($msg == 'admin'){
            $this->admin = $from;
            foreach ($this->settings->getPlayers() as $player) {
                if ($player->getClient()->resourceId === $from->resourceId) {
                    $player->setAdmin();
                }
            }
        }
       
        if($from == $this->admin){
            //Si es el missatge diu estrella enviar posició de estrella a tots els jugadors
            if($msg == 'estrella'){
                $this->broadcast($this->settings->posEstrella());
                if($this -> settings -> getEstrelles() > 3){
                    $resposta['accio'] = "estrellaCaducada";
                    $this->broadcast(json_encode($resposta));
                    $this -> settings -> setEstrelles();
                    echo $this -> settings -> getEstrelles();

                }
            }

        }
        //Comprobem si el missatge conté on objecte amb la accio BorrarEstrella i fem u broadcast de la estrella a borrar
        $missatge = json_decode($msg);
        if($missatge->accio == 'borrarEstrella'){
            $resposta['accio'] = 'borrarEstrella';
            $resposta['index'] = $missatge->index;
            $this->broadcast(json_encode($resposta),[$from]);

            $this -> settings -> setEstrelles();

        } elseif ($missatge->accio == 'novaNau') {
            // Guardem les coordenades de la nau
            $player = $this->settings->getPlayer($from);
            $player->setCoords($missatge->coords);
            
            // Enviem a tots els jugadors la posició de la nau 
            $resposta = array('accio' => 'nauEnemiga', 'id' => $player->getNom(), 'coords' => $missatge->coords);
            $this->broadcast(json_encode($resposta), [$from]);
            
            // Enviem a la nova nau la posició dels jugadors que s'han connectat abans
            foreach ($this->settings->getPlayers() as $p) {
                if ($p->getClient()->resourceId != $from->resourceId) {
                    $resposta = array('accio' => 'nauEnemiga', 'id' => $p->getNom(), 'coords' => $p->getCoords());
                    $from->send(json_encode($resposta));
                }
            }
        }

        
    }

    public function onClose(ConnectionInterface $conn) {
        $missatge = array(
            'accio' => 'jugadorDesconnectat',
            'jugador' => 'jugador'.$conn->resourceId
        );
        $player = $this->settings->removePlayer($conn);
        $this->broadcast(json_encode($missatge));
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