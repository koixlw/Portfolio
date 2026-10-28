import { getTags } from "@/lib/content";
import CollectionEditor from "@/components/admin/CollectionEditor";

export const dynamic = "force-dynamic";

export default function TagsPage() {
  return (
    <CollectionEditor
      endpoint="/api/tags"
      items={getTags() as unknown as Record<string, unknown>[]}
      addDefaults={{ name: "新标签", slug: "", color: "#8A8C90", sortOrder: 0 }}
      itemLabelKey="name"
      emptyHint="标签会显示在作品卡片上，也用于「关于」区块的能力列表。"
      fields={[
        { key: "name", label: "名称", type: "text", half: true },
        { key: "slug", label: "标识", type: "text", half: true },
        { key: "color", label: "颜色", type: "color", half: true },
        { key: "sortOrder", label: "排序", type: "number", half: true },
      ]}
    />
  );
}
