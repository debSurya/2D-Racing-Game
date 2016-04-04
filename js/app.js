var gameModule = {
    shiftCount: 0,
    speedCount: 1,
    timerCount: 1,
    horizontalShift: undefined,
    obstaclePosition: 0,
    randomCar: "<div class='random-car'></div>",
    shiftPixel: function () {
        if (gameModule.timerCount === 900) {
            gameModule.speedCount += Math.abs(0.05);
            gameModule.timerCount = 1;
        }
        gameModule.timerCount++;
        gameModule.shiftCount += gameModule.speedCount;
        $(".center-panel").css({
            "background-position": "0px " + gameModule.shiftCount + "px"
        });
    },
    shiftTrack: function () {
        gameModule.horizontalShift = $(".primary-car").position().left;
        setInterval(gameModule.shiftPixel, 1);
    },
    shiftCar: function (event) {
        if (event.keyCode === 39 && (gameModule.horizontalShift <= ($(".center-panel").width()) * 0.35)) {
            gameModule.horizontalShift += 6;
            $(".primary-car").css({
                "left": gameModule.horizontalShift + "px",
                "transform": "rotate(6deg)"
            });
        } else if (event.keyCode === 37) {
            if (gameModule.horizontalShift >= ($(".center-panel").width()) * -0.35) {
                gameModule.horizontalShift -= 6;
                $(".primary-car").css({
                    "left": gameModule.horizontalShift + "px",
                    "transform": "rotate(-6deg)"
                });
            }
        }
    },
    repositionCar: function (event) {
        if (event.keyCode === 39) {
            $(".primary-car").css({
                "transform": "rotate(0deg)"
            })
        } else if (event.keyCode === 37) {
            $(".primary-car").css({
                "transform": "rotate(0deg)"
            })
        }
    }
};

$(document).ready(function () {
    gameModule.shiftTrack();
    $(document).off("keydown").on("keydown", gameModule.shiftCar);
    $(document).off("keyup").on("keyup", gameModule.repositionCar);
});
