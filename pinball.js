window.onload = function() {
  var kWidth = 400;
  var kHeight = 400;
  Crafty.init(kWidth, kHeight);
  Crafty.canvas.init();

  Crafty.scene("main-board", function() {
    Crafty.background("#000000");

    Crafty.c("PaddleControl", {
      _speed: 3,
      _bounce: -25,
      _theta: 0,
      _delta: 5,

      init: function() {
        this.requires("Keyboard");
      },

      paddleControl: function(speed) {
        if (speed) this._speed = speed;

        this.bind("EnterFrame", function() {
          if (this.disableControls) return;
          if (this.isDown("RIGHT_ARROW")) {
            this.x += this._speed;
          }
          else if (this.isDown("LEFT_ARROW")) {
            this.x -= this._speed;
          }
          else {
            this.vector = {x: 0, y: 0};
          }
          /*
          if (this.isDown("LEFT_ARROW")) {
            this._theta -= this._delta;
            this.rotate({o: {x: 0, y: 500}, theta: this._theta});
          }
          else if (this.isDown("RIGHT_ARROW")) {
            this._theta += this._delta;
            this.rotate({o: {x: 0, y: 500}, theta: this._theta});
          }
          */
        });

        return this;
      }
    });

    Crafty.c("FlipperControl", {
      _key: "LEFT_ARROW",
      _rot_origin: {x: 0, y: 500},
      _bounce: -25,
      _restangle: 0,
      _extendangle: 45,
      _theta: 0,
      _delta: 5,
      _inverted: 1,

      init: function() {
        this.requires("Keyboard");
      },

      flipperControl: function(key, origin, theta, delta, restangle, extendangle, inverted) {
        if (key) this._key = key;
        if (origin) this._rot_origin = origin;
        if (theta){
          this._theta = theta;
          this.rotate({o: this._rot_origin, theta: this._theta});
        }
        if (delta) this._delta = delta;
        if (restangle) this._restangle = restangle;
        if (extendangle) this._extendangle = extendangle;
        if (inverted) this._inverted = inverted;

        this.bind("EnterFrame", function() {
          if (this.disableControls) return;
          if (this.isDown(this._key)) {
            this._theta -= this._delta;
            if (this._inverted * this._theta < this._inverted * this._extendangle) this._theta = this._extendangle;
            this.rotate({o: this._rot_origin, theta: this._theta});
          }
          else if (this._inverted * this._theta < this._inverted * this._restangle) {
            this._theta += this._delta;
            this.rotate({o: this._rot_origin, theta: this._theta});
          }
        });

        return this;
      }
    });

    Crafty.c("PinballPhysics", {
      _gravity: 0.2,
      _vector: {x: 0, y: 0},
      _term_speed: 1,
      _friction: 0.99,

      init: function() {
        this.requires("2D, Collision");
      },

      pinballPhysics: function(gravity, vector, term_speed) {
        if (gravity) this._gravity = gravity;
        if (vector) this._vector = vector;
        if (term_speed) this._term_speed = term_speed;

        this.bind("EnterFrame", this._enterframe);

        return this;
      },

      _enterframe: function() {
        this._vector.x *= this._friction;
        this._vector.y *= this._friction;

        if (this._vector.y > this._term_speed) {
          this._vector.y = this._term_speed;
        }
        else {
          this._vector.y += this._gravity;
        }

        if (this._vector.x > this._term_speed) {
          this._vector.x = this._term_speed;
        }

        this.x += this._vector.x;
        this.y += this._vector.y;

        if (this.x < 0) {
          this.x = 0;
        }
        else if (this.x > kWidth) {
          this.x = kWidth;
        }
        if (this.y < 0) {
          this.y = 0;
        }
        else if (this.y > kHeight) {
          this.y = kHeight;
        }
      },

      applyVector: function(appliedVector) {
        this._vector.x += appliedVector.x;
        this._vector.y += appliedVector.y;

        return this;
      },

      reflectVector: function(surfaceNormal) {
        //console.log("surfaceNormal: [" + surfaceNormal.x + ", " + surfaceNormal.y + "]");
        this._vector.x = 2 * (surfaceNormal.x * this._vector.x + surfaceNormal.y * this._vector.y) * surfaceNormal.x - this._vector.x;
        this._vector.y = 2 * (surfaceNormal.x * this._vector.x + surfaceNormal.y * this._vector.y) * surfaceNormal.y - this._vector.y;

        return this;
      },

      blockGravity: function() {
        this._vector.y -= this._gravity;
      },

      bounceVector: function(bounce) {
        this._vector.x *= bounce;
        this._vector.y *= bounce;
      }
    });

    var ball = Crafty.e("ball, 2D, Canvas, Collision, Color, PinballPhysics");
    ball.attr({x: 5*(Math.random()*4+2), y: 10, w: 8, h: 8});
    ball.color("#cccccc");
    ball.collision(Crafty.circle({x: ball.x, y: ball.y, radius: ball.w}));
    ball.pinballPhysics(0.2, {x: 0, y: 0}, 8);

    //var paddle = Crafty.e("paddle, 2D, Canvas, Collision, Color, Keyboard, PaddleControl");
    //paddle.attr({x: -60, y: kHeight - 20, w: 150, h: 20});
    //paddle.color("#cc9933");
    //paddle.collision();
    //paddle.paddleControl(3);
    var lflipper = Crafty.e("flipper, 2D, Canvas, Collision, Color, Keyboard, FlipperControl");
    //lflipper.attr({x: kWidth/2 - 70, y: kHeight - 47, w: 60, h: 20});
    lflipper.attr({x: 0, y: kHeight - 47, w: 60, h: 20});
    lflipper.color("#cc9933");
    lflipper.collision();
    lflipper.flipperControl("LEFT_ARROW", {x: lflipper.x, y: lflipper.y}, 20, 20, 40, -20);

    //var rflipper = Crafty.e("flipper, 2D, Canvas, Collision, Color, Keyboard, FlipperControl");
    //rflipper.attr({x: kWidth/2 + 10, y: kHeight - 47, w: 60, h: 20});
    //rflipper.color("#cc9933");
    //rflipper.collision();
    //rflipper.flipperControl("RIGHT_ARROW", {x: rflipper.x + rflipper.w, y: rflipper.y}, -20, -20, -20, 20, -1);

    var bumper1 = Crafty.e("bumper, 2D, Canvas, Collision, Color");
    bumper1.attr({x: 50, y: 150, w: 25, h: 25});
    bumper1.color("#9933cc");
    bumper1.collision();

    var bumper2 = Crafty.e("bumper, 2D, Canvas, Collision, Color");
    bumper2.attr({x: 200, y: 150, w: 25, h: 25});
    bumper2.color("#9933cc");
    bumper2.collision();

    var bumper3 = Crafty.e("bumper, 2D, Canvas, Collision, Color");
    bumper3.attr({x: 200, y: 300, w: 25, h: 25});
    bumper3.color("#9933cc");
    bumper3.collision();

    var wall1 = Crafty.e("wall, 2D, Canvas, Collision, Color");
    wall1.attr({x: -30, y: 0, w: 35, h: kHeight - 20});
    wall1.color("#33cc99");
    wall1.collision();

    var wall2 = Crafty.e("wall, 2D, Canvas, Collision, Color");
    wall2.attr({x: kWidth - 5, y: 0, w: 35, h: kHeight - 20});
    wall2.color("#33cc99");
    wall2.collision();

    var wall3 = Crafty.e("wall, 2D, Canvas, Collision, Color");
    wall3.attr({x: 0, y: -30, w: kWidth, h: 35});
    wall3.color("#33cc99");
    wall3.collision();

    var catchLeftFoul = Crafty.e("catch, 2D, Canvas, Collision, Color");
    catchLeftFoul.attr({x: 5, y: -30, w: 10, h: kHeight - 20});
    catchLeftFoul.color("#cc3399");
    catchLeftFoul.collision();

    //var wall4 = Crafty.e("wall, 2D, Canvas, Collision, Color");
    //wall4.attr({x: 0, y: kHeight - 80, w: kWidth/2 - 50, h: 35});
    //wall4.color("#33cc99");
    //wall4.collision();
    //wall4.rotate({o: {x: wall4.x, y: wall4.y}, theta: 20});

    //var wall5 = Crafty.e("wall, 2D, Canvas, Collision, Color");
    //wall5.attr({x: kWidth - kWidth/2 + 50, y: kHeight - 80, w: kWidth/2 - 50, h: 35});
    //wall5.color("#33cc99");
    //wall5.collision();
    //wall5.rotate({o: {x: wall5.x + wall5.w, y: wall5.y}, theta: -20});

    ball.onHit('flipper', function(hitdata) {
      //console.log(lflipper._theta);
      ball.reflectVector(hitdata[0].normal);
      ball.blockGravity();
      //ball.applyMomentum();
      ball.bounceVector(2.5);
    });
    ball.onHit('bumper', function(hitdata) {
      ball.reflectVector(hitdata[0].normal);
      ball.blockGravity();
      ball.bounceVector(1.5);
    });
    ball.onHit('wall', function(hitdata) {
      console.log(hitdata[0].normal);
      ball.reflectVector(hitdata[0].normal);
      ball.blockGravity();
      //ball.bounceVector(1.3);
    });
  });

  Crafty.scene("main-board");
};
