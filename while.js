const arr = [2, 4, 2, 6, 7, 88, 4, 2, 3, 4, 5, 6, 1];
const arrs = [[0,1],[2,[3,4]],[5,6]]
const names = {left:'left',right:{left:'left2',right:'right'}} 
let i = 0;
// while (arr[i] < 10) {
//   console.log(i, ">>>>>");
//   i++;
// }

// const traverse = (arr, i = 0) => {
//   if (i >= arr.length) return;
//   //   console.log("arr[i]",arr[i]);
//   traverse(arr, i + 1);
//   console.log(arr[i]);
// }; // 3 2 1};traverse(arr);

// 二叉树前序
// const traverse = (root) => {
//   if (root === null) {
//     return;
//   }
//   console.log(root.val);
//   traverse(root.left);
//   traverse(root.right);
// };

// 二叉树后续
// const traverse = (root) => {
//   if (root === null) {
//     return;
//   }
//   traverse(root.left);
//   traverse(root.right);
//   console.log(root.val);
// };
// 二叉树中序
// const traverse = (root) => {
//     // console.log('arrs',root,root?.left)
//     if (root === null) {
//       return;
//     }
//     traverse(root?.left);
//     console.log(root)
//     traverse(root?.right);
//     // console.log(root.val);
//   };

const traverse = (root) => {
    if(root === undefined) return;
    // console.log('前序',root)
    traverse(root[0]);
    // console.log('root',root);
    // console.log('中序',root);
    traverse(root[1]);
    console.log('中序2',root)
    traverse(root[2]);
    // console.log('后续',root)
}
// traverse(arrs[0].names);
traverse(arrs)
console.log("arr", arr);
