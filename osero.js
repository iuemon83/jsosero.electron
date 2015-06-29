var Osero = (function() {
    return function Osero(bordId, numberOfRow, numberOfColumn) {
        this.blackStone = '●';
        this.whiteStone = '○';
        this.currentStone = this.blackStone;
        this.totalTurnCount = 0;

        this.onTurnStart = function() {};
        this.onFinish = function() {};

        var $bord = $('#' + bordId);

        var rowList = [];
        for (var row = 0; row < numberOfRow; row++) {
            var $tr = $('<tr>');
            $bord.append($tr);

            rowList.push([]);
            for (var column = 0; column < numberOfColumn; column++) {
                var $td = $('<td id="' + row + '_' + column + '"></td>');
                $tr.append($td);
                rowList[rowList.length - 1].push($td);
            }
        }

        var self = this;
        $bord.find('td').on('click', function() {
            var y = Number($(this).attr('id').split('_')[0]);
            var x = Number($(this).attr('id').split('_')[1]);
            var position = {
                x: x,
                y: y
            };

            if (!self.isSetable(position)) return;
            self.set(position);
            self.toNextTurn();
        });

        // オセロの開始
        this.start = function() {
            // 中央に4つ置く
            rowList[3][3].text(this.whiteStone);
            rowList[3][4].text(this.blackStone);
            rowList[4][3].text(this.blackStone);
            rowList[4][4].text(this.whiteStone);

            this.startTurn();
        };

        // オセロの終了
        this.finish = function() {
            var blackCount = 0;
            var whiteCount = 0;
            rowList.forEach(function(row) {
                row.forEach(function(masu) {
                    if (masu.text() === this.blackStone) {
                        blackCount++;
                    } else {
                        whiteCount++;
                    }
                }, this);
            }, this);

            this.onFinish({
                blackCount: blackCount,
                whiteCount: whiteCount
            });
        };

        var skipCount = 0;

        // ターンの開始
        this.startTurn = function() {
            this.totalTurnCount++;

            // 石をセット可能なマスに色を付ける
            var setableCount = 0;
            for (var y = 0; y < numberOfRow; y++) {
                for (var x = 0; x < numberOfColumn; x++) {
                    var position = {
                        x: x,
                        y: y
                    };
                    if (this.isSetable(position)) {
                        setableCount++;
                        rowList[y][x].addClass('setable');
                    } else {
                        rowList[y][x].removeClass('setable');
                    }
                }
            }

            if (setableCount === 0) {
                if (skipCount > 2) {
                    this.finish();
                } else {
                    skipCount++;
                    this.toNextTurn();
                }
            } else {
                skipCount = 0;
                this.onTurnStart({
                    stone: this.currentStone
                });
            }
        };

        // 次のターンへ
        this.toNextTurn = function() {
            if (numberOfRow * numberOfColumn === this.totalTurnCount) {
                this.finish();
                return;
            }

            this.currentStone = this.currentStone === this.blackStone ? this.whiteStone : this.blackStone;
            this.startTurn();
        };

        // 指定したマスに石をセット出来る場合はTrue、そうでなければFalse を返す
        this.isSetable = function(position) {
            if (rowList[position.y][position.x].text() !== '') return false;
            return getReversablePositions(position, this.currentStone).length !== 0;
        };

        // 指定したマスに石をセットする
        this.set = function(position) {
            if (rowList[position.y][position.x].text() !== '') return;

            rowList[position.y][position.x].text(this.currentStone);

            getReversablePositions(position, this.currentStone).forEach(function(position) {
                rowList[position.y][position.x].text(this.currentStone);
            }, this);
        };

        // 指定したマスに石をセットした場合に、ひっくり返すことができるマスの一覧を取得する
        var getReversablePositions = function(setPosition, setStone) {
            var reverseStone = setStone === self.blackStone ? self.whiteStone : self.blackStone;

            var reversablePositionList = [];

            // 左
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, -1, 0, reverseStone));

            // 右
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, 1, 0, reverseStone));

            // 上
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, 0, -1, reverseStone));

            // 下
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, 0, 1, reverseStone));

            // 左斜め上
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, -1, -1, reverseStone));

            // 左斜め下
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, -1, 1, reverseStone));

            // 右斜め上
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, 1, -1, reverseStone));

            // 右斜め下
            reversablePositionList = reversablePositionList.concat(getReversableStraightLine(setPosition, setStone, 1, 1, reverseStone));

            return reversablePositionList;
        }

        // 指定したマスに石をセットした場合に、指定した方向のひっくり返すことができるマスの一覧を取得する
        getReversableStraightLine = function(position, stone, dx, dy, reverseStone) {
            var xx = position.x + dx;
            var yy = position.y + dy;
            if (inBord(xx, yy) && rowList[yy][xx].text() === reverseStone) {

                var exists = false;

                var xi = xx;
                var yi = yy;
                while (inBord(xi, yi)) {
                    exists = exists || rowList[yi][xi].text() === stone;

                    xi += dx;
                    yi += dy;
                }

                var result = [];
                if (exists) {
                    xi = xx;
                    yi = yy;
                    while (inBord(xi, yi) && rowList[yi][xi].text() === reverseStone) {
                        result.push({
                            x: xi,
                            y: yi
                        });

                        xi += dx;
                        yi += dy;
                    }
                }

                return result;
            } else {
                return [];
            }
        };

        // 指定した座標がボード内に収まっている場合はTrue、そうでなければFalse を返す
        var inBord = function(x, y) {
            return x >= 0 &&
                x < numberOfColumn &&
                y >= 0 &&
                y < numberOfRow;
        };
    };
})();