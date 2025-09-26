import { dropPropertyRefIndex } from "@/app/(actions)/drop_property_index";
import { Button } from "@/components/ui/button";

export default function DropIndexPage() {
  async function handleClick() {
    "use server";
    return await dropPropertyRefIndex();
  }

  return (
    <form action={handleClick} className="p-6">
      <Button type="submit">Drop propertyRef_1 index</Button>
    </form>
  );
}
