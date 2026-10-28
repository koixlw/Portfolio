import { getProfile } from "@/lib/content";
import ProfileEditor from "./ProfileEditor";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return <ProfileEditor initial={getProfile()} />;
}
