import React, { useEffect, useMemo, useRef } from "react";
import "./styles.css";

export default function App() {
  // 初始化的文本
  const initialValue = "[张三]去了一趟理塘，[李四]去了一趟丽江。";
  const divRef = useRef();

  useEffect(() => {
    resetDivHTML(initialValue);
  }, [initialValue]);

  // 闭包存数据
  const cacheIndex = useMemo(() => {
    let value = undefined;
    return (v) => {
      if (v !== undefined) value = v;
      else return value;
    };
  }, []);

  const dataSourceMap = { 张三: 1, 李四: 1, 小明: 1 };

  // 匹配中括号内的内容，判断是否是名称
  const isAWord = (str, allData = {}) => {
    const m = str.match(/\[(.*?)\]/)?.[1];
    if (m && allData[m]) return true;
    return false;
  };

  // 将名称用 font 包裹
  // (这位是[张三]  => 这位是<font color="#1E90FF">[张三]</font>)
  const matchColor = (text, allData) => {
    let item = "";
    let result = "";
    for (const c of text) {
      if (c === "]") {
        item += c;
        result += isAWord(item, allData)
          ? `<font color="#1E90FF">${item}</font>`
          : item;
        item = "";
      } else if (c === "[") {
        if (item) result += item;
        item = c;
      } else if (item) item += c;
      else result += c;
    }
    result += item;
    return result;
  };

  // 将纯文本数据，结构化，之后重新塞到 div 的 innerHTML 里面渲染出来
  const resetDivHTML = (v) => {
    const innerHTML = matchColor(v, dataSourceMap);
    divRef.current.innerHTML = innerHTML;
  };

  // 根据旧的锚点位置获取新的锚点 node 和 offset
  const getNewAnchorData = (oldIndex, divRef) => {
    let newAnchorNode;
    let newAnchorOffset;
    let len = 0;
    const newNodes = divRef.current.childNodes;
    newNodes.forEach((n) => {
      const { nodeName, textContent, childNodes, innerText } = n;
      const isFont = nodeName === "FONT";
      // 如果是 font 需要取 innerText
      const l = isFont ? innerText.length : textContent.length;
      if (!newAnchorNode && len + l >= oldIndex) {
        // font 需要将锚点元素设置为【第一个子元素】
        // 因为我们的层级只有简单的两级，所以就取子元素第一个就可以
        newAnchorNode = isFont ? childNodes[0] : n;
        newAnchorOffset = oldIndex - len;
      } else {
        len += l;
      }
    });
    // 没有就设置到输入的文案最末尾元素
    if (!newAnchorNode) {
      newAnchorNode = divRef.current;
      newAnchorOffset = divRef.current.childNodes.length;
    }
    return { newAnchorNode, newAnchorOffset };
  };

  // 记住此时的光标位置
  const getAnchorPosition = (divRef) => {
    const selection = window.getSelection();
    const { anchorOffset, anchorNode } = selection; // 当前光标所在的 node,以及 offset
    const divChildNodes = divRef.current.childNodes;
    let anchorIndex = 0; // 光标的位置
    for (const n of divChildNodes) {
      const { textContent = "" } = n;
      // font 元素需要用 parentNode 做匹配
      if (anchorNode === n || anchorNode.parentNode === n) {
        anchorIndex += anchorOffset;
        break;
      } else {
        anchorIndex += textContent.length;
      }
    }
    return anchorIndex;
  };

  // 先格式化整个文本，再把光标塞进去
  const onInput = (e) => {
    const newText = e.target.innerText;
    // 根据旧的 dom 结构，记住此处旧版光标的位置
    const anchorIndex = getAnchorPosition(divRef);
    // 设置将数据重新 set 进入 div，生成新的 dom 结构
    resetDivHTML(newText);
    // 根据旧的锚点位置，重新算出在此时最新的锚点应该在哪个 node 和哪个 offset
    const { newAnchorNode, newAnchorOffset } = getNewAnchorData(
      anchorIndex,
      divRef
    );

    // 将光标塞到计算出的新的位置
    const selection = window.getSelection();
    selection.removeAllRanges(); // 将现在的 selection 选区中光标的选择范围全部清除

    const range = document.createRange(); // 生成一个光标选择范围
    range.selectNodeContents(divRef.current); // 将选区设置到当前的 div
    range.collapse(true); // 折叠选取，光标处于开始位置
    range.setEnd(newAnchorNode, newAnchorOffset); // 设置光标结束点，到选区中的某个 node 的 offset 位置
    range.setStart(newAnchorNode, newAnchorOffset); // 设置开始点

    selection.addRange(range); // 将创建的新的光标 塞入当前的 selection 中
  };

  const onBlur = () => {
    const anchorIndex = getAnchorPosition(divRef);
    cacheIndex(anchorIndex);
    setTimeout(() => {
      // 1 秒之内操作，默认为是点击了名称加入到当前焦点位置
      // 1 秒之后操作，默认为加到最后，清空 focus 信息
      cacheIndex(undefined);
    }, 1000);
  };

  const onNameClick = (w) => {
    // 取出最新的文本
    const text = divRef.current.innerText || "";
    // 找到焦点位置
    const position = cacheIndex() || text.length;
    const pre = text.slice(0, position);
    const after = text.slice(position);
    // 塞入数据，组成新的文本
    const newText = `${pre}[${w}]${after}`;
    // 将新的文本放到 dom 里显示
    resetDivHTML(newText);
    // 清空焦点
    cacheIndex(null);
  };

  return (
    <div className="App" style={{ margin: "200px auto" }}>
      <div>
        {Object.keys(dataSourceMap).map((w) => (
          <button
            key={w}
            onClick={() => onNameClick(w)}
            style={{ marginLeft: "10px" }}
          >
            {w}
          </button>
        ))}
      </div>
      <div
        contentEditable
        className="inputDiv"
        placeholder="placeholder"
        ref={divRef}
        onInput={onInput}
        onBlur={onBlur}
      />
    </div>
  );
}
