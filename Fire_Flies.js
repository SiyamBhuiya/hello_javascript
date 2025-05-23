var canvas, context,
            canvasWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth),
            canvasHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight),
            requestAnimationFrame = window.requestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) { setTimeout(callback, 1000 / 60); };
        var persons = [],
            numberOfFirefly = 30,
            birthToGive = 25;

        var colors = [];
        colors[2] = [];
        colors[2]['background'] = '#2F294F';
        colors[2][1] = 'rgba(74,49,89,';
        colors[2][2] = 'rgba(130,91,109,';
        colors[2][3] = 'rgba(185,136,131,';
        colors[2][4] = 'rgba(249,241,204,';

        var colorTheme = 2,
            mainSpeed = 1;

        function getRandomInt(min, max, exept) {
            var i = Math.floor(Math.random() * (max - min + 1)) + min;
            if (typeof exept == "undefined") return i;
            else if (typeof exept == 'number' && i == exept) return getRandomInt(min, max, exept);
            else if (typeof exept == "object" && (i >= exept[0] && i <= exept[1])) return getRandomInt(min, max, exept);
            else return i;
        }

        function degToRad(deg) {
            return deg * (Math.PI / 180);
        }

        function Firefly(id) {
            this.id = id;
            this.width = getRandomInt(3, 6);
            this.height = this.width;
            this.x = getRandomInt(0, (canvasWidth - this.width));
            this.y = getRandomInt(0, (canvasHeight - this.height));
            this.speed = (this.width <= 10) ? 2 : 1;
            this.alpha = 1;
            this.alphaReduction = getRandomInt(1, 3) / 1000;
            this.color = colors[colorTheme][getRandomInt(1, colors[colorTheme].length - 1)] || 'rgba(249,241,204,';
            this.direction = getRandomInt(0, 360);
            this.turner = getRandomInt(0, 1) == 0 ? -1 : 1;
            this.turnerAmp = getRandomInt(1, 2);
            this.isHit = false;
            this.stepCounter = 0;
            this.changeDirectionFrequency = getRandomInt(1, 200);
            this.shape = 2;
            this.shadowBlur = getRandomInt(5, 25);
        }

        Firefly.prototype.stop = function () {
            this.update();
        }

        Firefly.prototype.walk = function () {
            var next_x = this.x + Math.cos(degToRad(this.direction)) * this.speed,
                next_y = this.y + Math.sin(degToRad(this.direction)) * this.speed;

            if (next_x >= (canvasWidth - this.width) && (this.direction < 90 || this.direction > 270)) {
                next_x = canvasWidth - this.width;
                this.direction = getRandomInt(90, 270, this.direction);
            }
            if (next_x <= 0 && (this.direction > 90 && this.direction < 270)) {
                next_x = 0;
                var exept = [90, 270];
                this.direction = getRandomInt(0, 360, exept);
            }
            if (next_y >= (canvasHeight - this.height) && (this.direction > 0 && this.direction < 180)) {
                next_y = canvasHeight - this.height;
                this.direction = getRandomInt(180, 360, this.direction);
            }
            if (next_y <= 0 && (this.direction > 180 && this.direction < 360)) {
                next_y = 0;
                this.direction = getRandomInt(0, 180, this.direction);
            }

            this.x = next_x;
            this.y = next_y;

            this.stepCounter++;

            if (this.changeDirectionFrequency && this.stepCounter == this.changeDirectionFrequency) {
                this.turner = this.turner == -1 ? 1 : -1;
                this.turnerAmp = getRandomInt(1, 2);
                this.stepCounter = 0;
                this.changeDirectionFrequency = getRandomInt(1, 200);
            }

            this.direction += this.turner * this.turnerAmp;

            this.update();
        }

        Firefly.prototype.takeOppositeDirection = function () {
            if ((this.direction >= 0 && this.direction < 90) || (this.direction > 270 && this.direction <= 360)) {
                this.direction = getRandomInt(90, 270);
                return;
            }
            if (this.direction > 90 && this.direction < 270) {
                var exept = [90, 270];
                this.direction = getRandomInt(0, 360, exept);
                return;
            }
            if (this.direction > 0 && this.direction < 180) {
                this.direction = getRandomInt(180, 360);
                return;
            }
            if (this.direction > 180) {
                this.direction = getRandomInt(0, 180);
            }
        }

        Firefly.prototype.update = function () {
            context.beginPath();
            context.fillStyle = this.color + this.alpha + ")";
            context.arc(this.x + (this.width / 2), this.y + (this.height / 2), this.width / 2, 0, 2 * Math.PI, false);
            context.shadowColor = this.color + this.alpha + ")";
            context.shadowBlur = this.shadowBlur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fill();

            if (this.id > 15) {
                this.alpha -= this.alphaReduction;
                if (this.alpha <= 0) this.die();
            }
        }

        Firefly.prototype.die = function () {
            persons[this.id] = null;
            delete persons[this.id];
        }

        window.onload = function () {
            canvas = document.getElementById('canvas');
            context = canvas.getContext('2d');
            canvas.setAttribute('width', canvasWidth);
            canvas.setAttribute('height', canvasHeight);
            start();
        }

        function start() {
            instantiatePopulation();
            animate();
        }

        function instantiatePopulation() {
            var i = 0;
            while (i < numberOfFirefly) {
                persons[i] = new Firefly(i);
                i++;
            }
        }

        function animate() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();

            persons_order = persons.filter(p => p).slice(0);
            persons_order.sort(function (a, b) {
                return a.y - b.y;
            });

            for (var i in persons_order) {
                var u = persons_order[i].id;
                persons[u].walk();
            }

            requestAnimationFrame(animate);
        }

        function giveBirth(e, u) {
            var i = persons.length;
            persons[i] = new Firefly(i);
            persons[i].x = e.layerX;
            persons[i].y = e.layerY;

            if (u > 1) giveBirth(e, u - 1);
        }

        window.addEventListener('DOMContentLoaded', function () {
            canvas = document.getElementById('canvas');
            canvas.onclick = function (e) {
                giveBirth({ layerX: e.offsetX, layerY: e.offsetY }, birthToGive);
            };
        });