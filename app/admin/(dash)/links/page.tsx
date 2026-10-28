import { getGlobalLinks } from "@/lib/content";
import CollectionEditor from "@/components/admin/CollectionEditor";

export const dynamic = "force-dynamic";

export default function LinksPage() {
  return (
    <CollectionEditor
      endpoint="/api/links"
      items={getGlobalLinks(true) as unknown as Record<string, unknown>[]}
      addDefaults={{
        label: "新链接",
        url: "https://",
        icon: "",
        kind: "social",
        target: "_blank",
        sortOrder: 0,
        isVisible: 1,
      }}
      itemLabelKey="label"
      emptyHint="类型选「导航」会出现在顶部悬浮胶囊导航里（地址填 #work 这样的锚点）；「社交」出现在联系区块与页脚；「普通链接」出现在页脚次要位置。"
      fields={[
        { key: "label", label: "名称", type: "text", half: true },
        { key: "url", label: "地址", type: "text", half: true, hint: "导航项可填 #work / #about / #contact" },
        {
          key: "kind",
          label: "类型",
          type: "select",
          half: true,
          options: [
            { value: "nav", label: "导航" },
            { value: "social", label: "社交" },
            { value: "link", label: "普通链接" },
          ],
        },
        {
          key: "target",
          label: "打开方式",
          type: "select",
          half: true,
          options: [
            { value: "_self", label: "当前窗口" },
            { value: "_blank", label: "新窗口" },
          ],
        },
        { key: "icon", label: "图标标识", type: "text", half: true },
        { key: "sortOrder", label: "排序", type: "number", half: true },
        { key: "isVisible", label: "前台显示", type: "toggle", half: true },
      ]}
    />
  );
}
