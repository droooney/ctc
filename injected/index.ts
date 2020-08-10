interface CellInfo {
  y: number;
  x: number;
  h?: number;
  c?: string;
  pm?: string;
}

interface PuzzleInfo {
  cells: CellInfo[];
}

(async () => {
  const SUDOKU_COLORS = [
    '#000000', '#CFCFCF', '#FFFFFF',
    '#A3E048', '#D23BE7', '#EB7532',
    '#E6261F', '#F7D038', '#34BBE6',
  ];

  const puzzleId = location.pathname.match(/^\/sudoku\/([^/]+)$/)?.[1];
  const lsKey = `puzzle-${puzzleId}`;

  const loadPuzzle = async () => {
    const url = new URL(location.toString());
    const puzzleInfo: PuzzleInfo | null = JSON.parse(
      url.searchParams.get('puzzle-info')
      || localStorage.getItem(lsKey)
      || 'null'
    );

    if (!puzzleInfo) {
      return;
    }

    while (!document.querySelector('.sudoku-game')) {
      await timeout(100);
    }

    const controls = document.querySelector('.sudoku-play__input-controls')!;
    const normalButton = findActionButton('Normal');
    const cornerButton = findActionButton('Corner');
    const centerButton = findActionButton('Centre');
    const colorButton = findActionButton('Colour');

    puzzleInfo.cells.forEach((cell) => {
      simulateCellClick(
        document.querySelectorAll('.sudoku-grid__row')[cell.y].children[cell.x],
      );

      if (cell.h !== undefined) {
        colorButton.click();

        (controls.children[cell.h] as HTMLElement).click();
      }

      if (cell.c) {
        centerButton.click();

        cell.c.split('').forEach((digit) => {
          (controls.children[+digit - 1] as HTMLElement).click();
        });
      }

      if (cell.pm) {
        cornerButton.click();

        cell.pm.split('').forEach((digit) => {
          (controls.children[+digit - 1] as HTMLElement).click();
        });
      }
    });

    normalButton.click();

    document.querySelector('.sudoku-play')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    );
  };

  const savePuzzle = () => {
    const grid = document.querySelector('.sudoku-grid');

    if (!grid) {
      return;
    }

    const puzzleInfo: PuzzleInfo = {
      cells: []
    };

    for (const cell of document.querySelectorAll('.sudoku-cell')) {
      const row = cell.parentElement!;
      const y = [...grid.children].indexOf(row);
      const x = [...row.children].indexOf(cell);
      const cellInfo: CellInfo = {
        y,
        x,
      };

      const highlightCell = cell.querySelector<HTMLElement>('.sudoku-cell__highlight');
      const candidatesCell = cell.querySelector<HTMLElement>('.sudoku-cell__candidates--user');
      const pencilMarksCells = cell.querySelectorAll<HTMLElement>('.sudoku-cell__pm--user');

      if (highlightCell) {
        const index = SUDOKU_COLORS.indexOf(rgbToHex(highlightCell.style.backgroundColor));

        if (index !== -1) {
          cellInfo.h = index;
        }
      }

      if (candidatesCell) {
        cellInfo.c = (candidatesCell.textContent || '').trim();
      }

      if (pencilMarksCells.length) {
        cellInfo.pm = [...pencilMarksCells].map((pm) => (pm.textContent || '').trim()).join('');
      }

      if (cellInfo.h !== undefined || cellInfo.pm || cellInfo.c) {
        puzzleInfo.cells.push(cellInfo);
      }
    }

    const oldValue = localStorage.getItem(lsKey);
    const newValue = JSON.stringify(puzzleInfo);

    if (newValue !== oldValue) {
      const newURL = new URL(location.toString());

      newURL.searchParams.set('puzzle-info', newValue);

      localStorage.setItem(lsKey, newValue);
      history.replaceState(null, '', newURL.toString());
    }
  };

  const timeout = async (ms: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  const rgbToHex = (rgbString: string): string => {
    const [, r, g, b] = rgbString.match(/\((\d+), (\d+), (\d+)/) || [];

    return `#${(+r).toString(16).padStart(2, '0')}${(+g).toString(16).padStart(2, '0')}${(+b).toString(16).padStart(2, '0')}`.toUpperCase();
  };

  const simulateCellClick = (cell: Element) => {
    ['mousedown', 'click', 'mouseup'].forEach((mouseEventType) => {
      cell.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1,
        }),
      );
    });
  };

  const findActionButton = (text: string): HTMLElement => {
    return [...document.querySelectorAll<HTMLElement>('.action-button')].find(
      (button) => (button.textContent || '').trim() === text,
    )!;
  };

  await loadPuzzle();

  while (true) {
    await timeout(500);

    savePuzzle();
  }
})();