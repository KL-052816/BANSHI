import {useEffect, useState} from 'react';
 
// 请求api方法
export function useFetcher(fn, deps) {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState({});

    useEffect(() => {
        load();
    }, deps);

    const load = (...args) => {
        setLoading(true);
        fn(...args)
            ?.then(data => {
                console.log('>>>', data);
                setResponse(data);
            })
            .finally(() => setLoading(false));
    };

    const {result} = response || {};
    const setData = obj => {
        setResponse({
            ...response,
            result: obj,
        });
    };
    return {
        loading,
        setLoading,
        data: result,
        setData,
        response,
        setResponse,
        load: load.bind(this),
    };
}

const noop = () => {};

// 拖拽功能
export function useMove(
    {domRef, offsetLeft, offsetTop, onMoveStart = noop, onMove = noop, onMoveEnd = noop} = {},
    deps = []
) {
    const [collect, setCollect] = useState({offsetLeft, offsetTop});

    useEffect(() => {
        const dom = domRef.current;
        console.log(dom);
        if (!dom) return;

        let isMoving = false;
        let se = null;
        let left = dom.offsetLeft; // 记录移动开始点 left
        let top = dom.offsetTop; // 记录移动开始点 top
        function stop(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        // 鼠标离开
        function handleLeave(e) {
            // 鼠标离开时正在移动，则结束移动
            if (isMoving) {
                isMoving = false;
                const c = {
                    isMoving,
                    offsetLeft: dom.offsetLeft,
                    offsetTop: dom.offsetTop,
                };
                setCollect(c);
                onMoveEnd({...c, origin: e});
            }
            stop(e);
        }
        dom.addEventListener('mouseleave', handleLeave);

        // 鼠标按下
        function handleDown(e) {
            isMoving = true;
            se = e;
            // 记录开始位置
            left = dom.offsetLeft;
            top = dom.offsetTop;
            const c = {isMoving, offsetLeft: left, offsetTop: top};
            onMoveStart({...c, origin: e});
            setCollect(c);
            stop(e);
        }
        dom.addEventListener('mousedown', handleDown);

        // 鼠标释放
        function handleUp(e) {
            isMoving = false;
            se = null;
            const c = {isMoving, offsetLeft: dom.offsetLeft, offsetTop: dom.offsetTop};
            onMoveEnd({...c, origin: e});
            setCollect(c);
            stop(e);
        }
        dom.addEventListener('mouseup', handleUp);

        // 鼠标移动
        function handleMove(e) {
            if (!isMoving) return;
            const offLeft = left + (e.clientX - se.clientX);
            const offTop = top + (e.clientY - se.clientY);
            const c = {isMoving, offsetLeft: offLeft, offsetTop: offTop};
            onMove({...c, origin: e});
            setCollect(c);
            stop(e);
        }
        dom.addEventListener('mousemove', handleMove);

        // 拖拽开始
        dom.addEventListener('dragstart', stop);

        // 卸载事件
        return () => {
            dom.removeEventListener('mouseleave', handleLeave);
            dom.removeEventListener('mousedown', handleDown);
            dom.removeEventListener('mouseup', handleUp);
            dom.removeEventListener('mousemove', handleMove);
            dom.removeEventListener('dragstart', stop);
        };
    }, [...deps]);

    return [collect, domRef];
}

export default {useFetcher, useMove};
