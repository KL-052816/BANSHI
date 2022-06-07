// 给你一个大小为 m x n 的二进制矩阵 grid ，其中 0 表示一个海洋单元格、1 表示一个陆地单元格。

// 一次 移动 是指从一个陆地单元格走到另一个相邻（上、下、左、右）的陆地单元格或跨过 grid 的边界。

// 返回网格中 无法 在任意次数的移动中离开网格边界的陆地单元格的数量
let grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]];
// let grid = [
//   [0, 1, 0, 1],
//   [1, 1, 1, 1],
//   [0, 1, 0, 0],
//   [1, 0, 1, 1],
// ];
let num = 0;

const add = (arrs) => {
  // 判断当前坐标的上下左右的值
  const dirs = [[0, 1],[0, -1], [-1, 0], [1, 0]];
  // 判断数组的长度
  const m = Number(arrs.length);
  // 判断数组每项的长度
  const n = Number(arrs[0].length);

  //   console.log('arrs',arrs,m,n)
  // 生成一个与arrs相同的二维数组 值为false
  const visited = new Array(m).fill(0).map(() => Array(n).fill(false));
  //写一个方法判断visited的值是否为true或flase
  const difs = (arrs, row, col) => {
    // 判断是否为1，如果为0 则直接跳出
    if (
      row < 0 ||
      row >= m ||
      col < 0 ||
      col >= n ||
      arrs[row][col] === 0 ||
      visited[+row][+col] === true
    ){
        return;
    }
    // 如果为1 则置为true
    visited[row][col] = true;
    // 判断当前值上下左右是否为1
    console.log('dirs22222222222222',dirs)
    for (const dir in dirs) {
      console.log('1111111111111',dir)
      difs(grid, row + dirs[dir][0], col +dirs[dir][1]);
    }
  };
  // 判断第一行和最后一行的值是否为1
  for (let i = 0; i < n; i++) {
    difs(grid, 0, i);
    difs(grid, m - 1, i);
  }
  // 判断第一列和最后一列的值是否为1
  for (let i = 0; i < m; i++) {
    difs(grid, i, 0);
    difs(grid, i, n - 1);
  }
  let num = 0;
  // 判断符合条件的值 在arrs数组的值为1，且在visited中的值为false
  for (let i = 1; i < m-1; i++) {
    for (let j = 0; j < n-1; j++) {
      if (arrs[i][j] === 1 && !visited[i][j]) {
        num++;
      }
    }
  }

  console.log("num+++", num);
  console.log("#########", visited);
};

add(grid);
