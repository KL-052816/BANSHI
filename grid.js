// let grid = [[0,1,0,1],[0,0,0,0],[0,1,0,0],[1,0,1,1]];
let grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]];
// let grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]

var numEnclaves = function(grid) {
    // 判断当前的坐标的上下左右的值 是否为1的比对来控制visited的true或false
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    // 行数与列数
    const m = grid.length;
    const n = grid[0].length;
    // 生成一个等同为false 的二维数组
    const visited = new Array(m).fill(0).map(() => new Array(n).fill(false));
    // 判断当前值是否为1
    const dfs = (grid, row, col) => {
        // if 判断是0的情况直接返回 否则则为visited的值置为true
        if (row < 0 || row >= m || col < 0 || col >= n || grid[row][col] == 0 || visited[row][col]) {
            return;
        }
        
        visited[row][col] = true;
        // 判断该坐标上下左右是否为1 若为1则进行递归
        for (const dir of dirs) {
            dfs(grid, row + dir[0], col + dir[1]);
        }
    };
    // 判断第一行和最后一行的值
    for (let i = 0; i < m; i++) {
        dfs(grid, i, 0);
        dfs(grid, i, n - 1);
    }
    // 判断第一列和最后一列的值
    for (let j = 1; j < n - 1; j++) {
        dfs(grid, 0, j);
        dfs(grid, m - 1, j);
    }
    let enclaves = 0;
    // 记录边缘为0 中间值为1 的数量
    for (let i = 1; i < m - 1; i++) {
        for (let j = 1; j < n - 1; j++) {
            // 判断当前值为0 或者当前visited的值为false 时的数量
            if (grid[i][j] === 1 && !visited[i][j]) {
                enclaves++;
            }
        }
    }
    console.log("enclaves",enclaves)
    return enclaves;
}

numEnclaves(grid)