window.jQuery = window.$ = require('./lib/jquery.js');

$(function() {
    var osero = new Osero('bord', 8, 8);

    var $message = $('#message');
    osero.onTurnStart = function(e) {
        var message = (e.stone === osero.blackStone ? '黒' : '白') + 'の番です。';
        $message.text(message);
    };

    osero.onFinish = function(e) {
        var message = e.blackCount + '対' + e.whiteCount + 'で' + (e.blackCount > e.whiteCount ? '黒' : '白') + 'の勝ちです';
        $message.text(message);
    };

    osero.start();
});
