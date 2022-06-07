/* 这里有 n 个一样的骰子，每个骰子上都有 k 个面，分别标号为 1 到 k 。

给定三个整数 n ,  k 和 target ，返回可能的方式(从总共 kn 种方式中)滚动骰子的数量，使正面朝上的数字之和等于 target 。

答案可能很大，你需要对 109 + 7 取模 。 */

/*
输入：n = 1, k = 6, target = 3
输出：1
解释：你扔一个有6张脸的骰子。
得到3的和只有一种方法。
示例 2：

输入：n = 2, k = 6, target = 7
输出：6
解释：你扔两个骰子，每个骰子有6个面。
得到7的和有6种方法1+6 2+5 3+4 4+3 5+2 6+1。
示例 3：

输入：n = 30, k = 30, target = 500
输出：222616187
解释：返回的结果必须是对 109 + 7 取模。
*/

function dice(n,k,target){
    console.log('n,k',n,k,target)
    const narr = new Array(n).fill(1).map(()=> new Array(k).fill(1).map((it,index)=>it = index+1))
    const karr = []
    console.log('narr',narr)
    let i=0 ;
    let j= 0;
    let z=0;
    let num = 0;
    for(i=0;i<n-1;i++){
        for(j=0;j<=k;j++){
            for(z=0;z<=k;z++){
                if(karr[z]+karr[j] === target){
                    num++
                }
            }
        }
    }
    console.log('num',num)
    return num;
}

dice(30,30,500);