<?php 
    namespace StarHunters;

    class Player{
        protected $nom;
        protected $client;
        protected $admin;
        protected $coords;
        protected $stars;

        public function __construct($conn, $admin)
        {
            $this->client = $conn;
            $this->admin = $admin;
            $this->stars = 0;
        }

        public function getClient(){
            return $this->client;
        }

        public function isAdmin(){
            return $this->admin;
        }

        public function getCoords(){
            return $this->coords;
        }

        public function getStars(){
            return $this->stars;
        }

        public function getNom(){
            return $this->nom;
        }

        public function setNom($nom){
            $this->nom = $nom;
        }

        public function setClient($client){
            $this->client = $client;
        }

        public function setAdmin(){
            $this->admin = true;
        }

        public function setCoords($coords){
            $this->coords = $coords;
        }

        public function setStars($stars){
            $this->stars = $stars;
        }

        public function score(){
            $this->stars++;
        }

    }
?>