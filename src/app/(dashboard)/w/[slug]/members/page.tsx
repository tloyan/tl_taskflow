export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <div>Page: Workspace Members</div>
      <div>Params: (slug: {slug})</div>
    </div>
  );
}
