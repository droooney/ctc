"use strict";
(async () => {
    var _a;
    const SUDOKU_COLORS = [
        '#000000', '#CFCFCF', '#FFFFFF',
        '#A3E048', '#D23BE7', '#EB7532',
        '#E6261F', '#F7D038', '#34BBE6',
    ];
    const puzzleId = (_a = location.pathname.match(/^\/sudoku\/([^/]+)$/)) === null || _a === void 0 ? void 0 : _a[1];
    const lsKey = `puzzle-${puzzleId}`;
    const loadPuzzle = async () => {
        const puzzleInfo = JSON.parse(localStorage.getItem(lsKey) || 'null');
        if (!puzzleInfo) {
            return;
        }
        while (!document.querySelector('.sudoku-game')) {
            await timeout(100);
        }
        const controls = document.querySelector('.sudoku-play__input-controls');
        const normalButton = findActionButton('Normal');
        const cornerButton = findActionButton('Corner');
        const centerButton = findActionButton('Centre');
        const colorButton = findActionButton('Colour');
        puzzleInfo.cells.forEach((cell) => {
            simulateCellClick(document.querySelectorAll('.sudoku-grid__row')[cell.y].children[cell.x]);
            if (cell.h !== undefined) {
                colorButton.click();
                controls.children[cell.h].click();
            }
            if (cell.v) {
                normalButton.click();
                controls.children[+cell.v - 1].click();
            }
            if (cell.c) {
                centerButton.click();
                cell.c.split('').forEach((digit) => {
                    controls.children[+digit - 1].click();
                });
            }
            if (cell.pm) {
                cornerButton.click();
                cell.pm.split('').forEach((digit) => {
                    controls.children[+digit - 1].click();
                });
            }
        });
        normalButton.click();
        document.querySelector('.sudoku-play').dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
        }));
    };
    const savePuzzle = () => {
        var _a, _b;
        const grid = document.querySelector('.sudoku-grid');
        if (!grid) {
            return;
        }
        const puzzleInfo = {
            cells: []
        };
        for (const cell of document.querySelectorAll('.sudoku-cell')) {
            const row = cell.parentElement;
            const y = [...grid.children].indexOf(row);
            const x = [...row.children].indexOf(cell);
            const cellInfo = {
                y,
                x,
            };
            const highlightCell = cell.querySelector('.sudoku-cell__highlight');
            const valueCell = cell.querySelector('.sudoku-cell__value--user');
            const candidatesCell = cell.querySelector('.sudoku-cell__candidates--user');
            const pencilMarksCells = cell.querySelectorAll('.sudoku-cell__pm--user');
            if (highlightCell) {
                const index = SUDOKU_COLORS.indexOf(rgbToHex(highlightCell.style.backgroundColor));
                if (index !== -1) {
                    cellInfo.h = index;
                }
            }
            if (valueCell) {
                cellInfo.v = (_a = valueCell.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            }
            if (candidatesCell) {
                cellInfo.c = (_b = candidatesCell.textContent) === null || _b === void 0 ? void 0 : _b.trim();
            }
            if (pencilMarksCells.length) {
                cellInfo.pm = [...pencilMarksCells].map((pm) => (pm.textContent || '').trim()).join('');
            }
            if (cellInfo.h !== undefined || cellInfo.v || cellInfo.pm || cellInfo.c) {
                puzzleInfo.cells.push(cellInfo);
            }
        }
        const oldValue = localStorage.getItem(lsKey);
        const newValue = JSON.stringify(puzzleInfo);
        if (newValue !== oldValue) {
            localStorage.setItem(lsKey, newValue);
        }
    };
    const timeout = async (ms) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
    };
    const rgbToHex = (rgbString) => {
        const [, r, g, b] = rgbString.match(/\((\d+), (\d+), (\d+)/) || [];
        return `#${(+r).toString(16).padStart(2, '0')}${(+g).toString(16).padStart(2, '0')}${(+b).toString(16).padStart(2, '0')}`.toUpperCase();
    };
    const simulateCellClick = (cell) => {
        ['mousedown', 'click', 'mouseup'].forEach((mouseEventType) => {
            cell.dispatchEvent(new MouseEvent(mouseEventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1,
            }));
        });
    };
    const findActionButton = (text) => {
        return [...document.querySelectorAll('.action-button')].find((button) => (button.textContent || '').trim() === text);
    };
    await loadPuzzle();
    while (true) {
        await timeout(500);
        savePuzzle();
    }
})();
//# sourceMappingURL=index.js.map