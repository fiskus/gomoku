/**
 * @param type {string} 'x' or 'o'
 */
function Gomuku (type) {

    type = type || 'x';
    var opponentType = type === 'x' ? 'o' : 'x';

    var data = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];

    if (type === 'o') {
        createGameTree(data, opponentType);
    }


    function fill (cell, t) {
        if (wasUsed(cell)) {
            return false;
        }
        var className = t === 'x' ?
                'gomuku-cell-black' : 'gomuku-cell-white';
        cell.classList.add(className);
    }

    function wasUsed (cell) {
        return cell.classList.contains('gomuku-cell-white') ||
                cell.classList.contains('gomuku-cell-black');
    }

    function getCellByXY (x, y) {
        var className = '.gomuku-x' + x + '-y' + y;
        return document.querySelector(className);
    }

    function getXYByCell (cell) {
        var className = cell.classList[1];
        var regex = /gomuku-x(\d)-y(\d)/g;
        var found = regex.exec(className);
        return [found[1], found[2]].map(int);
    }

    function onClick (event) {
        var cell = event.currentTarget;
        fill(cell, type);

        var coords = getXYByCell(cell);
        data[coords[0]][coords[1]] = type;

        createGameTree(data, opponentType);

        if (hasWon(type, data)) {
            end(true);
        } else if (hasWon(opponentType, data)) {
            end(false);
        }
    }

    function start () {
        var cells = document.querySelectorAll('.gomuku-cell');
        Array.prototype.forEach.call(cells, function (cell) {
            cell.addEventListener('click', onClick, true);
        });
    }

    function end (isHappy) {
        if (isHappy) {
            alert('YOU WON!');
        } else {
            alert('YOU LOSE!');
        }

        var cells = document.querySelectorAll('.gomuku-cell');
        Array.prototype.forEach.call(cells, function (cell) {
            cell.removeEventListener('click', onClick, true);
        });
    }

    function int (num) {
        return parseInt(num, 10);
    }

    function hasWon (t, rows) {
        t = t || type;
        var rowStroked = isSomeRowStroked(rows, t);

        var columns = getColumns(rows);
        var columnStroked = isSomeRowStroked(columns, t);

        var diagonals = getDiagonals(rows, t);
        var diagonalStroked = isSomeRowStroked(diagonals, t);

        if (rowStroked || columnStroked || diagonalStroked) {
            return true;
        }
    }

    function getDiagonals (rows) {
        return [
            [rows[0][0], rows[1][1], rows[2][2]],
            [rows[2][0], rows[1][1], rows[0][2]]
        ];
    }

    /**
     * Make rows as colums, and columns as rows
     */
    function getColumns (rows) {
        var columns = [];
        for (var i = 0; i < rows.length; i++) {
            for (var j = 0; j < rows[i].length; j++) {
                if (!columns[j]) {
                    columns[j] = [];
                }
                columns[j][i] = rows[i][j];
            }
        }
        return columns;
    }

    /**
     * @param rows {Array}
     * @param t {string} 'x' or 'o'
     */
    function isSomeRowStroked (rows, t) {
        return rows.some(function (row) {
            var areEverySame = row.every(function (cell) {
                return cell === t;
            });
            if (areEverySame) {
                return true;
            } else {
                return false;
            }
        });
    }

    function clone (input) {
        if (typeof input === 'string') {
            var output = input;
            return output;
        } else {
            return input.map(function (item) {
                return clone(item);
            });
        }
    }

    function createGameTree (rows, t) {
        coordinatesMap = [];
        for (var i = 0; i < rows.length; i++) {
            for (var j = 0; j < rows[i].length; j++) {
                coordinatesMap.push([i, j]);
            }
        }

        var branches = coordinatesMap.map(function (coords) {
            var x = coords[0];
            var y = coords[1];
            var cloned = clone(rows);
            if (cloned[x][y] === '') {
                cloned[x][y] = t;

                // TODO: calc step depth, use shortest
                var collector = {
                    count: 0
                };
                var branch = createGameBranch(cloned, t, collector);
                if (branch) {
                    return {
                        branch: branch,
                        steps: collector.count,
                        x: x,
                        y: y
                    };
                }
                /*
                if (branch) {
                    var cell = getCellByXY(x, y);
                    fill(cell, opponentType);
                    data[x][y] = opponentType;
                    return true;
                }
                */
            }
        });
        branches.sort(function (a, b) {
            if (b) {
                return a.steps - b.steps;
            } else {
                return - 1000000;
            }
        });
        if (branches[0]) {
            var x = branches[0].x;
            var y = branches[0].y;
            var cell = getCellByXY(x, y);
            fill(cell, opponentType);
            data[x][y] = opponentType;
            return true;
        }
    }

    function createGameBranch (rows, t, collector) {
        tree = [];

        coordinatesMap = [];
        for (var i = 0; i < rows.length; i++) {
            for (var j = 0; j < rows[i].length; j++) {
                if (rows[i][j] === '') {
                    coordinatesMap.push([i, j]);
                }
            }
        }

        return coordinatesMap.map(function (coords, index) {
            var x = coords[0];
            var y = coords[1];
            var cloned = clone(rows);

            collector.count++;
            cloned[x][y] = t;
            tree.push(cloned);

            var mirroredType = t === type ? opponentType : type;
            if (hasWon(type, cloned)) {
                collector.count = collector.count + 100;
            }
            if (hasWon(opponentType, cloned)) {
                collector.count =
                        collector.count - (coordinatesMap.length - index);
                return tree;
            } else {
                var branch = createGameBranch(cloned, mirroredType, collector);
                if (branch) {
                    return tree.concat(branch);
                }
            }
        });
    }


    start();





    /*
    function Test () {
        var specs = [];

        specs.push(function() {
            return hasWon('x', [
                ['', '', ''],
                ['x', 'x', 'x'],
                ['', '', '']
            ]);
        });

        specs.push(function() {
            return hasWon('x', [
                ['', 'x', ''],
                ['', 'x', ''],
                ['', 'x', '']
            ]);
        });

        specs.push(function() {
            return hasWon('x', [
                ['x', '', ''],
                ['', 'x', ''],
                ['', '', 'x']
            ]);
        });

        specs.push(function() {
            return hasWon('x', [
                ['', '', 'x'],
                ['', 'x', ''],
                ['x', '', '']
            ]);
        });

        specs.push(function() {
            return !hasWon('x', [
                ['x', '', ''],
                ['x', '', 'x'],
                ['', '', '']
            ]);
        });

        specs.push(function() {
            return !hasWon('x', [
                ['', 'x', ''],
                ['x', 'x', ''],
                ['', '', 'x']
            ]);
        });

        specs.push(function() {
            return hasWon('o', [
                ['o', 'o', 'o'],
                ['', '', ''],
                ['', '', '']
            ]);
        });

        specs.push(function() {
            return hasWon('o', [
                ['', '', 'o'],
                ['', '', 'o'],
                ['', '', 'o']
            ]);
        });

        specs.push(function() {
            return !hasWon('o', [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ]);
        });

        specs.push(function() {
            return hasWon('o', [
                ['o', '', ''],
                ['', 'o', ''],
                ['', '', 'o']
            ]);
        });

        specs.push(function() {
            return hasWon('o', [
                ['', '', 'o'],
                ['', 'o', ''],
                ['o', '', '']
            ]);
        });

        specs.push(function() {
            return !hasWon('o', [
                ['o', '', ''],
                ['', '', ''],
                ['', '', 'o']
            ]);
        });

        specs.push(function() {
            return !hasWon('o', [
                ['', 'o', ''],
                ['', 'o', ''],
                ['o', '', '']
            ]);
        });

        return specs.every(function(spec, i) {
            var isPass = spec();
            if (!isPass) {
                console.log(i);
            }
            return isPass;
        });
    }

    console.log(Test());
    */
}
