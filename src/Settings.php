<?php
    namespace StarHunters;

    class Settings{

        protected $height = 480;
        protected $width = 640;
        protected $star_number;
        protected $players;
        protected $estrelles = 0;

        public function __construct()
        {
            $this->players = array();
        }

        public function getHeight(){
            return $this->height;
        }

        public function getWidth(){
            return $this->width;
        }
        public function getEstrelles(){
            return $this->estrelles;
        }

        public function resetEstrelles(){
            $this->estrelles = 0;
        }

        public function restarEstrella(){
            $this->estrelles--;
        }

        public function getStars(){
            return $this->star_number;
        }

        public function getPlayers(){
            return $this->players;
        }

        public function getPlayer($playerConn){
            foreach ($this->players as $player) {
                if ($player->getClient() == $playerConn) {
                    return $player;
                }
            }
        }

        public function setHeight($height){
            $this->height = $height;
        }

        public function setWidth($width){
            $this->width = $width;
        }

        public function setStars($stars){
            $this->star_number = $stars;
        }

        public function addPlayer($player){
            array_push($this->players, $player);
        }

        public function removePlayer($playerConn){
            foreach ($this->players as $player) {
                if ($player->getClient() == $playerConn) {
                    $index = array_search($player, $this->players);
                    array_splice($this->players,$index,1);
                }
            }

        }

        public function flush_players(){
            $this->players = array();
        }
        //Calcula la posició de les següents estrelles que apareixeran
         public function posEstrella(){
            $posicio['accio'] = 'estrella';
            $posicio['x'] = rand(5,$this->width);
            $posicio['y'] = rand(5,$this->height);
            $this->estrelles++;
             return json_encode($posicio);
        }

    }
?>