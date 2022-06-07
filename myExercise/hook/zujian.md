// React forwardRef的使用方法及注意点

/* 下面就是应用到React组件的错误示例：

const A=React.forwardRef((props,ref)=><B {...props} ref={ref}/>)
这就是我之前经常犯的错误， 这里的ref是无法生效的。

前面提到ref必须指向dom元素，(函数组件不能直接用在引用的地方 <A />，class组件可以直接用在引用的地方 <Head ref={ref} />)
function A(){return(<div ref={ref}></div>)}
class Head extends React.Compontent{return(<div></div>)}

那么正确方法就应用而生：
const  A=React.forwardRef((props,ref)=>(
    <div ref={ref}>
        <B {...props} />
    </div>
    )) */

// React useMemo

/* 官方文档说过传入 useMemo 的函数会在渲染期间执行，所以使用useMemo就能解决之前的问题，怎么在DOM改变的时候，控制某些函数不被触发。
和useMemo相近的还有一个useCallback，只是后者返回一个函数useCallback(fn, deps) 相当于 useMemo(() => fn, deps)，这里我们返回一个memo函数

//  先执行memo 再执行dom 然后再effect 


首先DOM变化，触发name的memo，
然后触发p标签内的getProductName函数
DOM操作结束后触发name的effect
在name的effect中触发getProductName

*/
