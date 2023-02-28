<?php
namespace StarHunters;

use Ratchet\WebSocket\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use StarHunters\Settings;

 class Game implements MessageComponentInterface{
    protected $clients;
    protected $admin;
    protected $settings;
    protected $gameStarted = false;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->settings = new Settings();
    }

    public function onOpen(ConnectionInterface $conn) {

        if($this->gameStarted === true){
            // Si la partida ja ha començat, informem al jugador de que no es pot connectar i tanquem la connexió
            $conn->send(json_encode(array(
                'accio' => 'error',
                'missatge' => 'No et pots connectar a mitja partida!'
            )));
            $conn->close();
        } else {
            $this->clients->attach($conn);

            echo "S'ha unit un jugador" . $conn->resourceId . "\n";
            
            $player = new Player($conn, false);
            $player->setNom('jugador' . $conn->resourceId);
            $this->settings->addPlayer($player);

            // Informem al nou jugador del seu nom
            $missatge = array(
                'accio' => 'nom',
                'nom' => $player->getNom()
            );
            $conn->send(json_encode($missatge));
        }
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        if($msg == 'admin'){
            if (!empty($this->admin)) {
             $from->send(json_encode(array(
                'accio' => 'error',
                'missatge' => 'Només hi pot haver un administrador!'
             )));   
            } else {
                $this->admin = $from;
                foreach ($this->settings->getPlayers() as $player) {
                    if ($player->getClient()->resourceId === $from->resourceId) {
                        $player->setAdmin();
                    }
                }
            }
        }
       
        if($from == $this->admin){
            //Si es el missatge diu estrella enviar posició de estrella a tots els jugadors
            if($msg == 'estrella'){
                $this->broadcast($this->settings->posEstrella());
                if($this->settings->getEstrelles() > 3){
                    $resposta['accio'] = "estrellaCaducada";
                    $this->broadcast(json_encode($resposta));
                    $this->settings->restarEstrella();
                }
            }

        }
        //Comprobem si el missatge conté on objecte amb la accio BorrarEstrella i fem u broadcast de la estrella a borrar
        $missatge = json_decode($msg);
        if(isset($missatge->accio) && $missatge->accio == 'borrarEstrella'){
            $this->settings->restarEstrella();
            $resposta['accio'] = 'borrarEstrella';
            $resposta['index'] = $missatge->index;
            $this->broadcast(json_encode($resposta),[$from]);
            // Comprovem si el jugador té la puntuació necessaria per guanyar
            $player = $this->settings->getPlayer($from);
            $player->score();

            // Si es el cas ho comuniquem a tots i resetejem la partida
            if ($player->getStars() >= $this->settings->getStars()) {
                $response = $this->settings->missatgeGuanyador($player->getNom());
                $this->broadcast(json_encode($response));

                $this->settings->resetGame();
            }

        } elseif (isset($missatge->accio) && $missatge->accio == 'novaNau') {
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

        } elseif (isset($missatge->accio) && $missatge->accio == 'movimentNau') {
            $player = $this->settings->getPlayer($from);
            $player->setCoords($missatge->coords);

            // Enviem a tots els jugadors la posició de la nau 
            $resposta = array('accio' => 'nauMoguda', 'id' => $player->getNom(), 'coords' => $missatge->coords, 'angle' => $missatge->angle);
            $this->broadcast(json_encode($resposta), [$from]);

            // Si arriba un missatge amb la acció settings, configurem la partida
        } else if (isset($missatge->accio) && $missatge->accio == 'settings' && $from == $this->admin) {
            $this->settings->setWidth($missatge->width);
            $this->settings->setHeight($missatge->height);
            $this->settings->setStars($missatge->n_estrelles);
            
            $resposta = array(
                'accio' => 'settings',
                'width' => $this->settings->getWidth(),
                'height' => $this->settings->getHeight()
            );
            $this->broadcast(json_encode($resposta));
        } else if (isset($missatge->accio) && $missatge->accio == 'engegar' && $from == $this->admin) {
            $this->gameStarted = true;
            $resposta = array(
                'accio' => 'engegar'
            );
            $this->broadcast(json_encode($resposta));
        } else if (isset($missatge->accio) && $missatge->accio == 'aturar' && $from == $this->admin) {
            $this->gameStarted = false;
            $this->settings->resetEstrelles();
            $resposta = array(
                'accio' => 'aturar'
            );
            $this->broadcast(json_encode($resposta));
        }
    }

    public function onClose(ConnectionInterface $conn) {
        if ($conn === $this->admin) {
            $this->admin = null;
            $this->broadcast(json_encode(array(
                'accio' => 'error',
                'missatge' => 'Es necessita un admin per poder jugar'
            )));
        }

        $missatge = array(
            'accio' => 'jugadorDesconnectat',
            'jugador' => 'jugador'.$conn->resourceId
        );
        $this->settings->removePlayer($conn);
        $this->clients->detach($conn);

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