<?php
    namespace StarHunters;

    class Settings{

        protected $height;
        protected $width;
        protected $star_number;
        protected $players;

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

        public function getStars(){
            return $this->star_number;
        }

        public function getPlayers(){
            return $this->players;
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

        public function flush_players(){
            $this->players = array();
        }

    }
?>