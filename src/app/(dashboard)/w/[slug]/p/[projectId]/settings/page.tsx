export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = await params;
  return (
    <div>
      <div>Page: Project Settings</div>
      <div>
        Params: (slug: {slug}, projectId: {projectId})
      </div>
    </div>
  );
}
