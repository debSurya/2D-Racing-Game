var gameModule = {
    init: function () {
        $(".back-panel").hide();
        $(".game-name").off("click").on("click", gameModule.startGameEvent);
    },
    score: 0,
    crashCount: 0,
    firstCar: 1,
    shiftCount: 0,
    speedCount: 1.5,
    timerCount: 1,
    carShiftCount: 2,
    horizontalShift: 0,
    verticalShift: undefined,
    leftMaxMin: undefined,
    rightMaxMin: undefined,
    onCrash: 1,
    carSpeed: 0,
    carIndex: 0,
    carPosition: [],
    carMotion: [],
    randomCars: [],
    obstacleCars: [],
    collisionHolder: undefined,
    selectedKey: {},
    enemyCar: undefined,
    scoreHolder: undefined,
    trackWidth: undefined,
    primaryCar: undefined,
    trackContainer: undefined,
    shiftCarLimit: undefined,
    //the beginning of the game
    startGameEvent: function () {
        $(".intro-panel").hide();
        $(".back-panel").show();
        gameModule.initializeElements();
        gameModule.shiftTrack();
    },
    //sets the value of the pressed key to true in the selectedKey object's keyCode property
    keyCodeSetter: function (event) {
        gameModule.selectedKey[event.which] = true;
        if (gameModule.onCrash) {
            var angle = undefined;
            switch (event.which) {
                case 37:
                    {
                        angle = -6;
                        break;
                    }
                case 39:
                    {
                        angle = 6;
                    }
            }
            $(".primary-car").css({
                "transform": "rotate(" + angle + "deg)",
                "-moz-transform": "rotate(" + angle + "deg)"
            });
        }
    },
    //sets the value of the pressed key on keyup to false in the selectedKey object's keyCode property
    keyCodeRemover: function (event) {
        gameModule.selectedKey[event.which] = false;
        $(".primary-car").css({
            "transform": "rotate(0deg)",
            "-moz-transform": "rotate(0deg)"
        });
    },
    //loads the cars to be appended and the necessary widths and heights
    initializeElements: function () {
        $(document).off("keydown").on("keydown", gameModule.keyCodeSetter);
        $(document).off("keyup").on("keyup", gameModule.keyCodeRemover);
        $(".gameover-panel").off("click").on("click", gameModule.resetGame).hide();
        for (var i = 1; i < 11; i++) {
            gameModule.randomCars.push("<div class='random-car" + i + "'></div>");
        }
        gameModule.verticalShift = $(".primary-car").position().top;
        gameModule.shiftCarLimit = $(".center-panel").width() - $(".primary-car").width() * 3;
        gameModule.primaryCar = $(".primary-car");
        gameModule.trackContainer = $(".center-panel");
        gameModule.trackWidth = gameModule.trackContainer.width();
        gameModule.leftMaxMin = (gameModule.trackWidth / 2 - 50) - 70 + 1;
        gameModule.rightMaxMin = 570 - (gameModule.trackContainer.width() / 2 + 50) + 1;
        gameModule.scoreHolder = $(".score-panel").children().eq(1);
    },
    //sets the left and top positions of the primary car on keypress
    carMovement: function () {
        gameModule.primaryCar.css({
            "top": gameModule.shiftCarTop,
            "left": gameModule.shiftCarLeft
        });
    },
    //generates the cars at random and increases the track movement speed
    shiftPixel: function () {
        gameModule.generateCar();
        if (gameModule.timerCount === 1000) {
            gameModule.speedCount += 0.04;
            gameModule.carSpeed += 0.4;
            gameModule.timerCount = 1;
        }
        gameModule.timerCount++;
        gameModule.shiftCount += gameModule.speedCount;
        gameModule.trackContainer.css({
            "background-position-y": gameModule.shiftCount + "px"
        });
        $(".back-panel").css({
            "background-position-y": "+=1"
        })
    },
    //the main function of track and car motions
    shiftTrack: function () {
        gameModule.horizontalShift = gameModule.primaryCar.position().left;
        gameModule.collisionHolder = setInterval(gameModule.triggerCollision, 1);
        gameModule.carControls = setInterval(gameModule.carMovement, 10);
        gameModule.trackMovement = setInterval(gameModule.shiftPixel, 1);
        gameModule.scoreSetter = setInterval(gameModule.scoreManager, 100);
    },
    scoreManager: function () {
        if (gameModule.primaryCar.position().left > (gameModule.trackContainer.width() / 2 - 40)) {
            gameModule.scoreHolder.html(gameModule.score++);
        } else {
            gameModule.scoreHolder.html(gameModule.score += 2);
        }
    },
    // the functionalities of the car's top and left movement
    shiftCarLeft: function (index, value) {
        return gameModule.performShift(value, 37, 39);
    },
    // the functionalities of the car's right and bottom movement
    shiftCarTop: function (index, value) {
        return gameModule.performShift(value, 38, 40);
    },
    //the functionalities of the car movement based on the keypress
    performShift: function (value, leftTop, rightBottom) {
        var leftLimit = gameModule.trackContainer.width() * 0.1,
            newPixel = parseInt(value, 10) - (gameModule.selectedKey[leftTop] ? gameModule.carShiftCount : 0) + (gameModule.selectedKey[rightBottom] ? gameModule.carShiftCount : 0);
        return newPixel < leftLimit ? leftLimit : newPixel > gameModule.shiftCarLimit ? gameModule.shiftCarLimit : newPixel;
    },
    //resets the car angle on keyup
    repositionCar: function (event) {
        gameModule.primaryCar.css({
            "transform": "rotate(0deg)"
        })
    },
    //generate random cars alongwith random left and right positions
    generateCar: function () {
        var randomTimer1 = Math.floor((Math.random() * 100) + 1),
            randomTimer2 = Math.floor((Math.random() * 100) + 1),
            leftTrackLimit, rightTrackLimit, setObstaclePosition, leftCarSpeed, rightCarSpeed;
        if (randomTimer1 === randomTimer2) {
            leftTrackLimit = Math.floor(Math.random() * gameModule.leftMaxMin) + 60;
            rightTrackLimit = Math.floor(Math.random() * gameModule.rightMaxMin) + (gameModule.trackContainer.width() / 2 + 10);
            setObstaclePosition = Math.floor((Math.random() * 10) + 1);
            leftCarSpeed = (Math.floor((Math.random() * 90) + 1) + 200) / 100;
            rightCarSpeed = (Math.floor((Math.random() * 60) + 1) + 80) / 100;
            setObstaclePosition < 7 ? gameModule.animateCar(leftTrackLimit, leftCarSpeed, setObstaclePosition) : gameModule.animateCar(rightTrackLimit, rightCarSpeed, setObstaclePosition);
        }
    },
    //appending the randomly generated car onto the track
    animateCar: function (trackLimit, carSpeed, carRotate) {
        var carClass = "car" + gameModule.carIndex,
            selectCar = gameModule.randomCars[Math.floor((Math.random() * 10) + 0)];
        if (gameModule.firstCar || gameModule.hinderObstacleOverlap(trackLimit)) {
            gameModule.trackContainer.append($(selectCar).addClass(carClass).addClass("obstacleCar"));
            gameModule.carPosition.push(trackLimit);
            gameModule.obstacleCars.push(carClass);
            if (gameModule.carIndex > 15) {
                gameModule.carIndex = 0;
            }
            gameModule.firstCar = 0;
            if (carRotate > 6) {
                $("." + carClass).css({
                    "transform": "rotate(180deg)"
                })
            }
            gameModule.obstacleCarMovement(carClass, gameModule.carIndex++, carSpeed, trackLimit);
        }
    },
    // animating the obstacle car with a random speed based on the track's left or right section
    obstacleCarMovement: function (carClass, currentCarPosition, carSpeed, trackLimit) {
        var carMotionCount = -170,
            positionIndex;
        gameModule.carMotion[currentCarPosition] = setInterval(function () {
            $("." + carClass).css({
                "top": carMotionCount + "px",
                "left": trackLimit + "px"
            });
            carMotionCount += carSpeed;
            if ($("." + carClass) && carMotionCount >= gameModule.trackContainer.height()) {
                positionIndex = gameModule.carPosition.indexOf(trackLimit);
                gameModule.obstacleCars.splice(positionIndex, 1);
                $("." + carClass).remove();
                carMotionCount = -170;
                clearInterval(gameModule.carMotion[currentCarPosition]);
                gameModule.carPosition.splice(positionIndex, 1);
            }
        }, 5);
        if (gameModule.carMotion.length >= 22) {
            gameModule.carMotion.shift();
        }
    },
    //restrict the overlapping of the obstacle cars
    hinderObstacleOverlap: function (currentCarPosition) {
        var overlapChecker = true,
            i,
            carCount = gameModule.carPosition.length;
        for (i = carCount - 1; i >= 0; i--) {
            if (currentCarPosition >= (gameModule.carPosition[i] - 55) && (currentCarPosition <= (gameModule.carPosition[i] + 55))) {
                overlapChecker = false;
                break;
            }
        }
        return overlapChecker;
    },
    //the function for checking the collision conditions
    triggerCollision: function () {
        var obstacleCar, primaryCarLeftPosition, primaryCarTopPosition, primaryCarHeight, primaryCarWidth, primaryCarTotalHeight, primaryCarTotalWidth, obstacleCarLeftPosition, obstacleCarTopPosition, obstacleCarheight, obstacleCarHeight, obstacleCarWidth, obstacleCarTotalHeight, obstacleCarTotalWidth, i;
        if (gameModule.obstacleCars.length) {
            for (i = gameModule.obstacleCars.length - 1; i >= 0; i--) {
                obstacleCar = $("." + (gameModule.obstacleCars[i]));
                primaryCarLeftPosition = gameModule.primaryCar.offset().left;
                primaryCarTopPosition = gameModule.primaryCar.offset().top;
                primaryCarHeight = gameModule.primaryCar.outerHeight(true);
                primaryCarWidth = gameModule.primaryCar.outerWidth(true);
                primaryCarTotalHeight = primaryCarTopPosition + primaryCarHeight;
                primaryCarTotalWidth = primaryCarWidth + primaryCarLeftPosition;
                obstacleCarLeftPosition = obstacleCar.offset().left;
                obstacleCarTopPosition = obstacleCar.offset().top;
                obstacleCarHeight = obstacleCar.outerHeight(true);
                obstacleCarWidth = obstacleCar.outerWidth(true);
                obstacleCarTotalHeight = obstacleCarTopPosition + obstacleCarHeight;
                obstacleCarTotalWidth = obstacleCarLeftPosition + obstacleCarWidth;
                if (!(obstacleCarTotalHeight < primaryCarTopPosition || obstacleCarTopPosition > primaryCarTotalHeight || obstacleCarTotalWidth < primaryCarLeftPosition || obstacleCarLeftPosition > primaryCarTotalWidth)) {
                    gameModule.enemyCar = obstacleCar;
                    gameModule.crashCount++ < 2 ? gameModule.collisionActions.carBump(i) : gameModule.collisionActions.carCrash();
                }
                obstacleCar = undefined;
            }
        }
    },
    //the actions occured on respective collision conditions
    collisionActions: {
        //the first two collision actions
        carBump: function (obstaclePosition) {
            clearInterval(gameModule.collisionHolder);
            clearInterval(gameModule.carControls);
            gameModule.onCrash = 0;
            gameModule.score -= 50;
            $(".life-holder").children().eq(0).css({
                "background-image": "url('images/deathOfLife.gif')"
            });
            setTimeout(function () {
                $(".life-holder").children().eq(0).remove();
            }, 900);
            setTimeout(function () {
                gameModule.onCrash = 1;
                gameModule.enemyCar.hide();
                gameModule.collisionHolder = setInterval(gameModule.triggerCollision, 1);
                gameModule.carControls = setInterval(gameModule.carMovement, 10);
            }, 1100);
            gameModule.enemyCar.css({
                "transform": "rotate(0deg)"
            }).addClass("car-crash");
            gameModule.primaryCar.animate({
                "deg": 720
            }, {
                step: function (now, fx) {
                    gameModule.primaryCar.css({
                        "transform": "rotate(" + now + "deg)"
                    });
                },
                duration: 1500,
                complete: function () {
                    gameModule.primaryCar.css({
                        "deg": 0
                    })
                }
            });
        },
        //the final collision action
        carCrash: function () {
            gameModule.onCrash = 0;
            $(".life-holder").children().eq(0).remove();
            clearInterval(gameModule.carControls);
            clearInterval(gameModule.trackMovement);
            clearInterval(gameModule.scoreSetter);
            clearInterval(gameModule.collisionHolder);
            for (var i = gameModule.carMotion.length - 1; i >= 0; i--) {
                clearInterval(gameModule.carMotion[i]);
            }
            gameModule.primaryCar.addClass("car-crash");
            gameModule.enemyCar.css({
                "transform": "rotate(0deg)"
            }).addClass("car-crash");
            setTimeout(gameModule.collisionActions.removeExplodedCars, 1100)
        },
        removeExplodedCars: function () {
            gameModule.primaryCar.remove();
            gameModule.enemyCar.remove();
            $(".gameover-panel").show();
        }
    },
    //the game reset function which clears all the intervals
    resetGame: function () {
        $(".gameover-panel").hide();
        $(".obstacleCar").remove();
        $(".life-holder").append("<div class='life'></div>");
        $(".life-holder").append("<div class='life'></div>");
        $(".life-holder").append("<div class='life'></div>");
        gameModule.trackContainer.append(gameModule.primaryCar);
        gameModule.carPosition = [];
        gameModule.obstacleCars = [];
        gameModule.carMotion = [];
        gameModule.score = 0;
        gameModule.crashCount = 0;
        gameModule.firstCar = 1;
        gameModule.shiftCount = 0;
        gameModule.speedCount = 1.5;
        gameModule.timerCount = 1;
        gameModule.onCrash = 1;
        gameModule.carSpeed = 0;
        gameModule.carIndex = 0;
        gameModule.selectedKey = {};
        gameModule.primaryCar.removeClass("car-crash");
        gameModule.shiftTrack();
    }
}

$(document).ready(gameModule.init);
