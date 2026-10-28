import { getCategories } from "@/lib/content";
import CollectionEditor from "@/components/admin/CollectionEditor";

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  return (
    <CollectionEditor
      endpoint="/api/categories"
      items={getCategories(true) as unknown as Record<string, unknown>[]}
      addDefaults={{ name: "新分类", slug: "", description: "", color: "#C6F24E", sortOrder: 0, isVisible: 1 }}
      itemLabelKey="name"
      emptyHint="分类用于前台的作品筛选条。"
      fields={[
        { key: "name", label: "名称", type: "text", half: true },
        { key: "slug", label: "标识", type: "text", half: true, hint: "前台筛选链接使用" },
        { key: "description", label: "描述", type: "textarea" },
        { key: "color", label: "颜色", type: "color", half: true },
        { key: "sortOrder", label: "排序", type: "number", half: true },
        { key: "isVisible", label: "前台显示", type: "toggle", half: true },
      ]}
    />
  );
}
