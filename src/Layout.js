import React, { useState } from "react";
import { Menu, Layout } from "antd";
import EditableDiv from "./EditableDiv";

const { Sider, Content } = Layout;

function getItem(label, key, icon, children, theme) {
  return {
    key,
    icon,
    children,
    label,
    theme,
  };
}
const LayoutContent = () => {
  const [current, setCurrent] = useState("div");

  const renderMap = {
    div: {
      name: "可编辑 DIV",
      comp: <EditableDiv />,
    },
    next: {
      name: "NEXT",
      comp: <div>working...</div>,
    },
  };

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const items = Object.entries(renderMap).map((item) =>
    getItem(item[1].name, `${item[0]}`)
  );

  const Component = renderMap[current]?.comp;

  return (
    <>
      <Layout hasSider style={{ height: "100vh" }}>
        <Sider style={{ background: "#efefef" }}>
          <Menu
            defaultSelectedKeys={["div"]}
            onClick={onClick}
            style={{
              width: "100%",
              background: "#ccc",
            }}
            mode="vertical"
            items={items}
            getPopupContainer={function test(node) {
              return node.parentNode;
            }}
          />
        </Sider>
        <Content
          style={{ height: "100%", background: "#fff", padding: "24px" }}
        >
          {Component}
        </Content>
      </Layout>
    </>
  );
};
export default LayoutContent;
